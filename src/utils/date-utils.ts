/**
 * Date formatting utilities for resume dates
 */

/**
 * Convert "January 2025" or "Jan 2025" format to "2025-01" format (for month input)
 */
export function formatDateToInput(dateString: string): string {
  if (!dateString || dateString.trim() === '') return '';
  
  // Already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Handle "January 2025" or "Jan 2025" format
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  const shortMonths = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];
  
  const parts = dateString.trim().toLowerCase().split(/\s+/);
  
  if (parts.length === 2) {
    const monthStr = parts[0];
    const year = parts[1];
    
    let monthIndex = months.indexOf(monthStr);
    if (monthIndex === -1) {
      monthIndex = shortMonths.indexOf(monthStr);
    }
    
    if (monthIndex !== -1 && /^\d{4}$/.test(year)) {
      const month = String(monthIndex + 1).padStart(2, '0');
      return `${year}-${month}`;
    }
  }
  
  return dateString; // Return as-is if can't parse
}

/**
 * Convert "2025-01" format to "January 2025" format (for display)
 */
export function formatDateToDisplay(dateString: string): string {
  if (!dateString || dateString.trim() === '') return '';
  
  // Already in readable format
  if (!/^\d{4}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  const [year, month] = dateString.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthIndex = parseInt(month, 10) - 1;
  
  if (monthIndex >= 0 && monthIndex < 12) {
    return `${monthNames[monthIndex]} ${year}`;
  }
  
  return dateString; // Return as-is if can't parse
}

/**
 * Convert date for both startDate and endDate, handling "Present" for endDate
 */
export function formatDateRangeToDisplay(startDate: string, endDate: string, isPresent?: boolean): string {
  const start = formatDateToDisplay(startDate);
  const end = isPresent ? 'Present' : formatDateToDisplay(endDate);
  
  if (!start && !end) return '';
  if (!start) return end;
  if (!end) return start;
  
  return `${start} - ${end}`;
}
