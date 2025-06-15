/**
 * Utility functions for safe date handling in the StudyOS application
 * Addresses issues with Firestore timestamps and Date object handling
 */

/**
 * Safely converts various date formats to a JavaScript Date object
 * @param dateValue - Can be a Firestore timestamp, Date object, string, or number
 * @returns A valid Date object, defaults to current date if input is invalid
 */
export function safeToDate(dateValue: any): Date {
  if (!dateValue) return new Date();
  
  // Handle Firestore timestamp objects
  if (dateValue && typeof dateValue === 'object' && dateValue.seconds !== undefined) {
    return new Date(dateValue.seconds * 1000);
  }
  
  // Handle existing Date objects
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? new Date() : dateValue;
  }
  
  // Handle string/number dates
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? new Date() : date;
}

/**
 * Safely gets the timestamp from a date value
 * @param dateValue - Any date-like value
 * @returns The timestamp in milliseconds
 */
export function safeGetTime(dateValue: any): number {
  const date = safeToDate(dateValue);
  return date.getTime();
}

/**
 * Formats a time difference as "X minutes/hours/days ago"
 * @param dateValue - The date to compare against current time
 * @returns Formatted string like "5 minutes ago"
 */
export function formatTimeAgo(dateValue: any): string {
  const now = new Date();
  const date = safeToDate(dateValue);
  const diffMs = now.getTime() - date.getTime();
  
  if (diffMs < 0) return 'just now';
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Sorts an array of objects by a date property safely
 * @param array - Array to sort
 * @param dateProperty - Property name that contains the date
 * @param direction - 'asc' for ascending, 'desc' for descending
 * @returns Sorted array
 */
export function sortByDate<T>(
  array: T[], 
  dateProperty: keyof T, 
  direction: 'asc' | 'desc' = 'desc'
): T[] {
  return array.sort((a, b) => {
    const timeA = safeGetTime(a[dateProperty]);
    const timeB = safeGetTime(b[dateProperty]);
    
    return direction === 'desc' ? timeB - timeA : timeA - timeB;
  });
}

/**
 * Creates a safe activity item with proper date handling
 * @param response - Response object from API
 * @returns ActivityItem with safely converted timestamp
 */
export function createActivityItem(response: any): any {
  return {
    id: response.id,
    studentEmail: response.studentEmail || response.submittedBy,
    studentName: response.displayName || response.studentEmail?.split('@')[0] || 'Unknown',
    action: 'completed' as const,
    assessmentTitle: response.assessmentTitle || `Day ${response.dayId}`,
    score: response.score,
    timestamp: safeToDate(response.completedAt)
  };
}