(function initMicroSlats() {
  const canvas = document.getElementById('microSlatsCanvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
  let time = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  });

  const slatSpacing = 36;
  const slatHeight = 2.5;

  function animate() {
    time += 0.02;
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    ctx.fillStyle = '#0c0d12';
    ctx.fillRect(0, 0, width, height);

    const cols = Math.ceil(width / slatSpacing);
    const rows = Math.ceil(height / slatSpacing);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * slatSpacing;
        const y = r * slatSpacing;

        const dist = Math.hypot(x - mouse.x, y - mouse.y);
        const wave = Math.sin(time + (x * 0.01) + (y * 0.01));
        const mouseEffect = Math.max(0, 1 - dist / 220);

        const slatWidth = 14 + (wave * 6) + (mouseEffect * 18);
        const opacity = 0.04 + (mouseEffect * 0.35) + ((wave + 1) * 0.03);

        ctx.fillStyle = mouseEffect > 0.1 
          ? `rgba(255, 98, 0, ${opacity})`
          : `rgba(255, 255, 255, ${opacity * 0.6})`;

        ctx.fillRect(x - slatWidth / 2, y, slatWidth, slatHeight);
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();