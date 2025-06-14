import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, collectionGroup } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('Fetching all student responses for tutor dashboard...');
    
    // Use the new global collection for tutor access
    const responsesQuery = query(
      collection(db, 'allResponses'), 
      orderBy('completedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(responsesQuery);
    console.log('Found', querySnapshot.size, 'total responses in global collection');
    
    const allResponses: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const studentEmail = data.submittedBy || data.studentId;
      
      console.log('Global response from student:', studentEmail, 'assessment:', data.assessmentTitle);
      
      allResponses.push({
        id: doc.id,
        studentEmail,
        displayName: studentEmail?.split('@')[0] || 'Unknown',
        userEmail: studentEmail, // For compatibility
        ...data
      });
    });
    
    console.log('Returning', allResponses.length, 'responses to tutor from global collection');
    return NextResponse.json({ responses: allResponses });
    
  } catch (error) {
    console.error('Error fetching tutor responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses', details: error.message }, 
      { status: 500 }
    );
  }
}