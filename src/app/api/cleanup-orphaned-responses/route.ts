import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, query } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting cleanup of orphaned student responses...');

    // 1. Get all existing assessments
    const assessmentsRef = collection(db, 'assessments');
    const assessmentsSnapshot = await getDocs(assessmentsRef);
    
    const validAssessmentIds = new Set<string>();
    assessmentsSnapshot.forEach(doc => {
      validAssessmentIds.add(doc.id);
    });
    
    console.log(`Found ${validAssessmentIds.size} valid assessments`);

    // 2. Clean up global responses
    const globalResponsesRef = collection(db, 'allResponses');
    const globalResponsesSnapshot = await getDocs(globalResponsesRef);
    
    let deletedGlobalResponses = 0;
    const orphanedStudents = new Set<string>();
    
    for (const responseDoc of globalResponsesSnapshot.docs) {
      const data = responseDoc.data();
      const assessmentId = data.assessmentId || data.dayId;
      
      if (!validAssessmentIds.has(assessmentId)) {
        console.log(`Deleting orphaned global response: ${responseDoc.id} for assessment: ${assessmentId}`);
        await deleteDoc(responseDoc.ref);
        deletedGlobalResponses++;
        
        if (data.studentEmail) {
          orphanedStudents.add(data.studentEmail);
        }
      }
    }

    console.log(`Deleted ${deletedGlobalResponses} orphaned global responses`);

    // 3. Clean up user-scoped responses for affected students
    let deletedUserResponses = 0;
    
    for (const studentEmail of orphanedStudents) {
      const userResponsesRef = collection(db, 'userResponses', studentEmail, 'responses');
      const userResponsesSnapshot = await getDocs(userResponsesRef);
      
      for (const responseDoc of userResponsesSnapshot.docs) {
        const data = responseDoc.data();
        const assessmentId = data.assessmentId || data.dayId;
        
        if (!validAssessmentIds.has(assessmentId)) {
          console.log(`Deleting orphaned user response: ${responseDoc.id} for student: ${studentEmail}`);
          await deleteDoc(responseDoc.ref);
          deletedUserResponses++;
        }
      }
    }

    console.log(`Deleted ${deletedUserResponses} orphaned user responses`);

    // 4. Clean up user analytics (optional - they'll be regenerated)
    let cleanedAnalytics = 0;
    for (const studentEmail of orphanedStudents) {
      try {
        const analyticsRef = doc(db, 'userAnalytics', studentEmail);
        await deleteDoc(analyticsRef);
        cleanedAnalytics++;
        console.log(`Cleaned analytics for: ${studentEmail}`);
      } catch (error) {
        // Analytics might not exist, that's fine
      }
    }

    return NextResponse.json({
      message: 'Cleanup completed successfully',
      summary: {
        validAssessments: validAssessmentIds.size,
        deletedGlobalResponses,
        deletedUserResponses,
        affectedStudents: orphanedStudents.size,
        cleanedAnalytics
      }
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup orphaned responses', details: error.message },
      { status: 500 }
    );
  }
}