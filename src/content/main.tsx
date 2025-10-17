console.log('[CRXJS] Content script loaded.');

document.addEventListener('mouseup', () => {
  console.log('mouseup');
  const selection = window.getSelection();
  if (selection && selection.toString().length > 0) {
    console.log('Text Selected:', selection.toString());
    
    if(selection.rangeCount === 0) {
      return;
    }
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('logo.png');
    icon.style.position = 'absolute';
    icon.style.left = `${rect.right + window.scrollX}px`;
    icon.style.top = `${rect.top + window.scrollY-30}px`;
    icon.style.width = '30px';
    icon.style.height = '30px';
    icon.style.cursor = 'pointer';
    icon.id = 'phonaify-highlight-icon';

    // Remove any existing icon
    const existingIcon = document.getElementById('phonaify-highlight-icon');
    if (existingIcon) {
      existingIcon.remove();
    }

    document.body.appendChild(icon);
  }
});

document.addEventListener('mousedown', () => {
  console.log('mousedown');
  const icon = document.getElementById('phonaify-highlight-icon');
  if (icon) {
    icon.remove();
  }
});
