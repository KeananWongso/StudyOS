import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('Fetching students from userResponses collection...');
    
    // For single-user prototype, we'll fetch all users from userResponses collection
    // In a real multi-student system, this would be more sophisticated
    const userResponsesRef = collection(db, 'userResponses');
    const q = query(userResponsesRef, limit(10)); // Limit to prevent too many results
    const querySnapshot = await getDocs(q);
    
    console.log('Found', querySnapshot.size, 'documents in userResponses collection');
    
    const students: Array<{ email: string; displayName?: string }> = [];
    
    querySnapshot.forEach((doc) => {
      const email = doc.id; // Document ID is the user email
      console.log('Found student document:', email);
      students.push({ 
        email,
        displayName: email.split('@')[0] // Use email prefix as display name
      });
    });

    console.log('Returning students:', students);
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' }, 
      { status: 500 }
    );
  }
}