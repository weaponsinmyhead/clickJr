(function () {
  const SCENES = {
    gate: {
      seed: 29,
      sky: ['#1B1236', '#4A2A72', '#B5487E', '#FF9A6A'],
      sun: '#FFE2B8', glow: 'rgba(255,170,130,0.55)', sunX: 0.5, sunY: 0.66, sunR: 0.07,
      stars: 120, clouds: 'rgba(255,190,205,0.28)',
      layers: ['#A2589A', '#7E4590', '#5D3580', '#3F2667', '#22163F'],
      horizon: 0.62, spacing: 0.075, amp: 0.2, haze: 'rgba(255,140,150,0.16)',
      trees: '#170E2C', birds: 'rgba(255,235,225,0.75)',
    },
    empleo: {
      seed: 7,
      sky: ['#231A55', '#5B3FA0', '#E2588A', '#FFA66E'],
      sun: '#FFE7BF', glow: 'rgba(255,180,120,0.6)', sunX: 0.42, sunY: 0.66, sunR: 0.06,
      stars: 90, clouds: 'rgba(255,205,215,0.3)',
      layers: ['#B4649C', '#8E4D94', '#6A3C86', '#472B6C', '#2B1E47'],
      horizon: 0.6, spacing: 0.08, amp: 0.2, haze: 'rgba(255,150,150,0.14)',
      trees: '#1C1236', birds: 'rgba(255,235,225,0.75)',
      summit: { layer: 2, x: 0.76 },
    },
    talento: {
      seed: 16,
      sky: ['#E6DFF4', '#EFE3EE', '#F7DCCF', '#FBE7DA'],
      sun: '#FFF6EA', glow: 'rgba(247,145,95,0.22)', sunX: 0.8, sunY: 0.62, sunR: 0.06,
      stars: 0, clouds: 'rgba(255,255,255,0.8)',
      layers: ['#D9CBE3', '#C2B1D6', '#A08FC0', '#6F5E9A', '#3D2E63'],
      horizon: 0.62, spacing: 0.075, amp: 0.11, haze: 'rgba(250,228,218,0.3)',
      skyline: { layer: 2, color: '#5E4C8A', windows: 'rgba(247,176,127,0.9)' },
      trees: null, birds: 'rgba(61,46,99,0.45)',
    },
  };

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function ridge(rand, n, amp) {
    const pts = new Array(n + 1).fill(0);
    pts[0] = (rand() - 0.5) * amp;
    pts[n] = (rand() - 0.5) * amp;
    let step = n;
    let d = amp;
    while (step > 1) {
      const half = step / 2;
      for (let i = half; i < n; i += step) {
        pts[i] = (pts[i - half] + pts[i + half]) / 2 + (rand() - 0.5) * d;
      }
      d *= 0.55;
      step = half;
    }
    return pts;
  }

  function cloud(ctx, x, y, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    [[0, 0, 1], [0.9, -0.35, 1.25], [1.9, -0.1, 1.05], [2.7, 0.15, 0.8], [-0.8, 0.2, 0.75]].forEach(([dx, dy, r]) => {
      ctx.moveTo(x + dx * s + r * s, y + dy * s);
      ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
    });
    ctx.fill();
  }

  function mascot(ctx, x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.25);
    ctx.beginPath();
    [[0, 0], [0, 1.15], [0.3, 0.86], [0.5, 1.28], [0.7, 1.18], [0.5, 0.78], [0.88, 0.76]]
      .forEach(([px, py], i) => (i ? ctx.lineTo(px * s, py * s) : ctx.moveTo(px * s, py * s)));
    ctx.closePath();
    ctx.fillStyle = '#EC5B4C';
    ctx.fill();
    ctx.lineWidth = s * 0.07;
    ctx.strokeStyle = '#2B1E47';
    ctx.stroke();
    ctx.fillStyle = '#FFF6EE';
    ctx.beginPath();
    ctx.arc(0.2 * s, 0.6 * s, 0.05 * s, 0, Math.PI * 2);
    ctx.arc(0.36 * s, 0.6 * s, 0.05 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.lineWidth = s * 0.045;
    ctx.strokeStyle = '#FFF6EE';
    ctx.arc(0.28 * s, 0.68 * s, 0.09 * s, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  function hazeOver(ctx, cfg, w, h, times) {
    if (times <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    for (let k = 0; k < times; k++) {
      const g = ctx.createLinearGradient(0, h * 0.35, 0, h);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(1, cfg.haze);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  function ensureCanvases(host, count) {
    while (host.children.length < count) {
      const c = document.createElement('canvas');
      c.className = 'scene-layer';
      host.append(c);
    }
    return [...host.children];
  }

  function draw(host) {
    const cfg = SCENES[host.dataset.scene];
    const total = cfg.layers.length;
    const canvases = ensureCanvases(host, total + 1);
    const box = canvases[0].getBoundingClientRect();
    if (box.width < 2 || box.height < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(box.width * dpr);
    const h = Math.round(box.height * dpr);
    const ctxs = canvases.map((c) => {
      c.width = w;
      c.height = h;
      return c.getContext('2d');
    });
    const rand = rng(cfg.seed);
    const unit = Math.min(w, h * 1.6);

    /* sky layer */
    const ctx = ctxs[0];
    const sky = ctx.createLinearGradient(0, 0, 0, h * cfg.horizon + h * 0.1);
    cfg.sky.forEach((c, i) => sky.addColorStop(i / (cfg.sky.length - 1), c));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < cfg.stars; i++) {
      ctx.globalAlpha = 0.25 + rand() * 0.7;
      ctx.fillStyle = '#FFF6EE';
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h * 0.5, (0.5 + rand() * 1.2) * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const sx = cfg.sunX * w;
    const sy = cfg.sunY * h;
    const sr = cfg.sunR * unit;
    const glow = ctx.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 5);
    glow.addColorStop(0, cfg.glow);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = cfg.sun;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 5; i++) {
      cloud(ctx, rand() * w, h * (0.14 + rand() * 0.32), unit * (0.018 + rand() * 0.02), cfg.clouds);
    }

    ctx.strokeStyle = cfg.birds;
    ctx.lineWidth = 1.6 * dpr;
    for (let i = 0; i < 5; i++) {
      const bx = sx + (rand() - 0.3) * w * 0.3;
      const by = sy - h * (0.12 + rand() * 0.2);
      const bs = unit * (0.006 + rand() * 0.006);
      ctx.beginPath();
      ctx.moveTo(bx - bs, by - bs * 0.5);
      ctx.quadraticCurveTo(bx - bs * 0.4, by - bs * 0.7, bx, by);
      ctx.quadraticCurveTo(bx + bs * 0.4, by - bs * 0.7, bx + bs, by - bs * 0.5);
      ctx.stroke();
    }
    hazeOver(ctx, cfg, w, h, total - 1);

    /* mountain layers */
    const n = 256;
    cfg.layers.forEach((color, li) => {
      const lctx = ctxs[li + 1];
      const base = h * (cfg.horizon + li * cfg.spacing);
      const amp = h * cfg.amp * (1 - li * 0.12);
      const pts = ridge(rand, n, amp);
      const ys = pts.map((p, j) => {
        let y = base + p;
        if (cfg.summit && cfg.summit.layer === li) {
          y -= h * 0.2 * Math.exp(-Math.pow((j / n - cfg.summit.x) / 0.07, 2));
        }
        return y;
      });
      const yAt = (x) => {
        const f = Math.max(0, Math.min(n, (x / w) * n));
        const i = Math.floor(f);
        return ys[i] + (ys[Math.min(n, i + 1)] - ys[i]) * (f - i);
      };

      if (cfg.skyline && cfg.skyline.layer === li) {
        let x = w * 0.04;
        while (x < w * 0.96) {
          const bw = w * (0.018 + rand() * 0.03);
          const bh = h * (0.04 + rand() * 0.16);
          const by = yAt(x + bw / 2) + h * 0.02;
          lctx.fillStyle = cfg.skyline.color;
          lctx.fillRect(x, by - bh, bw, bh + h * 0.1);
          lctx.fillStyle = cfg.skyline.windows;
          const ws = Math.max(2, bw * 0.12);
          for (let wy = by - bh + ws * 1.5; wy < by - ws; wy += ws * 2.2) {
            for (let wx = x + ws; wx < x + bw - ws; wx += ws * 2) {
              if (rand() < 0.35) lctx.fillRect(wx, wy, ws, ws);
            }
          }
          x += bw + w * (0.002 + rand() * 0.012);
        }
      }

      lctx.fillStyle = color;
      lctx.beginPath();
      lctx.moveTo(0, h);
      ys.forEach((y, j) => lctx.lineTo((j / n) * w, y));
      lctx.lineTo(w, h);
      lctx.closePath();
      lctx.fill();

      if (cfg.summit && cfg.summit.layer === li) {
        const px = cfg.summit.x * w;
        let peakY = yAt(px);
        let peakX = px;
        for (let k = -12; k <= 12; k++) {
          const xx = px + k * (w / n);
          if (yAt(xx) < peakY) { peakY = yAt(xx); peakX = xx; }
        }
        lctx.save();
        lctx.setLineDash([6 * dpr, 7 * dpr]);
        lctx.lineWidth = 2.4 * dpr;
        lctx.strokeStyle = 'rgba(255,236,220,0.8)';
        lctx.beginPath();
        const turns = 6;
        for (let t = 0; t <= turns; t++) {
          const f = t / turns;
          const xx = peakX + (t % 2 ? 1 : -1) * w * 0.05 * (1 - f);
          const yy = Math.max(peakY + (h - peakY) * 0.55 * (1 - f), yAt(xx) + 8 * dpr * (1 - f));
          if (t === 0) lctx.moveTo(xx, yy); else lctx.lineTo(xx, yy);
        }
        lctx.lineTo(peakX, peakY);
        lctx.stroke();
        lctx.restore();

        lctx.strokeStyle = '#FFF6EE';
        lctx.lineWidth = 2.5 * dpr;
        lctx.beginPath();
        lctx.moveTo(peakX, peakY);
        lctx.lineTo(peakX, peakY - unit * 0.06);
        lctx.stroke();
        lctx.fillStyle = '#F7915F';
        lctx.beginPath();
        lctx.moveTo(peakX, peakY - unit * 0.06);
        lctx.lineTo(peakX + unit * 0.04, peakY - unit * 0.05);
        lctx.lineTo(peakX, peakY - unit * 0.038);
        lctx.fill();
        mascot(lctx, peakX - unit * 0.05, peakY - unit * 0.045, unit * 0.04);
      }

      if (cfg.trees && li === total - 1) {
        lctx.fillStyle = cfg.trees;
        for (let t = 0; t < 34; t++) {
          const tx = rand() * w;
          const th = Math.min(h * (0.035 + rand() * 0.07), unit * 0.09);
          const ty = yAt(tx) + 4 * dpr;
          for (let k = 0; k < 3; k++) {
            const tw = th * (0.42 - k * 0.09);
            lctx.beginPath();
            lctx.moveTo(tx, ty - th * (0.55 + k * 0.22) - th * 0.3);
            lctx.lineTo(tx - tw / 2, ty - th * k * 0.22);
            lctx.lineTo(tx + tw / 2, ty - th * k * 0.22);
            lctx.closePath();
            lctx.fill();
          }
        }
      }

      hazeOver(lctx, cfg, w, h, total - 1 - li);
    });
  }

  const hosts = document.querySelectorAll('.scene[data-scene]');
  hosts.forEach((host) => ensureCanvases(host, SCENES[host.dataset.scene].layers.length + 1));
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver((entries) => entries.forEach((e) => draw(e.target)));
    hosts.forEach((host) => ro.observe(host));
  } else {
    const all = () => hosts.forEach(draw);
    window.addEventListener('resize', all);
    all();
  }
})();
