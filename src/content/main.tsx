/* global LanguageModel */

import React from 'react';
import { createRoot } from 'react-dom/client';
import Card from './views/Card';

console.log('[CRXJS] Content script loaded.');

document.addEventListener('mouseup', (ev) => {
  // Ignore mouseup events that originate from our injected UI
  if (ev && ev.target) {
    const t = ev.target as Node;
    const iconEl = document.getElementById('phonaify-highlight-icon');
    const cardEl = document.getElementById('phonaify-card-container');
    if ((iconEl && iconEl.contains(t)) || (cardEl && cardEl.contains(t))) {
      return;
    }
  }

  console.log('mouseup');
  const selection = window.getSelection();
  if (selection && selection.toString().length > 0) {
    console.log('Text Selected:', selection.toString());

    if (selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('logo.png');
    icon.style.position = 'absolute';
    icon.style.left = `${rect.right + window.scrollX}px`;
    icon.style.top = `${rect.top + window.scrollY - 30}px`;
    icon.style.width = '30px';
    icon.style.height = '30px';
    icon.style.cursor = 'pointer';
    icon.id = 'phonaify-highlight-icon';

    icon.addEventListener('click', async () => {
      console.log('Logo clicked!');

      // remove any existing card container
      const existingCard = document.getElementById('phonaify-card-container');
      if (existingCard) {
        existingCard.remove();
      }

      // create container for React Card
      const container = document.createElement('div');
      container.id = 'phonaify-card-container';
      container.style.position = 'absolute';
      // position it near the selection rect (to the right and slightly above)
      const left = rect.right + window.scrollX + 8; // small offset
      const top = rect.top + window.scrollY - 10; // slightly above selection
      container.style.left = `${left}px`;
      container.style.top = `${top}px`;
      container.style.zIndex = '2147483647';
      // optional: allow pointer events so user can interact
      container.style.pointerEvents = 'auto';

      document.body.appendChild(container);

      // mount React Card into the container
      try {
        const root = createRoot(container);
        const firstWord = selection.toString().split(' ')[0];
        root.render(React.createElement(Card, { selected: firstWord }));
        console.log('Just mounted Card');
      } catch (err) {
        console.error('Failed to mount Card', err);
      }
      console.log('End click');
    });

    // Remove any existing icon
    const existingIcon = document.getElementById('phonaify-highlight-icon');
    if (existingIcon) {
      existingIcon.remove();
    }

    document.body.appendChild(icon);
  }
});

document.addEventListener('mousedown', (ev) => {
  // If the mousedown originated from the injected icon or card, ignore it
  const icon = document.getElementById('phonaify-highlight-icon');
  const card = document.getElementById('phonaify-card-container');

  if (ev && ev.target) {
    const t = ev.target as Node;
    if (icon && icon.contains(t)) {
      // clicked the icon — don't remove it here; allow click to fire
      return;
    }
    if (card && card.contains(t)) {
      // interacting with the card — don't remove it
      return;
    }
  }

  // Otherwise remove icon/card
  console.log('mousedown');
  if (icon) icon.remove();
  if (card) card.remove();
});
