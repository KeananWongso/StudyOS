import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function PUT(request: NextRequest) {
  try {
    const { responseId, studentEmail, manualGrades, gradedBy, gradedAt } = await request.json();
    
    console.log('Manual grading request:', { responseId, studentEmail, manualGrades, gradedBy });
    
    if (!responseId || !studentEmail || !manualGrades) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Update both user-scoped and global response documents
    
    // 1. Update user-scoped response
    const userResponseRef = doc(db, 'userResponses', studentEmail, 'responses', responseId);
    const userResponseDoc = await getDoc(userResponseRef);
    
    if (userResponseDoc.exists()) {
      const currentData = userResponseDoc.data();
      const updatedAnswers = { ...currentData.answers };
      let newTotalScore = 0;
      
      // Apply manual grades to answers
      Object.entries(manualGrades).forEach(([questionId, gradeData]: [string, any]) => {
        if (updatedAnswers[questionId]) {
          // Update with manual grade overrides
          if (gradeData.isCorrect !== undefined) {
            updatedAnswers[questionId].isCorrect = gradeData.isCorrect;
          }
          if (gradeData.points !== undefined) {
            updatedAnswers[questionId].pointsEarned = gradeData.points;
          }
          if (gradeData.feedback) {
            updatedAnswers[questionId].tutorFeedback = gradeData.feedback;
          }
          
          // Add manual grading metadata
          updatedAnswers[questionId].manuallyGraded = true;
          updatedAnswers[questionId].gradedBy = gradedBy;
          updatedAnswers[questionId].gradedAt = gradedAt;
          
          newTotalScore += updatedAnswers[questionId].pointsEarned || 0;
        }
      });
      
      await updateDoc(userResponseRef, {
        answers: updatedAnswers,
        score: newTotalScore,
        manuallyGraded: true,
        gradedBy,
        gradedAt,
        lastModified: new Date()
      });
      
      console.log('Updated user-scoped response:', responseId);
    }
    
    // 2. Find and update global response
    // We need to find the global response by matching student email and response data
    const { collection, query, where, getDocs, doc: docRef } = await import('firebase/firestore');
    
    const globalResponsesRef = collection(db, 'allResponses');
    const globalQuery = query(
      globalResponsesRef, 
      where('studentEmail', '==', studentEmail),
      where('userDocId', '==', responseId)
    );
    
    const globalSnapshot = await getDocs(globalQuery);
    
    if (!globalSnapshot.empty) {
      const globalDoc = globalSnapshot.docs[0];
      const globalData = globalDoc.data();
      const updatedAnswers = { ...globalData.answers };
      let newTotalScore = 0;
      
      // Apply same manual grades to global response
      Object.entries(manualGrades).forEach(([questionId, gradeData]: [string, any]) => {
        if (updatedAnswers[questionId]) {
          if (gradeData.isCorrect !== undefined) {
            updatedAnswers[questionId].isCorrect = gradeData.isCorrect;
          }
          if (gradeData.points !== undefined) {
            updatedAnswers[questionId].pointsEarned = gradeData.points;
          }
          if (gradeData.feedback) {
            updatedAnswers[questionId].tutorFeedback = gradeData.feedback;
          }
          
          updatedAnswers[questionId].manuallyGraded = true;
          updatedAnswers[questionId].gradedBy = gradedBy;
          updatedAnswers[questionId].gradedAt = gradedAt;
          
          newTotalScore += updatedAnswers[questionId].pointsEarned || 0;
        }
      });
      
      await updateDoc(docRef(db, 'allResponses', globalDoc.id), {
        answers: updatedAnswers,
        score: newTotalScore,
        manuallyGraded: true,
        gradedBy,
        gradedAt,
        lastModified: new Date()
      });
      
      console.log('Updated global response:', globalDoc.id);
    }
    
    return NextResponse.json({ 
      message: 'Manual grades saved successfully',
      updatedScore: newTotalScore || 0
    });
    
  } catch (error) {
    console.error('Error saving manual grades:', error);
    return NextResponse.json(
      { error: 'Failed to save manual grades', details: error.message }, 
      { status: 500 }
    );
  }
}