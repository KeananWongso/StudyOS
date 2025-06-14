import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { SimplifiedCurriculum, SIMPLIFIED_CAMBRIDGE_CURRICULUM } from '@/lib/simplified-curriculum';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 });
    }

    // Check if user has custom curriculum, otherwise return default
    const curriculumRef = doc(db, 'curriculum', userEmail);
    const curriculumSnap = await getDoc(curriculumRef);
    
    if (curriculumSnap.exists()) {
      return NextResponse.json(curriculumSnap.data());
    } else {
      return NextResponse.json(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
    }
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json({ error: 'Failed to fetch curriculum' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 });
    }

    const curriculum: SimplifiedCurriculum = await request.json();
    
    // Validate SimplifiedCurriculum structure
    if (!curriculum.id || !curriculum.name || !curriculum.strands || !Array.isArray(curriculum.strands)) {
      return NextResponse.json({ error: 'Invalid curriculum structure' }, { status: 400 });
    }

    // Update timestamp
    curriculum.lastUpdated = new Date();

    // Save curriculum to Firestore
    const curriculumRef = doc(db, 'curriculum', userEmail);
    await setDoc(curriculumRef, curriculum);

    return NextResponse.json({ 
      success: true, 
      message: 'Curriculum saved successfully',
      curriculum 
    });
  } catch (error) {
    console.error('Error saving curriculum:', error);
    return NextResponse.json({ error: 'Failed to save curriculum' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 });
    }

    const updates = await request.json();
    
    // Update timestamp
    updates.lastUpdated = new Date();

    // Update curriculum in Firestore
    const curriculumRef = doc(db, 'curriculum', userEmail);
    await updateDoc(curriculumRef, updates);

    return NextResponse.json({ 
      success: true, 
      message: 'Curriculum updated successfully' 
    });
  } catch (error) {
    console.error('Error updating curriculum:', error);
    return NextResponse.json({ error: 'Failed to update curriculum' }, { status: 500 });
  }
}