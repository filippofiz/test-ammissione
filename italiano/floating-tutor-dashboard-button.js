// floating-back-button.js
function createFloatingBackButton(options = {}) {
  // Configurazione default
  const defaults = {
    targetUrl: 'tutor_dashboard.html', // <-- QUESTA È LA MODIFICA
    icon: '⬅',
    tooltip: 'Torna alla dashboard',
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