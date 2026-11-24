// SPDX-License-Identifier: GPL-3.0-or-later
// ClipZero — Offline Help & Guide controller (zero permissions, zero network).

'use strict';

const ext = globalThis.browser || globalThis.chrome;

const searchInputEl = document.getElementById('help-search');
const emptyNoteEl = document.getElementById('help-empty');
const sectionCards = Array.from(document.querySelectorAll('.help-item'));
const faqItems = Array.from(document.querySelectorAll('.faq-item'));

function msg(key, substitutions) {
  try {
    return ext?.i18n?.getMessage?.(key, substitutions) || '';
  } catch {
    return '';
  }
}

function applyTranslations() {
  const uiLang = ext?.i18n?.getUILanguage?.();
  if (uiLang) {
    document.documentElement.lang = uiLang;
  }
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const key = el.getAttribute('data-i18n');
    const translated = key ? msg(key) : '';
    if (translated) {
      el.textContent = translated;
    }
  }
  for (const el of document.querySelectorAll('[data-i18n-placeholder]')) {
    const key = el.getAttribute('data-i18n-placeholder');
    const translated = key ? msg(key) : '';
    if (translated) {
      el.setAttribute('placeholder', translated);
    }
  }
}

function normalizeQuery(raw) {
  return String(raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function filterHelpContent() {
  const query = normalizeQuery(searchInputEl ? searchInputEl.value : '');
  let visibleCards = 0;

  for (const card of sectionCards) {
    if (!query) {
      card.hidden = false;
      visibleCards += 1;
      continue;
    }
    const text = normalizeQuery(card.textContent);
    const matches = text.includes(query);
    card.hidden = !matches;
    if (matches) {
      visibleCards += 1;
    }
  }

  for (const item of faqItems) {
    if (!query) {
      item.hidden = false;
      continue;
    }
    const matches = normalizeQuery(item.textContent).includes(query);
    item.hidden = !matches;
    if (matches) {
      item.open = true;
    }
  }

  if (emptyNoteEl) {
    emptyNoteEl.hidden = visibleCards > 0;
  }
}

if (searchInputEl) {
  searchInputEl.addEventListener('input', filterHelpContent);
}

applyTranslations();
