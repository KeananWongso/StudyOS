import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { AssessmentData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const createdBy = searchParams.get('createdBy');
    
    console.log('Fetching assessments, filtered by createdBy:', createdBy);
    
    const assessmentsRef = collection(db, 'assessments');
    let q = query(assessmentsRef, orderBy('day', 'asc'));
    
    // If createdBy filter is provided, filter by creator
    if (createdBy) {
      q = query(assessmentsRef, orderBy('day', 'asc'));
      // Note: Firestore doesn't support combining where with orderBy on different fields
      // We'll filter in memory for now
    }
    
    const querySnapshot = await getDocs(q);
    
    let assessments: AssessmentData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      assessments.push({ id: doc.id, ...data } as AssessmentData);
    });
    
    // Filter by creator in memory if needed
    if (createdBy) {
      assessments = assessments.filter(assessment => 
        (assessment as any).createdBy === createdBy
      );
      console.log(`Filtered to ${assessments.length} assessments for creator: ${createdBy}`);
    }
    
    console.log(`Returning ${assessments.length} total assessments`);
    return NextResponse.json({ assessments });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const assessment: AssessmentData = await request.json();
    
    // Validate required fields
    if (!assessment.title || !assessment.day || !assessment.questions) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Add timestamp
    assessment.createdAt = new Date();
    
    const docRef = await addDoc(collection(db, 'assessments'), assessment);
    
    return NextResponse.json({ 
      id: docRef.id, 
      message: 'Assessment created successfully' 
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData }: { id: string } & Partial<AssessmentData> = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Assessment ID is required' }, 
        { status: 400 }
      );
    }

    const assessmentRef = doc(db, 'assessments', id);
    await updateDoc(assessmentRef, updateData);
    
    return NextResponse.json({ message: 'Assessment updated successfully' });
  } catch (error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id }: { id: string } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Assessment ID is required' }, 
        { status: 400 }
      );
    }

    console.log('Deleting assessment and all related data for ID:', id);

    // 1. Delete the assessment itself
    await deleteDoc(doc(db, 'assessments', id));
    console.log('Assessment deleted from assessments collection');

    // 2. Delete all global responses for this assessment
    const globalResponsesRef = collection(db, 'allResponses');
    const globalResponsesQuery = query(
      globalResponsesRef, 
      where('assessmentId', '==', id)
    );
    const globalResponsesSnapshot = await getDocs(globalResponsesQuery);
    
    const globalDeletePromises = globalResponsesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(globalDeletePromises);
    console.log(`Deleted ${globalResponsesSnapshot.size} global responses`);

    // 3. Delete all user-scoped responses for this assessment
    // We need to find all users who have responses for this assessment
    const userResponseDeletePromises: Promise<void>[] = [];
    
    // First, get all unique student emails from global responses before deletion
    const allUsersWithResponses = new Set<string>();
    globalResponsesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.studentEmail) {
        allUsersWithResponses.add(data.studentEmail);
      }
    });

    // Delete user-scoped responses for each student
    for (const studentEmail of allUsersWithResponses) {
      const userResponsesRef = collection(db, 'userResponses', studentEmail, 'responses');
      const userResponsesQuery = query(
        userResponsesRef,
        where('dayId', '==', id)
      );
      const userResponsesSnapshot = await getDocs(userResponsesQuery);
      
      const userDeletePromises = userResponsesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      userResponseDeletePromises.push(...userDeletePromises);
      
      console.log(`Found ${userResponsesSnapshot.size} user responses for ${studentEmail}`);
    }

    await Promise.all(userResponseDeletePromises);
    console.log(`Deleted user-scoped responses for ${allUsersWithResponses.size} students`);

    // 4. Also try alternative ID formats in case of mismatched IDs
    const altGlobalQuery = query(
      globalResponsesRef,
      where('dayId', '==', id)
    );
    const altGlobalSnapshot = await getDocs(altGlobalQuery);
    
    if (altGlobalSnapshot.size > 0) {
      const altDeletePromises = altGlobalSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(altDeletePromises);
      console.log(`Deleted ${altGlobalSnapshot.size} additional global responses with dayId match`);
    }
    
    return NextResponse.json({ 
      message: 'Assessment and all related data deleted successfully',
      deletedGlobalResponses: globalResponsesSnapshot.size + altGlobalSnapshot.size,
      affectedStudents: allUsersWithResponses.size
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment' }, 
      { status: 500 }
    );
  }
}