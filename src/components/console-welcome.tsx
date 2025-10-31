'use client';

import { useEffect } from 'react';
import { displayConsoleWelcome } from '@/lib/console-welcome';

/**
 * Client component that displays welcome message in browser console
 * Should be rendered once in the root layout
 */
export function ConsoleWelcome() {
  useEffect(() => {
    displayConsoleWelcome();
  }, []);

  return null;
}
