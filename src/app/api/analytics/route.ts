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

    // Find tutor email from assessments to load their curriculum
    let tutorEmail = null;
    
    // Try to get tutor email from global responses first
    try {
      const globalResponsesRef = collection(db, 'allResponses');
      const globalQuery = query(globalResponsesRef, orderBy('completedAt', 'desc'));
      const globalSnapshot = await getDocs(globalQuery);
      
      globalSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.studentEmail === userEmail && data.assessmentDay) {
          // Find assessment creator from assessments collection
          return; // We'll get it from assessments instead
        }
      });
    } catch (error) {
      console.log('Could not fetch global responses for tutor detection');
    }
    
    // Get tutor email from assessments collection
    try {
      const assessmentsRef = collection(db, 'assessments');
      const assessmentsSnapshot = await getDocs(assessmentsRef);
      
      assessmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdBy && !tutorEmail) {
          tutorEmail = data.createdBy;
          console.log('Found tutor email for analytics:', tutorEmail);
        }
      });
    } catch (error) {
      console.log('Could not determine tutor email, using default curriculum');
    }
    
    // Generate topic-based analytics using tutor's imported curriculum
    let analyzer;
    try {
      analyzer = tutorEmail 
        ? await TopicBasedWeaknessAnalyzer.createWithTutorCurriculum(tutorEmail)
        : new TopicBasedWeaknessAnalyzer(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
    } catch (curriculumError) {
      console.error('Error loading curriculum for analytics, using default:', curriculumError);
      analyzer = new TopicBasedWeaknessAnalyzer(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
    }
    
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
    
    let analysis;
    try {
      analysis = analyzer.analyzeStudentPerformance(convertedResponses);
      console.log('Analysis result:', analysis);
    } catch (analysisError) {
      console.error('Error during analysis, returning empty result:', analysisError);
      analysis = {
        weakTopics: [],
        strongTopics: [],
        averageAccuracy: 0,
        totalQuestionsAttempted: 0,
        recommendations: [],
        focusAreas: []
      };
    }

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

    // Find tutor email from assessments to load their curriculum  
    let tutorEmail = null;
    try {
      const assessmentsRef = collection(db, 'assessments');
      const assessmentsSnapshot = await getDocs(assessmentsRef);
      
      assessmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdBy && !tutorEmail) {
          tutorEmail = data.createdBy;
        }
      });
    } catch (error) {
      console.log('Could not determine tutor email, using default curriculum');
    }

    // Generate and save topic-based analytics using tutor's imported curriculum
    let analyzer;
    try {
      analyzer = tutorEmail 
        ? await TopicBasedWeaknessAnalyzer.createWithTutorCurriculum(tutorEmail)
        : new TopicBasedWeaknessAnalyzer(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
    } catch (curriculumError) {
      console.error('Error loading curriculum for analytics, using default:', curriculumError);
      analyzer = new TopicBasedWeaknessAnalyzer(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
    }
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