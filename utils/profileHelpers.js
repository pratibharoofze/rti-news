import { RANKS } from '../constants/profileConstants';

// Rank Functions
export function getRank(n = 0) {
  return RANKS.find((r) => n >= r.minReferrals) || RANKS[RANKS.length - 1];
}

export function getNextRank(n = 0) {
  const i = RANKS.findIndex((r) => n >= r.minReferrals);
  return i > 0 ? RANKS[i - 1] : null;
}

// Code Generation
export function generateReferralCode(email = '') {
  const hash = String(email).split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return `RTINEWS${Math.abs(hash).toString(36).toUpperCase().slice(0, 8)}`;
}

export function generateMemberId(email = '') {
  const hash = String(email).split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return `RTI${Math.abs(hash).toString(36).toUpperCase().slice(0, 10)}`;
}

// Date Formatting
export function fmt(d = new Date()) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtValidUpto(d = new Date()) {
  const n = new Date(d);
  n.setFullYear(n.getFullYear() + 1);
  return fmt(n);
}

// HTML Escaping
export function esc(v = '') {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Document Validation
export function hasDocumentSource(p) {
  return Boolean(p?.name?.trim() && p?.email?.trim());
}

// Safe File Naming
export function safeName(v = 'document') {
  return String(v || '')
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Document State Management
export function getDocumentState(v, p) {
  if (v === 'generated') return v;
  if (!hasDocumentSource(p)) return 'incomplete';
  return p?.profile_image && p?.profile_image?.trim() ? 'ready' : 'incomplete';
}
