import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorEmail = searchParams.get('tutorEmail');
    
    console.log('Fetching assessments for tutor:', tutorEmail);
    
    if (!tutorEmail) {
      // If no tutor specified, return all assessments (for student access)
      const assessmentsRef = collection(db, 'assessments');
      const q = query(assessmentsRef, orderBy('day', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const assessments: any[] = [];
      querySnapshot.forEach((doc) => {
        assessments.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`Returning ${assessments.length} total assessments for students`);
      return NextResponse.json({ assessments });
    }
    
    // Get assessments created by specific tutor
    const assessmentsRef = collection(db, 'assessments');
    
    // Use simple orderBy query to avoid index requirements
    // We'll filter by creator in memory to avoid composite index issues
    console.log('Using simple orderBy query to avoid index requirements');
    const q = query(assessmentsRef, orderBy('day', 'asc'));
    
    const querySnapshot = await getDocs(q);
    
    let assessments: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      assessments.push({ id: doc.id, ...data });
    });
    
    console.log('All assessments from DB:', assessments.map(a => ({ id: a.id, title: a.title, createdBy: a.createdBy })));
    
    // Filter by creator if we couldn't do it in the query
    if (tutorEmail) {
      const originalCount = assessments.length;
      assessments = assessments.filter(assessment => 
        assessment.createdBy === tutorEmail
      );
      console.log(`Filtered from ${originalCount} to ${assessments.length} assessments for tutor: ${tutorEmail}`);
      console.log('Matching assessments:', assessments.map(a => ({ id: a.id, title: a.title, createdBy: a.createdBy })));
    }
    
    // Get response counts for each assessment
    const responsesRef = collection(db, 'allResponses');
    const responsesSnapshot = await getDocs(responsesRef);
    
    const responseCounts = new Map();
    responsesSnapshot.forEach((doc) => {
      const data = doc.data();
      const assessmentId = data.dayId || data.assessmentId;
      
      // Count responses for multiple ID formats
      if (assessmentId) {
        responseCounts.set(assessmentId, (responseCounts.get(assessmentId) || 0) + 1);
        
        // Also count by string version if it's a number
        if (!isNaN(assessmentId)) {
          responseCounts.set(assessmentId.toString(), (responseCounts.get(assessmentId.toString()) || 0) + 1);
        }
      }
    });
    
    // Add response counts to assessments
    const assessmentsWithStats = assessments.map(assessment => {
      // Check multiple ID formats for response matching
      const assessmentResponseCount = responseCounts.get(assessment.id) || 
                                      responseCounts.get(assessment.day?.toString()) ||
                                      responseCounts.get(`day-${assessment.day}`) ||
                                      0;
      
      return {
        ...assessment,
        responseCount: assessmentResponseCount,
        isPublished: true, // All saved assessments are considered published
        status: 'published'
      };
    });
    
    console.log(`Returning ${assessmentsWithStats.length} assessments for tutor with response counts`);
    return NextResponse.json({ assessments: assessmentsWithStats });
    
  } catch (error) {
    console.error('Error fetching tutor assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments', details: error.message }, 
      { status: 500 }
    );
  }
}