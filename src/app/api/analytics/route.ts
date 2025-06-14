import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, doc, setDoc, orderBy } from 'firebase/firestore';
import { TopicBasedWeaknessAnalyzer, StudentResponse } from '@/lib/weakness-algorithm';
import { SIMPLIFIED_CAMBRIDGE_CURRICULUM } from '@/lib/simplified-curriculum';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    console.log('Analytics API called for userEmail:', userEmail);

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' }, 
        { status: 400 }
      );
    }

    // Fetch all responses for the user
    const responsesRef = collection(db, 'userResponses', userEmail, 'responses');
    const q = query(responsesRef, orderBy('completedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    console.log('Found', querySnapshot.size, 'responses for analytics');
    
    const responses: StudentResponse[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Response data structure:', data);
      responses.push({ id: doc.id, ...data } as StudentResponse);
    });

    // Generate topic-based analytics
    const analyzer = new TopicBasedWeaknessAnalyzer(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
    
    if (responses.length === 0) {
      console.log('No responses found, returning empty analysis');
      // Return empty analysis when no responses exist
      // Students should not see AI-generated recommendations without real data
      return NextResponse.json({
        weakTopics: [],
        strongTopics: [],
        averageAccuracy: 0,
        totalQuestionsAttempted: 0,
        recommendations: [],
        focusAreas: []
      });
    }
    
    console.log('Analyzing responses with analyzer...');
    
    // Convert old format to new format if needed
    const convertedResponses = responses.map(response => {
      // Convert answers from object format to array format if needed
      const answersArray = [];
      if (response.answers && typeof response.answers === 'object') {
        for (const [questionId, answer] of Object.entries(response.answers)) {
          answersArray.push({
            questionId,
            ...answer as any,
            topicPath: (answer as any).topicPath || '',
            strand: (answer as any).strand || '',
            chapter: (answer as any).chapter || '',
            subtopic: (answer as any).subtopic || ''
          });
        }
      }
      
      return {
        id: response.id || '',
        assessmentId: response.dayId || '',
        studentEmail: userEmail,
        answers: answersArray,
        completedAt: response.completedAt || new Date(),
        score: response.score || 0,
        totalPoints: 0 // Will be calculated
      };
    });
    
    console.log('Converted responses:', convertedResponses);
    
    const analysis = analyzer.analyzeStudentPerformance(convertedResponses);
    console.log('Analysis result:', analysis);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error generating analytics:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to generate analytics', details: error.message }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userEmail }: { userEmail: string } = await request.json();
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' }, 
        { status: 400 }
      );
    }

    // Fetch all responses for the user
    const responsesRef = collection(db, 'userResponses', userEmail, 'responses');
    const q = query(responsesRef, orderBy('completedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const responses: StudentResponse[] = [];
    querySnapshot.forEach((doc) => {
      responses.push({ id: doc.id, ...doc.data() } as StudentResponse);
    });

    // Generate and save topic-based analytics
    const analyzer = new TopicBasedWeaknessAnalyzer(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
    const analysis = analyzer.analyzeStudentPerformance(responses);
    
    const analyticsRef = doc(db, 'userAnalytics', userEmail);
    await setDoc(analyticsRef, analysis);
    
    return NextResponse.json({ 
      message: 'Analytics updated successfully',
      analysis 
    });
  } catch (error) {
    console.error('Error updating analytics:', error);
    return NextResponse.json(
      { error: 'Failed to update analytics' }, 
      { status: 500 }
    );
  }
}