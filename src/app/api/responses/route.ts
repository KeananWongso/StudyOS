import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { StudentResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const dayId = searchParams.get('dayId');

    console.log('GET /api/responses - userEmail:', userEmail, 'dayId:', dayId);

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' }, 
        { status: 400 }
      );
    }

    // Use user-scoped collection path
    const responsesRef = collection(db, 'userResponses', userEmail, 'responses');
    let q = query(responsesRef, orderBy('completedAt', 'desc'));

    if (dayId) {
      q = query(responsesRef, where('dayId', '==', dayId), orderBy('completedAt', 'desc'));
    }

    console.log('Querying collection path:', `userResponses/${userEmail}/responses`);
    const querySnapshot = await getDocs(q);
    console.log('Found', querySnapshot.size, 'responses for user:', userEmail);
    
    const responses: StudentResponse[] = [];
    querySnapshot.forEach((doc) => {
      console.log('Response document:', doc.id, doc.data());
      responses.push({ id: doc.id, ...doc.data() } as StudentResponse);
    });

    console.log('Returning responses:', responses);
    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { response: studentResponse, assessment } = await request.json();
    
    console.log('POST /api/responses - received data:');
    console.log('studentResponse:', studentResponse);
    console.log('assessment:', assessment);
    
    // Validate required fields
    if (!studentResponse.dayId || !studentResponse.studentId || !studentResponse.answers) {
      console.log('Missing required fields:', {
        dayId: studentResponse.dayId,
        studentId: studentResponse.studentId,
        answers: studentResponse.answers
      });
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Calculate score and enhance answers with topic information
    let earnedScore = 0;
    const enhancedAnswers: any = {};

    Object.entries(studentResponse.answers).forEach(([questionId, answer]: [string, any]) => {
      earnedScore += answer.pointsEarned;
      
      // Find the corresponding question to get topic information
      const question = assessment?.questions?.find((q: any) => q.id === questionId);
      
      enhancedAnswers[questionId] = {
        ...answer,
        // Add topic information for analysis
        topicPath: question?.topicPath,
        strand: question?.strand,
        chapter: question?.chapter,
        subtopic: question?.subtopic
      };
    });

    const enhancedResponse = {
      ...studentResponse,
      answers: enhancedAnswers,
      score: earnedScore,
      completedAt: new Date(),
      assessmentId: studentResponse.dayId // For easier lookup
    };
    
    // Save to BOTH user-scoped collection AND global collection for tutor access
    
    // 1. Save to user-scoped collection (for student dashboard)
    const userResponsesRef = collection(db, 'userResponses', studentResponse.studentId, 'responses');
    console.log('Saving to user collection:', `userResponses/${studentResponse.studentId}/responses`);
    const userDocRef = await addDoc(userResponsesRef, enhancedResponse);
    
    // 2. Save to global collection (for tutor dashboard access)
    const globalResponsesRef = collection(db, 'allResponses');
    const globalResponse = {
      ...enhancedResponse,
      userDocId: userDocRef.id, // Link to user-scoped document
      submittedBy: studentResponse.studentId,
      assessmentId: studentResponse.dayId, // Explicit assessment ID for tutor matching
      assessmentTitle: assessment?.title || `Day ${studentResponse.dayId}`,
      assessmentDay: assessment?.day || parseInt(studentResponse.dayId) || 0,
      studentEmail: studentResponse.studentId, // Add for easier filtering
      displayName: studentResponse.studentId.split('@')[0] // Add display name
    };
    console.log('Saving to global collection: allResponses');
    const globalDocRef = await addDoc(globalResponsesRef, globalResponse);
    
    console.log('Saved response with user ID:', userDocRef.id, 'and global ID:', globalDocRef.id);
    
    return NextResponse.json({ 
      id: userDocRef.id,
      globalId: globalDocRef.id,
      score: enhancedResponse.score,
      message: 'Response submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    return NextResponse.json(
      { error: 'Failed to submit response' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, userEmail, ...updateData }: { id: string; userEmail: string } & Partial<StudentResponse> = await request.json();
    
    if (!id || !userEmail) {
      return NextResponse.json(
        { error: 'Response ID and user email are required' }, 
        { status: 400 }
      );
    }

    const responseRef = doc(db, 'userResponses', userEmail, 'responses', id);
    await updateDoc(responseRef, updateData);
    
    return NextResponse.json({ message: 'Response updated successfully' });
  } catch (error) {
    console.error('Error updating response:', error);
    return NextResponse.json(
      { error: 'Failed to update response' }, 
      { status: 500 }
    );
  }
}