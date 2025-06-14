// Temporary debug script to check Firestore structure
// Run this in browser console while logged into Firebase

console.log('Checking Firestore structure for responses...');

// Check if there are any documents in userResponses collection
fetch('/api/analytics/students')
  .then(res => res.json())
  .then(data => {
    console.log('Students API response:', data);
    
    if (data.students && data.students.length > 0) {
      // Check responses for first student
      const studentEmail = data.students[0].email;
      console.log('Checking responses for:', studentEmail);
      
      return fetch(`/api/responses?userEmail=${encodeURIComponent(studentEmail)}`);
    } else {
      console.log('No students found in userResponses collection');
      return null;
    }
  })
  .then(res => res ? res.json() : null)
  .then(data => {
    if (data) {
      console.log('Responses data:', data);
    }
  })
  .catch(err => console.error('Debug error:', err));