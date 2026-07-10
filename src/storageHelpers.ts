// src/storageHelpers.ts
const STORAGE_PREFIX = 'chhipa_samaj_';

export const getCustomOptions = (key: string): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addCustomOption = (key: string, value: string) => {
  if (!value || !value.trim()) return;
  const current = getCustomOptions(key);
  const trimmed = value.trim();
  if (!current.some(item => item.toLowerCase() === trimmed.toLowerCase())) {
    current.push(trimmed);
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(current));
  }
};

export const addCustomOptions = addCustomOption; // alias