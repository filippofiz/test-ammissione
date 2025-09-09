// animated-background.js
// Background animato per Up to Ten - Test d'ingresso
// Richiama matematica, logica e pensiero critico

class AnimatedBackground {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.elements = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.init();
  }

  init() {
    // Crea il canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '0';
    
    // Inserisci dopo il body
    document.body.insertBefore(this.canvas, document.body.firstChild);
    document.body.style.position = 'relative';
    
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.createElements();
    this.animate();
    
    // Event listeners
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createElements() {
    const symbols = [
      // Matematica
      '∑', '∫', '∂', '√', 'π', '∞', 'Δ', 'θ', 'λ', 'μ',
      // Numeri e operazioni
      '+', '-', '×', '÷', '=', '≠', '≈', '<', '>', '≤', '≥',
      // Logica
      '∧', '∨', '¬', '⇒', '⇔', '∀', '∃',
      // Formule brevi
      'x²', 'y³', 'f(x)', 'log', 'sin', 'cos',
      // Numeri
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
    ];

    // Crea 40-60 elementi
    const elementCount = 40 + Math.floor(Math.random() * 20);
    
    for (let i = 0; i < elementCount; i++) {
      this.elements.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 1.5,  // Velocità triplicata
        vy: (Math.random() - 0.5) * 1.5,  // Velocità triplicata
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        size: 12 + Math.random() * 20,
        opacity: 0.1 + Math.random() * 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04  // Rotazione più veloce
      });
    }

    // Aggiungi alcune connessioni per creare un "network" di pensiero
    this.connections = [];
    for (let i = 0; i < 10; i++) {
      this.connections.push({
        from: Math.floor(Math.random() * this.elements.length),
        to: Math.floor(Math.random() * this.elements.length),
        opacity: 0.05 + Math.random() * 0.1
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Disegna le connessioni
    this.connections.forEach(conn => {
      const from = this.elements[conn.from];
      const to = this.elements[conn.to];
      
      this.ctx.beginPath();
      this.ctx.moveTo(from.x, from.y);
      this.ctx.lineTo(to.x, to.y);
      this.ctx.strokeStyle = `rgba(0, 166, 102, ${conn.opacity})`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    });
    
    // Disegna gli elementi
    this.elements.forEach(element => {
      // Movimento base
      element.x += element.vx;
      element.y += element.vy;
      
      // Attrazione leggera verso il mouse
      const dx = this.mouseX - element.x;
      const dy = this.mouseY - element.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 200) {
        const force = (200 - distance) / 200 * 0.01;  // Ridotto l'effetto mouse
        element.vx += dx / distance * force;
        element.vy += dy / distance * force;
      }
      
      // Applica un po' di "damping" per evitare velocità eccessive
      element.vx *= 0.995;  // Damping minimo per mantenere velocità
      element.vy *= 0.995;
      
      // Rimbalza sui bordi
      if (element.x < 0 || element.x > this.canvas.width) {
        element.vx = -element.vx;
        element.x = Math.max(0, Math.min(this.canvas.width, element.x));
      }
      if (element.y < 0 || element.y > this.canvas.height) {
        element.vy = -element.vy;
        element.y = Math.max(0, Math.min(this.canvas.height, element.y));
      }
      
      // Rotazione
      element.rotation += element.rotationSpeed;
      
      // Disegna il simbolo
      this.ctx.save();
      this.ctx.translate(element.x, element.y);
      this.ctx.rotate(element.rotation);
      
      // Colore con gradiente dal blu navy al verde
      const gradient = this.ctx.createLinearGradient(-element.size/2, -element.size/2, element.size/2, element.size/2);
      gradient.addColorStop(0, `rgba(28, 37, 69, ${element.opacity})`);
      gradient.addColorStop(1, `rgba(0, 166, 102, ${element.opacity})`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.font = `${element.size}px 'Courier New', monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(element.symbol, 0, 0);
      
      this.ctx.restore();
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// Inizializza automaticamente quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AnimatedBackground();
  });
} else {
  new AnimatedBackground();
}