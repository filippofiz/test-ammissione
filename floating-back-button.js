// floating-back-button.js
function createFloatingBackButton(options = {}) {
  // Configurazione default con SVG invece di emoji
  const defaults = {
    targetUrl: 'view_tests.html',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>`,
    tooltip: 'Torna alla visualizzazione test',
    onClick: null // Callback personalizzato opzionale
  };
  
  const config = { ...defaults, ...options };
  
  // Crea il bottone
  const button = document.createElement('button');
  button.className = 'floating-back-button';
  button.innerHTML = config.icon;
  button.setAttribute('data-tooltip', config.tooltip);
  button.setAttribute('aria-label', config.tooltip);
  
  // Gestione click
  button.addEventListener('click', () => {
    if (config.onClick) {
      config.onClick();
    } else {
      window.location.href = config.targetUrl;
    }
  });
  
  // Aggiungi al DOM quando la pagina è caricata
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(button);
    });
  } else {
    document.body.appendChild(button);
  }
  
  return button;
}

// Esporta per uso globale
window.createFloatingBackButton = createFloatingBackButton;