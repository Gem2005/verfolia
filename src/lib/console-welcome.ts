/**
 * Console Welcome Message
 * Displays Verfolia branding in browser console
 */

export function displayConsoleWelcome(): void {
  if (typeof window === 'undefined') return;

  const styles = {
    title: 'color: #3498DB; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(52, 152, 219, 0.3);',
    subtitle: 'color: #2C3E50; font-size: 14px; font-weight: normal;',
    link: 'color: #3498DB; font-size: 12px;',
    text: 'color: #666; font-size: 12px;',
    divider: 'color: #ddd;',
  };

  console.log(
    '%c' +
      '\n' +
      '██╗   ██╗███████╗██████╗ ███████╗ ██████╗ ██╗     ██╗ █████╗ \n' +
      '██║   ██║██╔════╝██╔══██╗██╔════╝██╔═══██╗██║     ██║██╔══██╗\n' +
      '██║   ██║█████╗  ██████╔╝█████╗  ██║   ██║██║     ██║███████║\n' +
      '╚██╗ ██╔╝██╔══╝  ██╔══██╗██╔══╝  ██║   ██║██║     ██║██╔══██║\n' +
      ' ╚████╔╝ ███████╗██║  ██║██║     ╚██████╔╝███████╗██║██║  ██║\n' +
      '  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═╝\n',
    styles.title
  );

  console.log(
    '%c📊 Your Digital Professional Identity Platform\n',
    styles.subtitle
  );

  console.log(
    '%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    styles.divider
  );

  console.log(
    '%c✨ Create beautiful resumes with real-time analytics\n' +
      '%c🔍 Track views, interactions, and engagement metrics\n' +
      '%c🎨 Choose from professional templates\n' +
      '%c🚀 AI-powered resume parsing and optimization\n',
    styles.text,
    styles.text,
    styles.text,
    styles.text
  );

  console.log(
    '%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    styles.divider
  );

  console.log(
    '%c💼 Want to build something amazing?\n' +
      '%cVisit: %chttps://verfolia.com\n' +
      '%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
    styles.text,
    styles.text,
    styles.link,
    styles.divider
  );

  // Security warning
  console.log(
    '%c⚠️  SECURITY WARNING',
    'color: #e74c3c; font-size: 16px; font-weight: bold;'
  );
  console.log(
    '%cDo not paste any code here unless you understand what it does.\n' +
      'Pasting malicious code can compromise your account and data.',
    'color: #e74c3c; font-size: 12px;'
  );
  console.log(
    '%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
    styles.divider
  );
}
