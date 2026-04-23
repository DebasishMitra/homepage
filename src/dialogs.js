export function customPrompt(message, defaultValue = '', placeholder = '') {
  return new Promise((resolve) => {
    // container
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '9999';

    const modal = document.createElement('div');
    modal.className = 'modal-content solid-panel';
    modal.style.maxWidth = '400px';
    modal.style.padding = '1.5rem';

    const title = document.createElement('h3');
    title.style.marginBottom = '1rem';
    title.textContent = message;
    
    // input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'setting-input';
    input.value = defaultValue;
    input.placeholder = placeholder || message;
    input.style.width = '100%';
    input.style.marginBottom = '1.5rem';
    
    // buttons
    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.justifyContent = 'flex-end';
    btnRow.style.gap = '0.75rem';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'waffle-btn';
    cancelBtn.style.width = 'auto';
    cancelBtn.style.padding = '0.5rem 1rem';
    cancelBtn.textContent = 'Cancel';

    const okBtn = document.createElement('button');
    okBtn.className = 'waffle-btn';
    okBtn.style.width = 'auto';
    okBtn.style.padding = '0.5rem 1rem';
    okBtn.style.background = 'var(--accent-color)';
    okBtn.style.color = '#fff';
    okBtn.style.borderColor = 'var(--accent-color)';
    okBtn.textContent = 'OK';

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(okBtn);

    modal.appendChild(title);
    modal.appendChild(input);
    modal.appendChild(btnRow);
    overlay.appendChild(modal);

    document.body.appendChild(overlay);
    
    input.focus();

    const close = (val) => {
      document.body.removeChild(overlay);
      resolve(val);
    };

    cancelBtn.addEventListener('click', () => close(null));
    okBtn.addEventListener('click', () => close(input.value));
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') close(input.value);
      if (e.key === 'Escape') close(null);
    });
  });
}

export function customConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '9999';

    const modal = document.createElement('div');
    modal.className = 'modal-content solid-panel';
    modal.style.maxWidth = '400px';
    modal.style.padding = '1.5rem';

    const title = document.createElement('p');
    title.style.marginBottom = '1.5rem';
    title.style.fontSize = '1.1rem';
    title.textContent = message;
    
    // buttons
    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.justifyContent = 'flex-end';
    btnRow.style.gap = '0.75rem';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'waffle-btn';
    cancelBtn.style.width = 'auto';
    cancelBtn.style.padding = '0.5rem 1rem';
    cancelBtn.textContent = 'Cancel';

    const okBtn = document.createElement('button');
    okBtn.className = 'waffle-btn';
    okBtn.style.width = 'auto';
    okBtn.style.padding = '0.5rem 1rem';
    okBtn.style.background = '#ef4444'; 
    okBtn.style.color = '#fff';
    okBtn.style.borderColor = '#ef4444';
    okBtn.textContent = 'Confirm';

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(okBtn);

    modal.appendChild(title);
    modal.appendChild(btnRow);
    overlay.appendChild(modal);

    document.body.appendChild(overlay);

    const close = (val) => {
      document.body.removeChild(overlay);
      resolve(val);
    };

    cancelBtn.addEventListener('click', () => close(false));
    okBtn.addEventListener('click', () => close(true));
  });
}
