import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { tutorEmail } = await request.json();
    
    if (!tutorEmail) {
      return NextResponse.json(
        { error: 'Tutor email is required' },
        { status: 400 }
      );
    }

    console.log('Cleaning up dashboard data for tutor:', tutorEmail);

    // Get all assessments created by this tutor
    const assessmentsRef = collection(db, 'assessments');
    const assessmentsQuery = query(assessmentsRef, where('createdBy', '==', tutorEmail));
    const assessmentsSnapshot = await getDocs(assessmentsQuery);
    
    const validAssessmentIds = new Set(assessmentsSnapshot.docs.map(doc => doc.id));
    console.log('Valid assessment IDs:', Array.from(validAssessmentIds));

    // Clean up orphaned global responses
    const globalResponsesRef = collection(db, 'allResponses');
    const globalResponsesSnapshot = await getDocs(globalResponsesRef);
    
    let cleanedGlobalResponses = 0;
    const globalCleanupPromises: Promise<void>[] = [];

    globalResponsesSnapshot.forEach(doc => {
      const data = doc.data();
      const assessmentId = data.assessmentId || data.dayId;
      
      // If this response is for an assessment that no longer exists
      if (assessmentId && !validAssessmentIds.has(assessmentId)) {
        console.log('Cleaning up orphaned global response:', doc.id, 'for assessment:', assessmentId);
        globalCleanupPromises.push(deleteDoc(doc.ref));
        cleanedGlobalResponses++;
      }
    });

    await Promise.all(globalCleanupPromises);
    console.log(`Cleaned up ${cleanedGlobalResponses} orphaned global responses`);

    // Clean up orphaned user responses
    // Get all students who have submitted to this tutor
    const studentsWithResponses = new Set<string>();
    assessmentsSnapshot.forEach(doc => {
      // We'll check each student's responses in the next step
    });

    // Find all global responses for valid assessments to get student emails
    const validGlobalResponsesSnapshot = await getDocs(globalResponsesRef);
    validGlobalResponsesSnapshot.forEach(doc => {
      const data = doc.data();
      const assessmentId = data.assessmentId || data.dayId;
      if (validAssessmentIds.has(assessmentId) && data.studentEmail) {
        studentsWithResponses.add(data.studentEmail);
      }
    });

    console.log('Students with valid responses:', Array.from(studentsWithResponses));

    // Clean up user-scoped responses for each student
    let cleanedUserResponses = 0;
    for (const studentEmail of studentsWithResponses) {
      try {
        const userResponsesRef = collection(db, 'userResponses', studentEmail, 'responses');
        const userResponsesSnapshot = await getDocs(userResponsesRef);
        
        const userCleanupPromises: Promise<void>[] = [];
        userResponsesSnapshot.forEach(doc => {
          const data = doc.data();
          const assessmentId = data.assessmentId || data.dayId;
          
          // If this response is for an assessment that no longer exists
          if (assessmentId && !validAssessmentIds.has(assessmentId)) {
            console.log('Cleaning up orphaned user response:', doc.id, 'for student:', studentEmail);
            userCleanupPromises.push(deleteDoc(doc.ref));
            cleanedUserResponses++;
          }
        });

        await Promise.all(userCleanupPromises);
      } catch (error) {
        console.warn('Could not clean user responses for:', studentEmail, error);
      }
    }

    console.log(`Cleaned up ${cleanedUserResponses} orphaned user responses`);

    return NextResponse.json({
      message: 'Dashboard data cleanup completed',
      cleaned: {
        globalResponses: cleanedGlobalResponses,
        userResponses: cleanedUserResponses,
        validAssessments: validAssessmentIds.size
      }
    });

  } catch (error) {
    console.error('Error cleaning up dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup dashboard data' },
      { status: 500 }
    );
  }
}