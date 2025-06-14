import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, collectionGroup } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('Fetching tutor overview data...');
    
    // Get all assessments
    const assessmentsRef = collection(db, 'assessments');
    const assessmentsQuery = query(assessmentsRef, orderBy('day', 'asc'));
    const assessmentsSnapshot = await getDocs(assessmentsQuery);
    
    const assessments: any[] = [];
    assessmentsSnapshot.forEach((doc) => {
      assessments.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('Found', assessments.length, 'assessments');
    
    // Get all student responses from global collection
    const responsesQuery = query(
      collection(db, 'allResponses'), 
      orderBy('completedAt', 'desc')
    );
    
    const responsesSnapshot = await getDocs(responsesQuery);
    console.log('Found', responsesSnapshot.size, 'total responses in global collection');
    
    const responses: any[] = [];
    const studentStats = new Map();
    
    responsesSnapshot.forEach((doc) => {
      const data = doc.data();
      const studentEmail = data.submittedBy || data.studentId;
      
      const response = {
        id: doc.id,
        studentEmail,
        displayName: studentEmail?.split('@')[0] || 'Unknown',
        ...data
      };
      
      responses.push(response);
      
      // Track student statistics
      if (!studentStats.has(studentEmail)) {
        studentStats.set(studentEmail, {
          email: studentEmail,
          displayName: studentEmail.split('@')[0],
          totalResponses: 0,
          totalScore: 0,
          completedAssessments: new Set()
        });
      }
      
      const stats = studentStats.get(studentEmail);
      stats.totalResponses++;
      stats.totalScore += data.score || 0;
      stats.completedAssessments.add(data.dayId || data.assessmentId);
    });
    
    // Convert student stats to array with averages
    const students = Array.from(studentStats.values()).map(stats => ({
      ...stats,
      completedAssessments: stats.completedAssessments.size,
      averageScore: stats.totalResponses > 0 ? Math.round(stats.totalScore / stats.totalResponses) : 0
    }));
    
    console.log('Student statistics:', students);
    
    // Calculate assessment completion rates
    const assessmentStats = assessments.map(assessment => {
      const completions = responses.filter(r => 
        r.dayId === assessment.id || r.assessmentId === assessment.id
      );
      
      return {
        ...assessment,
        completionCount: completions.length,
        averageScore: completions.length > 0 
          ? Math.round(completions.reduce((sum, r) => sum + (r.score || 0), 0) / completions.length)
          : 0
      };
    });
    
    const result = {
      assessments: assessmentStats,
      responses,
      students,
      summary: {
        totalAssessments: assessments.length,
        totalResponses: responses.length,
        totalStudents: students.length,
        averageCompletionRate: assessments.length > 0 
          ? Math.round((responses.length / (assessments.length * Math.max(students.length, 1))) * 100)
          : 0
      }
    };
    
    console.log('Returning overview result:', result);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error fetching tutor overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview data', details: error.message }, 
      { status: 500 }
    );
  }
}