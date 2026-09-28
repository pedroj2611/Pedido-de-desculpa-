/**
 * fireworks.js - Motor de Fogos de Artifício e Chuva de Corações em HTML5 Canvas
 * 100% autônomo, sem bibliotecas externas.
 */

class FireworksDisplay {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.fireworks = [];
    this.particles = [];
    this.floatingHearts = [];
    this.isRunning = false;
    this.animationFrameId = null;
    this.launchInterval = null;

    this.colors = [
      '#ff2a6d', '#ff6b8b', '#ff758c', '#ff8da1',
      '#ffbe0b', '#fb5607', '#ff006e', '#8338ec',
      '#3a86ff', '#00f5d4', '#fee440', '#ffffff'
    ];

    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.loop = this.loop.bind(this);
    window.addEventListener('resize', this.resizeCanvas);
    this.resizeCanvas();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  random(min, max) {
    return Math.random() * (max - min) + min;
  }

  createFirework(targetX, targetY, isHeartShape = false) {
    const startX = this.random(this.canvas.width * 0.15, this.canvas.width * 0.85);
    const startY = this.canvas.height;
    const destX = targetX !== undefined ? targetX : this.random(this.canvas.width * 0.1, this.canvas.width * 0.9);
    const destY = targetY !== undefined ? targetY : this.random(this.canvas.height * 0.1, this.canvas.height * 0.45);

    const color = this.colors[Math.floor(Math.random() * this.colors.length)];

    this.fireworks.push({
      x: startX,
      y: startY,
      startX: startX,
      startY: startY,
      targetX: destX,
      targetY: destY,
      distanceToTarget: Math.hypot(destX - startX, destY - startY),
      distanceTraveled: 0,
      coordinates: [],
      coordinateCount: 3,
      angle: Math.atan2(destY - startY, destX - startX),
      speed: 2,
      acceleration: 1.05,
      brightness: this.random(50, 70),
      color: color,
      isHeartShape: isHeartShape
    });
  }

  createHeartExplosion(x, y, baseColor) {
    const particleCount = 70;
    for (let i = 0; i < particleCount; i++) {
      const t = (Math.PI * 2 / particleCount) * i;
      // Parametric formula for 2D heart
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      
      const speed = this.random(0.18, 0.25);
      this.particles.push({
        x: x,
        y: y,
        coordinates: [],
        coordinateCount: 4,
        vx: hx * speed,
        vy: hy * speed,
        friction: 0.96,
        gravity: 0.2,
        color: baseColor || '#ff2a6d',
        alpha: 1,
        decay: this.random(0.008, 0.018),
        size: this.random(2, 3.5),
        isHeart: true
      });
    }
  }

  createCircularExplosion(x, y, color) {
    const particleCount = 60;
    for (let i = 0; i < particleCount; i++) {
      const angle = this.random(0, Math.PI * 2);
      const speed = this.random(2, 7.5);
      this.particles.push({
        x: x,
        y: y,
        coordinates: [],
        coordinateCount: 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        friction: 0.95,
        gravity: 0.5,
        color: color,
        alpha: 1,
        decay: this.random(0.012, 0.024),
        size: this.random(1.5, 3.5),
        isHeart: false
      });
    }
  }

  spawnFloatingHeart() {
    this.floatingHearts.push({
      x: this.random(20, this.canvas.width - 20),
      y: this.canvas.height + 20,
      size: this.random(14, 28),
      speedY: this.random(1.2, 2.5),
      speedX: this.random(-0.5, 0.5),
      rotation: this.random(-0.2, 0.2),
      alpha: this.random(0.6, 0.95),
      color: ['#ff4b72', '#ff758c', '#ff2a6d', '#ff9a9e'][Math.floor(Math.random() * 4)]
    });
  }

  drawHeartPath(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 30, size / 30);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10, -12, -22, -4, -22, 10);
    ctx.bezierCurveTo(-22, 24, -10, 36, 0, 48);
    ctx.bezierCurveTo(10, 36, 22, 24, 22, 10);
    ctx.bezierCurveTo(22, -4, 10, -12, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.resizeCanvas();

    // Initial blast
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (!this.isRunning) return;
        const isHeart = i % 2 === 0;
        this.createFirework(
          this.canvas.width * (0.25 + i * 0.18),
          this.canvas.height * (0.2 + (i % 2) * 0.15),
          isHeart
        );
      }, i * 320);
    }

    // Continuous launches
    this.launchInterval = setInterval(() => {
      if (!this.isRunning) return;
      const isHeart = Math.random() > 0.45;
      this.createFirework(undefined, undefined, isHeart);

      // Spawn background hearts
      if (Math.random() > 0.3) {
        this.spawnFloatingHeart();
      }
    }, 450);

    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.launchInterval) {
      clearInterval(this.launchInterval);
      this.launchInterval = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.fireworks = [];
    this.particles = [];
    this.floatingHearts = [];
  }

  loop() {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame(this.loop);

    // Trail effect with semi-transparent clear
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'lighter';

    // Update & draw fireworks
    let i = this.fireworks.length;
    while (i--) {
      const fw = this.fireworks[i];

      fw.coordinates.unshift([fw.x, fw.y]);
      if (fw.coordinates.length > fw.coordinateCount) {
        fw.coordinates.pop();
      }

      fw.speed *= fw.acceleration;
      const vx = Math.cos(fw.angle) * fw.speed;
      const vy = Math.sin(fw.angle) * fw.speed;
      fw.distanceTraveled = Math.hypot(fw.startX - fw.x, fw.startY - fw.y);

      if (fw.distanceTraveled >= fw.distanceToTarget) {
        if (fw.isHeartShape) {
          this.createHeartExplosion(fw.targetX, fw.targetY, fw.color);
        } else {
          this.createCircularExplosion(fw.targetX, fw.targetY, fw.color);
        }
        this.fireworks.splice(i, 1);
      } else {
        fw.x += vx;
        fw.y += vy;

        // Draw trail
        this.ctx.beginPath();
        const lastCoord = fw.coordinates[fw.coordinates.length - 1] || [fw.x, fw.y];
        this.ctx.moveTo(lastCoord[0], lastCoord[1]);
        this.ctx.lineTo(fw.x, fw.y);
        this.ctx.strokeStyle = fw.color;
        this.ctx.lineWidth = 2.5;
        this.ctx.stroke();
      }
    }

    // Update & draw particles
    let j = this.particles.length;
    while (j--) {
      const p = this.particles[j];

      p.coordinates.unshift([p.x, p.y]);
      if (p.coordinates.length > p.coordinateCount) {
        p.coordinates.pop();
      }

      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= p.decay) {
        this.particles.splice(j, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;

      if (p.isHeart) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.beginPath();
        const prevCoord = p.coordinates[p.coordinates.length - 1] || [p.x, p.y];
        this.ctx.moveTo(prevCoord[0], prevCoord[1]);
        this.ctx.lineTo(p.x, p.y);
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = p.size;
        this.ctx.stroke();
      }
      this.ctx.restore();
    }

    // Update & draw floating hearts
    this.ctx.globalCompositeOperation = 'source-over';
    let h = this.floatingHearts.length;
    while (h--) {
      const heart = this.floatingHearts[h];
      heart.y -= heart.speedY;
      heart.x += heart.speedX;

      if (heart.y < -40) {
        this.floatingHearts.splice(h, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = heart.alpha;
      this.ctx.fillStyle = heart.color;
      this.drawHeartPath(this.ctx, heart.x, heart.y, heart.size);
      this.ctx.restore();
    }
  }
}

window.FireworksDisplay = FireworksDisplay;
