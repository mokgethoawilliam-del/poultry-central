export const safeText = (value, fallback = '') => {
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    return value.map((item) => safeText(item)).filter(Boolean).join(' ');
  }
  if (value && typeof value === 'object') {
    return (
      safeText(value.text) ||
      safeText(value.title) ||
      safeText(value.value) ||
      safeText(value.label) ||
      safeText(value.name) ||
      fallback
    );
  }
  return fallback;
};

export const safeSlug = (value, fallback = 'new-dawn') => {
  const text = safeText(value, fallback).toLowerCase();
  return text
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || fallback;
};

export const firstLetter = (value, fallback = 'N') => safeText(value, fallback).charAt(0).toUpperCase();

export const phoneDigits = (value, fallback = '27150040130') =>
  safeText(value, fallback).replace(/[^0-9]/g, '') || fallback;
