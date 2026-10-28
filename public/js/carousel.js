class CircularCarousel {
  constructor(containerId, items, onActiveChange) {
    this.container = document.getElementById(containerId);
    this.items = items;
    this.onActiveChange = onActiveChange;
    this.angle = 0;
    this.radius = 420;
    this.isDragging = false;
    this.startX = 0;
    this.velocity = 0;
    this.autoRotateSpeed = -0.15;
    this.currentIndex = 0;
    this.ring = null;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="carousel-stage">
        <div class="carousel-ring" id="ring3D"></div>
      </div>
    `;
    this.ring = document.getElementById('ring3D');
    this.numItems = this.items.length;
    this.angleStep = 360 / this.numItems;

    this.items.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'carousel-item group';
      el.dataset.index = idx;
      el.innerHTML = `
        <img src="${item.poster}" class="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition duration-300">
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
          <span class="text-xs font-bold text-brand-400"><i class="fa-solid fa-star text-amber-400"></i> ${item.rating}</span>
          <h4 class="font-bold text-sm text-white truncate">${item.title}</h4>
        </div>
      `;
      el.addEventListener('click', () => this.rotateToIndex(idx));
      this.ring.appendChild(el);
    });

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const stage = this.container.querySelector('.carousel-stage');

    stage.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startX = e.clientX;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const delta = e.clientX - this.startX;
      this.velocity = delta * 0.18;
      this.angle += this.velocity;
      this.startX = e.clientX;
    });

    window.addEventListener('mouseup', () => { this.isDragging = false; });

    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.velocity += e.deltaY * 0.04;
    }, { passive: false });
  }

  rotateToIndex(index) {
    const targetAngle = -index * this.angleStep;
    let diff = (targetAngle - this.angle) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    this.angle += diff;
  }

  render() {
    if (!this.isDragging) {
      this.velocity *= 0.92;
      this.angle += this.velocity + this.autoRotateSpeed;
    }

    this.ring.style.transform = `rotateY(${this.angle}deg)`;

    const normalizedAngle = (-this.angle % 360 + 360) % 360;
    const activeIdx = Math.round(normalizedAngle / this.angleStep) % this.numItems;

    if (activeIdx !== this.currentIndex) {
      this.currentIndex = activeIdx;
      if (this.onActiveChange) this.onActiveChange(this.items[activeIdx]);
    }

    const cards = this.ring.children;
    for (let i = 0; i < cards.length; i++) {
      const cardAngle = i * this.angleStep;
      cards[i].style.transform = `rotateY(${cardAngle}deg) translateZ(${this.radius}px)`;

      let relAngle = Math.abs((cardAngle - normalizedAngle + 180) % 360 - 180);
      let depthAlpha = Math.max(0.2, 1 - (relAngle / 180) * 0.85);
      let blur = (relAngle / 180) * 4;

      cards[i].style.opacity = depthAlpha;
      cards[i].style.filter = `blur(${blur}px) brightness(${depthAlpha})`;
      cards[i].classList.toggle('active-front', i === activeIdx);
    }

    requestAnimationFrame(() => this.render());
  }
}