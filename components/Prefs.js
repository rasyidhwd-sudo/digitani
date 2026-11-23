'use client';
import { useEffect } from 'react';
export default function Prefs() {
  useEffect(() => { try { document.documentElement.style.fontSize = localStorage.getItem('dt-size') === 'besar' ? '18px' : ''; } catch {} }, []);
  return null;
}
