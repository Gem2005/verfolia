/**
 * Grade formatting utilities for education section
 */

/**
 * Detect grade type and format it with appropriate label
 * Examples:
 * - "3.8/4.0" → "GPA: 3.8/4.0"
 * - "8.5/10" → "CGPA: 8.5/10"
 * - "3.8/10" → "CGPA: 3.8/10"
 * - "4.5/5.0" → "GPA: 4.5/5.0"
 * - "85%" → "Percentage: 85%"
 * - "8%" → "Percentage: 8%"
 * - "A+" → "Grade: A+"
 * - "3.8" (no scale) → "3.8" (shown as-is, user should add scale)
 */
export function formatGradeDisplay(grade: string): string {
  if (!grade || grade.trim() === '') return '';
  
  const trimmedGrade = grade.trim();
  
  // Check if it's a percentage (contains %)
  if (trimmedGrade.includes('%')) {
    return `Percentage: ${trimmedGrade}`;
  }
  
  // Check if it's a letter grade (A, B, C, etc. with optional +/-)
  if (/^[A-F][+-]?$/i.test(trimmedGrade)) {
    return `Grade: ${trimmedGrade}`;
  }
  
  // Check if it contains a slash (scale notation like 3.8/4.0 or 8.5/10)
  if (trimmedGrade.includes('/')) {
    const parts = trimmedGrade.split('/');
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    
    if (!isNaN(numerator) && !isNaN(denominator)) {
      // Determine label based on denominator (scale)
      if (denominator >= 3.0 && denominator <= 5.0) {
        // 4.0 or 5.0 scale - GPA system
        return `GPA: ${trimmedGrade}`;
      }
      // 10.0 scale - CGPA system
      if (denominator >= 9.0 && denominator <= 10.0) {
        return `CGPA: ${trimmedGrade}`;
      }
      // 100 scale - percentage format
      if (denominator === 100) {
        return `Percentage: ${numerator}%`;
      }
      // Otherwise, show as-is (unknown scale)
      return trimmedGrade;
    }
  }
  
  // Plain number without scale - intelligently add scale based on value
  const numericValue = parseFloat(trimmedGrade);
  if (!isNaN(numericValue)) {
    // Percentage range (typically 50-100, but can be lower)
    if (numericValue >= 50 && numericValue <= 100 && !trimmedGrade.includes('.')) {
      return `Percentage: ${trimmedGrade}%`;
    }
    
    // CGPA range (0-10 scale)
    if (numericValue >= 0 && numericValue <= 10) {
      return `CGPA: ${trimmedGrade}/10`;
    }
    
    // GPA range (0-5 scale) - falls through from CGPA since CGPA includes this range
    // This shouldn't be reached, but keep as fallback
    if (numericValue >= 0 && numericValue <= 5) {
      return `GPA: ${trimmedGrade}/4.0`;
    }
    
    // Otherwise return as-is without label
    return trimmedGrade;
  }
  
  // Default: return as is if we can't determine the type
  return trimmedGrade;
}

/**
 * Format degree with field for display
 * Examples:
 * - "B.Tech", "Computer Science" → "B.Tech in Computer Science"
 * - "High School Diploma", "" → "High School Diploma"
 */
export function formatDegreeDisplay(degree: string, field?: string | null): string {
  if (!degree || degree.trim() === '') return '';
  const trimmedDegree = degree.trim();
  const trimmedField = field?.trim();
  if (trimmedField && trimmedField.length > 0) return `${trimmedDegree} in ${trimmedField}`;
  return trimmedDegree;
}
