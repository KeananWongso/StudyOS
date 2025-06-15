import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorEmail = searchParams.get('tutorEmail');
    const submissionId = searchParams.get('submissionId');
    
    // Handle individual submission request
    if (submissionId) {
      console.log('Loading individual submission:', submissionId);
      const { doc, getDoc } = await import('firebase/firestore');
      const submissionRef = doc(db, 'allResponses', submissionId);
      const submissionDoc = await getDoc(submissionRef);
      
      if (!submissionDoc.exists()) {
        return NextResponse.json(
          { error: 'Submission not found' },
          { status: 404 }
        );
      }
      
      const submissionData = { id: submissionDoc.id, ...submissionDoc.data() };
      return NextResponse.json({ submission: submissionData });
    }
    
    if (!tutorEmail) {
      return NextResponse.json(
        { error: 'Tutor email is required' },
        { status: 400 }
      );
    }

    console.log('Loading review queue for tutor:', tutorEmail);

    // Get all responses from global collection
    const globalResponsesRef = collection(db, 'allResponses');
    const responsesQuery = query(
      globalResponsesRef,
      orderBy('completedAt', 'desc')
    );
    
    const responsesSnapshot = await getDocs(responsesQuery);
    
    // Get all assessments to filter by creator
    const assessmentsRef = collection(db, 'assessments');
    const assessmentsSnapshot = await getDocs(assessmentsRef);
    
    // Create map of tutor's assessments
    const tutorAssessments = new Map();
    assessmentsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.createdBy === tutorEmail) {
        tutorAssessments.set(doc.id, {
          id: doc.id,
          title: data.title,
          day: data.day,
          questions: data.questions
        });
      }
    });

    console.log(`Found ${tutorAssessments.size} assessments created by tutor`);

    // Filter responses for tutor's assessments and format for review queue
    const submissions: any[] = [];
    
    responsesSnapshot.forEach(doc => {
      const data = doc.data();
      const assessmentId = data.assessmentId || data.dayId;
      
      if (tutorAssessments.has(assessmentId)) {
        const assessment = tutorAssessments.get(assessmentId);
        
        submissions.push({
          id: doc.id,
          studentEmail: data.studentEmail || data.submittedBy,
          studentName: data.displayName || data.studentEmail?.split('@')[0] || 'Unknown Student',
          assessmentId,
          assessmentTitle: `Day ${assessment.day}: ${assessment.title}`,
          submittedAt: data.completedAt?.toDate ? data.completedAt.toDate() : new Date(data.completedAt),
          status: data.status || 'pending', // Default to pending for existing submissions
          questionCount: Object.keys(data.answers || {}).length,
          timeSpent: data.timeSpent || 0,
          answers: data.answers,
          canvasDrawings: data.canvasDrawings || {}
        });
      }
    });

    // Sort by submission time (newest first)
    submissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

    console.log(`Returning ${submissions.length} submissions for review queue`);

    return NextResponse.json({
      submissions,
      tutorAssessmentCount: tutorAssessments.size
    });

  } catch (error) {
    console.error('Error loading review queue:', error);
    return NextResponse.json(
      { error: 'Failed to load review queue', details: error.message },
      { status: 500 }
    );
  }
}

// Update submission status (start review, complete review, etc.)
export async function PUT(request: NextRequest) {
  try {
    const { submissionId, status, reviewedBy, tutorFeedback, totalScore } = await request.json();
    
    if (!submissionId || !status) {
      return NextResponse.json(
        { error: 'Submission ID and status are required' },
        { status: 400 }
      );
    }

    console.log(`Updating submission ${submissionId} status to ${status}`);

    // Update global response
    const { doc, updateDoc } = await import('firebase/firestore');
    const globalResponseRef = doc(db, 'allResponses', submissionId);
    
    const updateData: any = {
      status,
      lastModified: new Date()
    };

    if (status === 'in_review') {
      updateData.reviewStartedAt = new Date();
      updateData.reviewedBy = reviewedBy;
    }

    if (status === 'completed') {
      updateData.reviewCompletedAt = new Date();
      updateData.tutorFeedback = tutorFeedback;
      updateData.totalScore = totalScore;
      updateData.feedbackSentAt = new Date();
    }

    await updateDoc(globalResponseRef, updateData);

    // Also update user-scoped response if we can find it
    try {
      const globalDoc = await import('firebase/firestore').then(m => m.getDoc(globalResponseRef));
      if (globalDoc.exists()) {
        const globalData = globalDoc.data();
        const studentEmail = globalData.studentEmail || globalData.submittedBy;
        const userDocId = globalData.userDocId;
        
        if (studentEmail && userDocId) {
          const userResponseRef = doc(db, 'userResponses', studentEmail, 'responses', userDocId);
          await updateDoc(userResponseRef, updateData);
        }
      }
    } catch (userUpdateError) {
      console.warn('Could not update user-scoped response:', userUpdateError);
      // Continue anyway, global update is more important
    }

    return NextResponse.json({
      message: 'Submission status updated successfully',
      submissionId,
      status
    });

  } catch (error) {
    console.error('Error updating submission status:', error);
    return NextResponse.json(
      { error: 'Failed to update submission status' },
      { status: 500 }
    );
  }
}