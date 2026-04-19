/* =========================================================
   LOADER — animated character reveal + spinning gem
   ========================================================= */
(function() {
  // Animate loader title chars
  const nameEl = document.getElementById('loader-name');
  'Yash Patil'.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.textContent = ch === ' ' ? '\u00a0' : ch;
    span.style.animationDelay = (i * 0.05 + 0.2) + 's';
    nameEl.appendChild(span);
  });

  const lc = document.getElementById('loader-canvas');
  const lr = new THREE.WebGLRenderer({ canvas: lc, alpha: true, antialias: true });
  lr.setSize(160, 160); lr.setPixelRatio(window.devicePixelRatio);
  const ls = new THREE.Scene();
  const lca = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  lca.position.z = 4.5;

  const lg = new THREE.OctahedronGeometry(1.5, 0);
  const lm1 = new THREE.MeshBasicMaterial({ color: 0xe8a832, wireframe: true, transparent: true, opacity: 0.85 });
  const lmesh = new THREE.Mesh(lg, lm1);
  const lm2 = new THREE.MeshBasicMaterial({ color: 0xe8a832, transparent: true, opacity: 0.05 });
  const lsolid = new THREE.Mesh(lg.clone(), lm2);
  const ringGeo = new THREE.TorusGeometry(1.8, 0.025, 6, 48);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x2abfb3, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI * 0.35;
  const cg = new THREE.SphereGeometry(0.45, 12, 12);
  const cm = new THREE.MeshBasicMaterial({ color: 0xfad06e, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
  const core = new THREE.Mesh(cg, cm);
  ls.add(lmesh); ls.add(lsolid); ls.add(ring); ls.add(core);

  function lAnimate() {
    lmesh.rotation.y += 0.022; lmesh.rotation.x += 0.01;
    lsolid.rotation.y = lmesh.rotation.y; lsolid.rotation.x = lmesh.rotation.x;
    ring.rotation.z += 0.015;
    const pulse = 0.85 + Math.sin(Date.now()*0.004) * 0.15;
    core.scale.setScalar(pulse);
    lr.render(ls, lca);
    requestAnimationFrame(lAnimate);
  }
  lAnimate();
})();

/* ─── Loader progress ─── */
let pct = 0;
const fill = document.getElementById('loader-fill');
const pctEl = document.getElementById('loader-pct');
const loaderEl = document.getElementById('loader');
const iv = setInterval(() => {
  pct += Math.floor(Math.random() * 5) + 2;
  if (pct >= 90) clearInterval(iv);
  fill.style.width = Math.min(pct,90) + '%';
  pctEl.textContent = Math.min(pct,90) + '%';
}, 110);
window.addEventListener('load', () => {
  clearInterval(iv);
  fill.style.width = '100%'; pctEl.textContent = '100%';
  setTimeout(() => loaderEl.classList.add('hidden'), 700);
});

/* =========================================================
   ADVANCED CURSOR SYSTEM — only on pointer:fine (mouse) devices
   ========================================================= */
const isPointerFine = window.matchMedia('(pointer: fine)').matches;
const dot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
const cursorLabel = document.getElementById('cursor-label');
let cursorX = 0, cursorY = 0;

if (isPointerFine) {
window.addEventListener('mousemove', e => {
  cursorX = e.clientX; cursorY = e.clientY;
  dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px';
  cursorRing.animate({ left: e.clientX+'px', top: e.clientY+'px' }, { duration: 280, fill:'forwards' });
  cursorLabel.style.left = e.clientX + 'px';
  cursorLabel.style.top = (e.clientY + 28) + 'px';
});

// Cursor label on data-label elements
document.querySelectorAll('[data-label]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorLabel.textContent = el.dataset.label;
    cursorLabel.classList.add('visible');
  });
  el.addEventListener('mouseleave', () => {
    cursorLabel.classList.remove('visible');
  });
});

document.querySelectorAll('a,button,.project-card,.skill-pill,.service-card,.contact-card,.workflow-step,.cert-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('grow'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('grow'));
});
} // end isPointerFine

/* =========================================================
   MAGNETIC ELEMENTS — mouse only
   ========================================================= */
if (isPointerFine) {
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.35;
    const dy = (e.clientY - cy) * 0.35;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    cursorRing.classList.add('magnetic');
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
    cursorRing.classList.remove('magnetic');
  });
});
} // end isPointerFine

/* =========================================================
   CURSOR TRAIL — mouse only
   ========================================================= */
if (isPointerFine) {
const TRAIL_COUNT = 14;
const trails = [];
const trailColors = ['#e8a832','#e8a832','#f0ba40','#2abfb3','#e8a832','#fad06e'];
for (let i = 0; i < TRAIL_COUNT; i++) {
  const d = document.createElement('div');
  d.classList.add('trail-dot');
  const size = Math.max(2, 6 - i * 0.35);
  d.style.cssText = `width:${size}px;height:${size}px;background:${trailColors[i%trailColors.length]};opacity:${1 - i/TRAIL_COUNT};`;
  document.body.appendChild(d);
  trails.push({ el: d, x: 0, y: 0 });
}
let mouseTrailX = 0, mouseTrailY = 0;
window.addEventListener('mousemove', e => { mouseTrailX = e.clientX; mouseTrailY = e.clientY; });
(function animateTrail() {
  let px = mouseTrailX, py = mouseTrailY;
  trails.forEach((t, i) => {
    t.x += (px - t.x) * (0.35 - i * 0.018);
    t.y += (py - t.y) * (0.35 - i * 0.018);
    t.el.style.left = t.x + 'px';
    t.el.style.top  = t.y + 'px';
    px = t.x; py = t.y;
  });
  requestAnimationFrame(animateTrail);
})();
} // end isPointerFine (cursor trail)

/* =========================================================
   SPOTLIGHT EFFECT ON CARDS
   ========================================================= */
document.querySelectorAll('.spotlight-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});

/* =========================================================
   SPLIT TEXT REVEAL
   ========================================================= */
function splitTextReveal() {
  document.querySelectorAll('.split-title').forEach(title => {
    // preserve the HTML (em tags etc)
    const html = title.innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    let newHTML = '';
    let charIdx = 0;

    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split('').forEach(ch => {
          const delay = (charIdx * 0.025).toFixed(3);
          const encoded = ch === ' ' ? '&nbsp;' : ch.replace(/</g,'&lt;').replace(/>/g,'&gt;');
          newHTML += `<span class="split-char" style="transition-delay:${delay}s">${encoded}</span>`;
          charIdx++;
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        newHTML += `<${node.tagName.toLowerCase()}>`;
        node.childNodes.forEach(child => processNode(child));
        newHTML += `</${node.tagName.toLowerCase()}>`;
      }
    }

    tempDiv.childNodes.forEach(node => processNode(node));
    title.innerHTML = newHTML;

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          title.querySelectorAll('.split-char').forEach(ch => ch.classList.add('visible'));
          io.unobserve(title);
        }
      });
    }, { threshold: 0.2 });
    io.observe(title);
  });
}
splitTextReveal();

/* =========================================================
   HERO PARALLAX ON SCROLL
   ========================================================= */
const heroSection = document.getElementById('hero-section');
function heroParallax() {
  const scrollY = window.scrollY;
  if (scrollY > window.innerHeight) return;
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax);
    el.style.transform = `translateY(${scrollY * speed}px)`;
  });
}
window.addEventListener('scroll', heroParallax, { passive: true });

/* =========================================================
   NAV SCROLL EFFECT
   ========================================================= */
const mainNav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  mainNav.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

/* =========================================================
   MAIN THREE.JS BACKGROUND
   ========================================================= */
(function() {
  const canvas = document.getElementById('canvas-bg');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 55;

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let targetMouseX = 0, targetMouseY = 0, mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', e => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  function wm(hex, op) {
    return new THREE.MeshBasicMaterial({ color:hex, wireframe:true, transparent:true, opacity:op, blending:THREE.AdditiveBlending, depthWrite:false });
  }
  function sm(hex, op) {
    return new THREE.MeshBasicMaterial({ color:hex, transparent:true, opacity:op, blending:THREE.AdditiveBlending, depthWrite:false });
  }

  /* LARGE HERO DIAMOND */
  const diamondGroup = new THREE.Group();
  diamondGroup.position.set(24, 2, -14);
  const dg = new THREE.OctahedronGeometry(10, 1);
  diamondGroup.add(new THREE.Mesh(dg, wm(0xe8a832, 0.55)));
  diamondGroup.add(new THREE.Mesh(dg.clone(), sm(0xe8a832, 0.03)));
  const dg2 = new THREE.OctahedronGeometry(7.5, 0);
  diamondGroup.add(new THREE.Mesh(dg2, wm(0xfad06e, 0.18)));
  scene.add(diamondGroup);

  /* FLOATING GEMS */
  const gemData = [
    { pos:[-30,12,-10], scale:4.0, color:0x2abfb3, sp:[0.007,0.011,0.004] },
    { pos:[ 34,-20,-22], scale:3.0, color:0xc94a2a, sp:[0.009,0.006,0.013] },
    { pos:[-20,-24,-16], scale:2.5, color:0xe8a832, sp:[0.013,0.008,0.006] },
    { pos:[ 14, 26,-26], scale:4.5, color:0x2abfb3, sp:[0.005,0.012,0.009] },
  ];
  const gemObjects = gemData.map(d => {
    const g = new THREE.OctahedronGeometry(d.scale, 0);
    const g2 = new THREE.TetrahedronGeometry(d.scale * 0.7, 0);
    const grp = new THREE.Group();
    grp.add(new THREE.Mesh(g, wm(d.color, 0.5)));
    grp.add(new THREE.Mesh(g2, wm(d.color, 0.2)));
    grp.add(new THREE.Mesh(g.clone(), sm(d.color, 0.03)));
    grp.position.set(...d.pos);
    scene.add(grp);
    return { grp, sp: d.sp, base: [...d.pos] };
  });

  /* CRYSTAL DODECAHEDRA */
  const crystalData = [
    { pos:[-10,-30,-20], scale:3.2, color:0xfad06e, sp:[0.01,0.007,0.015] },
    { pos:[ 40, 8,-32], scale:5.0, color:0xe8a832, sp:[0.006,0.013,0.008] },
    { pos:[-38,-10,-24], scale:3.0, color:0x2abfb3, sp:[0.011,0.009,0.006] },
  ];
  crystalData.forEach(d => {
    const g = new THREE.DodecahedronGeometry(d.scale, 0);
    const grp = new THREE.Group();
    grp.add(new THREE.Mesh(g, wm(d.color, 0.45)));
    grp.add(new THREE.Mesh(g.clone(), sm(d.color, 0.04)));
    grp.position.set(...d.pos);
    scene.add(grp);
  });

  /* TORUS RINGS */
  const torusData = [
    { pos:[-32,18,-36], r:9, tube:0.45, color:0xe8a832, sp:[0.004,0.009,0.003] },
    { pos:[ 30,-14,-42], r:12, tube:0.5, color:0x2abfb3, sp:[0.007,0.004,0.011] },
    { pos:[  2,34,-48], r:8,  tube:0.35, color:0xc94a2a, sp:[0.008,0.006,0.005] },
  ];
  const torusObjects = torusData.map(d => {
    const g = new THREE.TorusGeometry(d.r, d.tube, 24, 80);
    const mesh = new THREE.Mesh(g, wm(d.color, 0.32));
    mesh.position.set(...d.pos);
    scene.add(mesh);
    return { mesh, sp: d.sp };
  });

  /* WARM PARTICLE FIELD — mouse interactive */
  const PC = 1600;
  const pos = new Float32Array(PC*3), col = new Float32Array(PC*3);
  const vel = new Float32Array(PC*3); // velocities for mouse interaction
  const pal = [[0.910,0.659,0.196],[0.165,0.749,0.702],[0.788,0.290,0.165]];
  const basePos = new Float32Array(PC*3);
  for (let i=0;i<PC;i++) {
    const x = (Math.random()-0.5)*200, y = (Math.random()-0.5)*200, z = (Math.random()-0.5)*130-20;
    pos[i*3]=basePos[i*3]=x; pos[i*3+1]=basePos[i*3+1]=y; pos[i*3+2]=basePos[i*3+2]=z;
    const c=pal[Math.floor(Math.random()*pal.length)];
    col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
  }
  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  ptGeo.setAttribute('color', new THREE.BufferAttribute(col,3));
  const ptMat = new THREE.PointsMaterial({ size:0.38, vertexColors:true, transparent:true, opacity:0.55, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true });
  const particles = new THREE.Points(ptGeo, ptMat);
  scene.add(particles);

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse follow
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Camera subtle drift with mouse
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.03;
    camera.position.y += (mouseY * 2 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    // Diamond rotation
    diamondGroup.rotation.y = t * 0.08 + mouseX * 0.3;
    diamondGroup.rotation.x = t * 0.04 + mouseY * 0.15;

    // Gems float
    gemObjects.forEach((g, i) => {
      g.grp.rotation.x += g.sp[0];
      g.grp.rotation.y += g.sp[1];
      g.grp.position.y = g.base[1] + Math.sin(t * 0.4 + i) * 2.5;
    });

    // Toruses
    torusObjects.forEach((o, i) => {
      o.mesh.rotation.x += o.sp[0]; o.mesh.rotation.y += o.sp[1]; o.mesh.rotation.z += o.sp[2];
    });

    // Particle mouse repulsion
    const mx3d = mouseX * 40, my3d = mouseY * 25;
    for (let i=0; i<PC; i++) {
      const dx = pos[i*3] - mx3d, dy = pos[i*3+1] - my3d;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < 18) {
        const force = (18-dist)/18 * 0.6;
        vel[i*3] += (dx/dist) * force;
        vel[i*3+1] += (dy/dist) * force;
      }
      vel[i*3] *= 0.92; vel[i*3+1] *= 0.92;
      pos[i*3] += vel[i*3] + Math.sin(t*0.3+i*0.01)*0.01;
      pos[i*3+1] += vel[i*3+1] + Math.cos(t*0.25+i*0.01)*0.01;
      // drift back to base
      pos[i*3] += (basePos[i*3] - pos[i*3]) * 0.005;
      pos[i*3+1] += (basePos[i*3+1] - pos[i*3+1]) * 0.005;
    }
    ptGeo.attributes.position.needsUpdate = true;

    particles.rotation.y = t * 0.007;
    particles.rotation.x = t * 0.003;

    renderer.render(scene, camera);
  }
  animate();
})();



/* =========================================================
   PROJECT CARD MINI CANVASES
   ========================================================= */
(function(){
  const cfgs = [
    { id:'card-canvas-1', color:0xe8a832, type:'diamond' },
    { id:'card-canvas-2', color:0x2abfb3,  type:'crystal' },
    { id:'card-canvas-3', color:0xc94a2a,  type:'prism'  },
    { id:'card-canvas-4', color:0x5588cc,  type:'icosa'  },
  ];
  cfgs.forEach(cfg => {
    const canvas = document.getElementById(cfg.id);
    if (!canvas) return;
    const W = canvas.parentElement.offsetWidth || 340, H = 220;
    canvas.width=W; canvas.height=H;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
    renderer.setSize(W,H); renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000,0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50,W/H,0.1,200);
    camera.position.z=18;
    const wm = new THREE.MeshBasicMaterial({ color:cfg.color, wireframe:true, transparent:true, opacity:0.52, blending:THREE.AdditiveBlending, depthWrite:false });
    const sm2 = new THREE.MeshBasicMaterial({ color:cfg.color, transparent:true, opacity:0.04, blending:THREE.AdditiveBlending, depthWrite:false });
    let geo, geo2;
    if(cfg.type==='diamond') { geo=new THREE.OctahedronGeometry(4,1); geo2=new THREE.OctahedronGeometry(3,0); }
    else if(cfg.type==='crystal') { geo=new THREE.DodecahedronGeometry(4,0); geo2=new THREE.IcosahedronGeometry(2.8,0); }
    else if(cfg.type==='prism') { geo=new THREE.TetrahedronGeometry(4.5,0); geo2=new THREE.OctahedronGeometry(2.8,0); }
    else { geo=new THREE.IcosahedronGeometry(4,1); geo2=new THREE.DodecahedronGeometry(2.8,0); }
    scene.add(new THREE.Mesh(geo, wm));
    scene.add(new THREE.Mesh(geo2, new THREE.MeshBasicMaterial({ color:cfg.color, wireframe:true, transparent:true, opacity:0.22, blending:THREE.AdditiveBlending, depthWrite:false })));
    scene.add(new THREE.Mesh(geo.clone(), sm2));
    const ptP = new Float32Array(180*3);
    for(let i=0;i<180;i++){
      ptP[i*3]=(Math.random()-0.5)*30; ptP[i*3+1]=(Math.random()-0.5)*16; ptP[i*3+2]=(Math.random()-0.5)*16-5;
    }
    const ptG = new THREE.BufferGeometry();
    ptG.setAttribute('position', new THREE.BufferAttribute(ptP,3));
    scene.add(new THREE.Points(ptG, new THREE.PointsMaterial({ color:cfg.color, size:0.16, transparent:true, opacity:0.38, blending:THREE.AdditiveBlending, depthWrite:false })));
    const clock = new THREE.Clock();
    const m1=scene.children[0], m2=scene.children[1], m3=scene.children[2];
    function animate(){
      requestAnimationFrame(animate);
      const t=clock.getElapsedTime();
      m1.rotation.x=t*0.14; m1.rotation.y=t*0.2;
      m2.rotation.x=-t*0.1; m2.rotation.y=-t*0.15;
      m3.rotation.x=m1.rotation.x; m3.rotation.y=m1.rotation.y;
      renderer.render(scene, camera);
    }
    animate();
  });
})();

/* =========================================================
   CARD TILT — mouse only
   ========================================================= */
if (isPointerFine) {
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect=card.getBoundingClientRect();
    const cx=(e.clientX-rect.left)/rect.width;
    const cy=(e.clientY-rect.top)/rect.height;
    const rx=(cy-0.5)*-10, ry=(cx-0.5)*10;
    card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px) scale(1.01)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform=''; });
});
} // end isPointerFine (card tilt)

/* =========================================================
   SCROLL REVEAL
   ========================================================= */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
}, { threshold:0.12 });
document.querySelectorAll('.reveal, .timeline-item').forEach(el => io.observe(el));

/* =========================================================
   LANGUAGE PROGRESS BARS ANIMATION
   ========================================================= */
const progObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const fill = e.target.querySelector('.progress-fill');
      if (fill) {
        setTimeout(() => { fill.style.width = fill.dataset.width + '%'; }, 200);
      }
      progObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.lang-card').forEach(card => progObserver.observe(card));

/* =========================================================
   STAT COUNTER
   ========================================================= */
document.querySelectorAll('.stat-num').forEach(el => {
  const target=parseInt(el.textContent);
  const suffix=el.textContent.replace(/[0-9]/g,'');
  let current=0;
  const io2=new IntersectionObserver(entries => {
    if(entries[0].isIntersecting) {
      io2.disconnect();
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        current += step;
        if(current >= target) { current = target; clearInterval(timer); }
        el.textContent = current + suffix;
      }, 40);
    }
  }, { threshold: 0.5 });
  io2.observe(el);
});

/* =========================================================
   SCROLL PROGRESS BAR
   ========================================================= */
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (window.scrollY / total * 100) + '%';
}, { passive: true });

/* =========================================================
   SCROLL TO TOP
   ========================================================= */
const scrollTopBtn = document.getElementById('scroll-top');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });
scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* =========================================================
   HAMBURGER MENU
   ========================================================= */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* =========================================================
   TYPING ANIMATION
   ========================================================= */
const typedEl = document.getElementById('typed-text');
if (typedEl) {
  const phrases = ['Frontend Developer','UI / UX Designer','AI Integrator','Creative Builder','Problem Solver'];
  let phraseIndex = 0, charIndex = 0, deleting = false;
  function typeLoop() {
    const current = phrases[phraseIndex];
    if (!deleting) {
      typedEl.textContent = current.slice(0, ++charIndex);
      if (charIndex === current.length) { deleting = true; setTimeout(typeLoop, 1800); return; }
      setTimeout(typeLoop, 68);
    } else {
      typedEl.textContent = current.slice(0, --charIndex);
      if (charIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; setTimeout(typeLoop, 400); return; }
      setTimeout(typeLoop, 34);
    }
  }
  setTimeout(typeLoop, 1200);
}

/* =========================================================
   VISIBILITY CHANGE — pause heavy animations when tab is hidden
   ========================================================= */
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('tab-hidden', document.hidden);
});

/* =========================================================
   ACTIVE NAV HIGHLIGHT
   ========================================================= */
const navLinks = document.querySelectorAll('.nav-links a');
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const match = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (match) match.classList.add('active');
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('section[id]').forEach(s => navObserver.observe(s));

/* =========================================================
   SMOOTH SCROLL — with View Transitions API
   ========================================================= */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    const doScroll = () => {
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      // Brief amber pulse on the arrived section
      const box = target.querySelector('.section-box') || target;
      box.classList.remove('vt-arrived');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => box.classList.add('vt-arrived'));
      });
      box.addEventListener('animationend', () => box.classList.remove('vt-arrived'), { once: true });
    };

    if (document.startViewTransition) {
      document.startViewTransition(doScroll);
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* =========================================================
   GITHUB API — with loading state, caching, and graceful fallback
   ========================================================= */
(function() {
  const reposEl = document.getElementById('gh-repos');
  const followersEl = document.getElementById('gh-followers');
  if (!reposEl || !followersEl) return;

  // Show loading state
  reposEl.textContent = '…';
  followersEl.textContent = '…';

  // Use sessionStorage to avoid hammering the API on every page visit
  const CACHE_KEY = 'yp_gh_stats';
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { repos, followers } = JSON.parse(cached);
      reposEl.textContent = repos;
      followersEl.textContent = followers;
      return;
    } catch(e) { /* ignore bad cache */ }
  }

  fetch('https://api.github.com/users/yashpatil3495', {
    headers: { 'Accept': 'application/vnd.github.v3+json' }
  })
  .then(r => {
    if (!r.ok) throw new Error('GitHub API error: ' + r.status);
    return r.json();
  })
  .then(d => {
    const repos = d.public_repos ?? '—';
    const followers = d.followers ?? '—';
    reposEl.textContent = repos;
    followersEl.textContent = followers;
    // Animate the numbers
    [{ el: reposEl, val: repos }, { el: followersEl, val: followers }].forEach(({ el, val }) => {
      if (typeof val !== 'number') return;
      let cur = 0;
      const step = Math.max(1, Math.ceil(val / 30));
      const t = setInterval(() => {
        cur = Math.min(cur + step, val);
        el.textContent = cur;
        if (cur >= val) clearInterval(t);
      }, 40);
    });
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ repos, followers }));
  })
  .catch(() => {
    reposEl.textContent = '—';
    followersEl.textContent = '—';
  });
})();

/* ─── SKILL BAR REVEAL ANIMATION ─── */
(function() {
  const fills = document.querySelectorAll('.skill-bar-fill[data-width]');
  if (!fills.length) return;
  // Apply CSS custom property so the scaleX target is known
  fills.forEach(el => {
    el.style.setProperty('--bar-target', el.dataset.width);
  });
  if (!('IntersectionObserver' in window)) {
    fills.forEach(el => el.classList.add('animated'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Slight stagger based on sibling index
        const siblings = entry.target.closest('.skills-category-card')
          ?.querySelectorAll('.skill-bar-fill') || [];
        const idx = Array.from(siblings).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('animated'), idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(el => observer.observe(el));
})();

/* ─── DYNAMIC COPYRIGHT YEAR ─── */
(function() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* =========================================================
   EASTER EGG — KONAMI CODE
   ========================================================= */
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;
document.addEventListener('keydown', e => {
  if (e.key === KONAMI[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === KONAMI.length) {
      konamiIdx = 0;
      for (let i = 0; i < 60; i++) {
        const p = document.createElement('div');
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 200;
        const size = 4 + Math.random() * 8;
        p.style.cssText = `position:fixed;width:${size}px;height:${size}px;background:hsl(${40+Math.random()*20},90%,60%);border-radius:50%;left:50%;top:50%;pointer-events:none;z-index:9995;transition:transform 1.2s cubic-bezier(0.23,1,0.32,1),opacity 1.2s ease;`;
        document.body.appendChild(p);
        requestAnimationFrame(() => { p.style.transform=`translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) scale(0)`;p.style.opacity='0'; });
        setTimeout(() => p.remove(), 1300);
      }
    }
  } else { konamiIdx = 0; }
});

/* =========================================================
   AI CHAT ASSISTANT — FULL FEATURED
   ========================================================= */
(function() {

  const SYSTEM_PROMPT = `You are Yash Patil's personal AI portfolio assistant. Speak on his behalf — warm, concise, professional.

WHO IS YASH: Frontend Developer & UI/UX Designer, Pune India. Bachelor of Computer Engineering (2025–Present). Seeking internships/full-time roles. Completed MERN stack, currently learning DSA and AI/ML.

SKILLS: HTML5, CSS3, JavaScript, React, Three.js, Node.js, Python, C, C++, Java, Figma, UI/UX, Prompt Engineering, LLM Integration, Generative AI, REST APIs, Canvas API, Web Speech API, Crypto API.

PROJECTS:
1. Focus Flow — Pomodoro + Spotify + task management. Live: https://yashpatil3495.github.io/timer/
2. LinguaVox — voice input, TTS, multi-language. Live: https://yashpatil3495.github.io/LinguaVox2/
3. Fortress Pro — crypto password generator. Live: https://yashpatil3495.github.io/Fortress-Pro/
4. CipherPixel — hide messages in images. Live: https://yashpatil3495.github.io/CipherPixel/

SERVICES (5 offerings):
1. Web Development — responsive, fast, SEO-friendly websites using HTML, CSS, JavaScript, modern best practices.
2. UI/UX Design — intuitive interfaces and clean layouts designed in Figma.
3. AI Integration — embedding LLMs and Prompt Engineering into web apps and automation tools.
4. Performance Audits — speed, accessibility, and Core Web Vitals optimisation with measurable results.
5. Component Libraries — reusable, accessible UI component systems in React or vanilla JS.

BLOG: Yash writes on dev.to at https://dev.to/yashpatil3495 — topics include AI integration in static sites (system prompts, streaming, fallbacks), Three.js particle systems and WebGL, and practical frontend guides.

CONTACT: yashpatil3495@gmail.com | github.com/yashpatil3495 | linkedin.com/in/yash-patil-b30b18363 | dev.to/yashpatil3495 | WhatsApp: +91 77410 10554

AVAILABILITY: Open to work — full-time roles, freelance projects, and internships.

TONE: adapt based on current tone instruction at start of each user message.
- casual: friendly, uses emoji occasionally
- formal: professional, no emoji, structured
- roast: funny sarcastic roast but still helpful — playfully tease the visitor while showing off Yash's skills

Keep answers 2-5 sentences. Bold key terms with **bold**. Only discuss Yash's professional work.`;

  const FOLLOWUPS = {
    project:   ['Tell me about LinguaVox', 'How does CipherPixel work?', 'What tech did Yash use?'],
    skill:     ['Is Yash learning anything new?', 'What is his strongest skill?', 'Does he know AI/ML?'],
    contact:   ['Download his resume', 'Is he available now?', 'What roles interest him?'],
    hire:      ['What is his email?', 'See his GitHub', 'What has he shipped?'],
    education: ['What skills is he building?', 'Does he have certifications?', 'See his projects'],
    default:   ['What projects has Yash built?', 'How do I contact Yash?', 'What is his tech stack?']
  };

  function getFollowups(text) {
    const t = (text || '').toLowerCase();
    if (/project|focus|lingua|fortress|cipher|ship|built/.test(t)) return FOLLOWUPS.project;
    if (/skill|tech|stack|react|javascript|mern|dsa/.test(t)) return FOLLOWUPS.skill;
    if (/contact|email|whatsapp|reach|linkedin/.test(t)) return FOLLOWUPS.contact;
    if (/hire|intern|job|availab|opportunit/.test(t)) return FOLLOWUPS.hire;
    if (/educat|degree|college|study|certif/.test(t)) return FOLLOWUPS.education;
    return FOLLOWUPS.default;
  }

  let currentTone = 'casual';

  function localRespond(input) {
    const q = input.toLowerCase();
    const isRoast = currentTone === 'roast';
    const isFormal = currentTone === 'formal';

    if (/contact|reach|email|whatsapp|linkedin/.test(q)) {
      if (isRoast) return "Oh so you finally decided to stop lurking? Bold move. 😂\n\n• **Email:** yashpatil3495@gmail.com\n• **LinkedIn:** linkedin.com/in/yash-patil-b30b18363\n• **WhatsApp:** +91 77410 10554\n\nHe responds faster than you'll finish reading this.";
      if (isFormal) return "Yash Patil may be contacted via:\n\n• **Email:** yashpatil3495@gmail.com\n• **LinkedIn:** linkedin.com/in/yash-patil-b30b18363\n• **WhatsApp:** +91 77410 10554";
      return "Best ways to reach Yash 👇\n\n• **Email:** yashpatil3495@gmail.com\n• **LinkedIn:** linkedin.com/in/yash-patil-b30b18363\n• **WhatsApp:** +91 77410 10554\n• **GitHub:** github.com/yashpatil3495";
    }
    if (/focus.?flow|pomodoro|productivity|timer|spotify/.test(q))
      return (isRoast ? "**Focus Flow** — because Yash couldn't focus without building an app about focusing. 😅 " : "") +
        "**Focus Flow** is a gamified productivity dashboard — Pomodoro timer, drag-and-drop tasks, Spotify integration, and real-time streak analytics.\n\n🔗 https://yashpatil3495.github.io/timer/";
    if (/linguavox|lingua|translat|voice|speech/.test(q))
      return "**LinguaVox** is a mobile-first real-time translation app with voice input (Web Speech API), TTS synthesis, and speed control. Multi-language, all in-browser.\n\n🔗 https://yashpatil3495.github.io/LinguaVox2/";
    if (/fortress|password|crypto|secur/.test(q))
      return "**Fortress Pro** generates cryptographically secure passwords via the Crypto API with real-time entropy scoring and session history.\n\n🔗 https://yashpatil3495.github.io/Fortress-Pro/";
    if (/cipher|pixel|stegan|hidden|image|encode/.test(q))
      return "**CipherPixel** hides secret messages inside images using pixel-level steganography via the Canvas API. Drag-and-drop encode/decode — invisible to the naked eye.\n\n🔗 https://yashpatil3495.github.io/CipherPixel/";
    if (/project|work|built|ship/.test(q))
      return (isRoast ? "4 live projects. Not bad for someone still in college 😏\n\n" : "Yash has shipped **4 live projects:**\n\n") +
        "• **Focus Flow** — gamified productivity + Spotify\n• **LinguaVox** — real-time voice translation\n• **Fortress Pro** — cryptographic password generator\n• **CipherPixel** — image steganography tool";
    if (/skill|tech|stack|react|javascript|node/.test(q))
      return "**Yash's stack:**\n\n• **Frontend:** HTML5, CSS3, JS, React, Three.js, Tailwind\n• **Backend:** Node.js, Python, REST APIs\n• **AI/ML:** Prompt Engineering, LLM Integration\n• **Design:** Figma, UI/UX\n• **Languages:** C, C++, Java";
    if (/mern|mongodb|express|fullstack/.test(q))
      return "Yes! Yash has **completed the MERN stack** (MongoDB, Express, React, Node.js) and is currently levelling up in **DSA** and **AI/ML**.";
    if (/dsa|algorithm|data structure/.test(q))
      return "Yash is **actively learning DSA** alongside AI/ML — strengthening problem-solving fundamentals while shipping real projects.";
    if (/ai|ml|machine.?learn|llm|prompt|generative/.test(q))
      return "Yash has hands-on experience with **Generative AI**, prompt engineering, and LLM integration — currently deepening his AI/ML knowledge.";
    if (/who|about|background|yash|himself/.test(q))
      return isRoast
        ? "Want to know about the guy behind this fancy portfolio? 😄\n\n**Yash Patil** — Frontend Dev from Pune. MERN-complete, learning DSA & AIML, open to any work opportunity. Building cool things before it was cool."
        : "**Yash Patil** is a Frontend Developer & UI/UX Designer from Pune, India. Pursuing **B.E. Computer Engineering** (2025–Present), completed MERN stack, learning DSA & AI/ML. Open to full-time roles, freelance, and internships.";
    if (/educat|degree|college|study/.test(q))
      return "Yash is pursuing **Bachelor of Computer Engineering** (2025–Present) with certifications in **C Programming** and **Generative AI**, plus hackathon participation.";
    if (/intern|job|hire|availab|open/.test(q))
      return isRoast
        ? "Is Yash available? Obviously — why else does this portfolio exist? 😂 Email: yashpatil3495@gmail.com!"
        : "Yes! Yash is **actively open to work** — full-time roles, freelance projects, and internships. Reach him at yashpatil3495@gmail.com!";
    if (/resume|cv|download/.test(q))
      return 'RESUME_LINK';
    if (/service|offer|freelanc|build/.test(q))
      return "Yash offers:\n\n• **Web Development** — responsive, fast, SEO-friendly\n• **UI/UX Design** — clean Figma interfaces\n• **AI Integration** — LLMs in web apps\n• **Performance Audits** — Core Web Vitals & speed\n• **Component Libraries** — reusable React/JS systems";
    if (/blog|article|writ|dev\.to|post/.test(q))
      return "Yash writes on **dev.to** at https://dev.to/yashpatil3495 — covering AI integration in static sites, Three.js WebGL tricks, and practical frontend guides.";
    if (/^(hi|hello|hey|sup|yo)/.test(q))
      return isRoast
        ? "Oh hey there 👀 Finally someone scrolled far enough to talk to me. Ask me something about Yash."
        : "Hey! 👋 I know everything about Yash's projects, skills, and background. What would you like to know?";
    if (/thank|thanks|ty/.test(q))
      return isRoast ? "You're welcome. Now go hire him already. 😄" : "You're welcome! Feel free to ask anything else 😊";
    return isRoast
      ? "Hmm, stumped me — which is saying something 🤔. Try: **projects**, **skills**, **contact**, or **hire**."
      : "I have info on Yash's **projects**, **skills**, **background**, and **contact**. Try: *"What projects has Yash built?"*";
  }

  /* ─── STATE ─── */
  const chatHistory = [];
  let isLoading = false;

  /* ─── DOM REFS ─── */
  const chatBtn     = document.getElementById('ai-chat-btn');
  const chatPanel   = document.getElementById('ai-chat-panel');
  const closeBtn    = document.getElementById('chat-close-btn');
  const messagesEl  = document.getElementById('chat-messages');
  const inputEl     = document.getElementById('chat-input');
  const sendBtn     = document.getElementById('chat-send');
  const followupsEl = document.getElementById('chat-followups');
  const startersEl  = document.getElementById('chat-starters');
  const gemEl       = document.getElementById('chat-avatar-gem');
  const statusText  = document.getElementById('chat-status-text');
  const micBtn      = document.getElementById('chat-mic-btn');
  const shareBtn    = document.getElementById('chat-share-btn');

  function openChat()  { chatPanel.classList.add('open'); chatBtn.classList.add('open'); setTimeout(() => inputEl.focus(), 400); }
  function closeChat() { chatPanel.classList.remove('open'); chatBtn.classList.remove('open'); }
  chatBtn.addEventListener('click', () => chatPanel.classList.contains('open') ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  /* ─── TONE ─── */
  document.querySelectorAll('.chat-tone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chat-tone-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTone = btn.dataset.tone;
      const labels = { casual: '😊 Casual mode', formal: '🎩 Formal mode', roast: '🔥 Roast mode' };
      appendSystemNote(labels[currentTone] + ' activated');
    });
  });

  function appendSystemNote(text) {
    const note = document.createElement('div');
    note.style.cssText = 'text-align:center;font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.12em;color:var(--muted);opacity:0.6;padding:4px 0;';
    note.textContent = '— ' + text + ' —';
    messagesEl.appendChild(note);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendMessage(role, text) {
    if (startersEl) startersEl.style.display = 'none';
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg ' + role;
    const av = document.createElement('div');
    av.className = 'chat-avatar ' + (role === 'assistant' ? 'ai-av' : 'user-av');
    av.textContent = role === 'assistant' ? '✦' : '◈';
    const bubbleWrap = document.createElement('div');
    bubbleWrap.className = 'chat-bubble-wrap';
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + (role === 'assistant' ? 'ai' : 'user');

    if (text === 'RESUME_LINK') {
      bubble.innerHTML = "Here's Yash's resume 👇<br>";
      const a = document.createElement('a');
      a.href = 'resume.html'; a.target = '_blank'; a.className = 'chat-inline-btn'; a.textContent = '↗ View Resume';
      const dl = document.createElement('button');
      dl.className = 'chat-inline-btn'; dl.style.marginLeft = '6px'; dl.textContent = '↓ Download CV';
      dl.addEventListener('click', () => { if (window.triggerCVDownload) window.triggerCVDownload(); });
      bubble.appendChild(a); bubble.appendChild(dl);
    } else {
      bubble.innerHTML = (text || '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }

    bubbleWrap.appendChild(bubble);

    if (role === 'assistant' && text !== 'RESUME_LINK') {
      const reactions = document.createElement('div');
      reactions.className = 'chat-reactions';
      ['👍', '👎'].forEach((emoji, i) => {
        const btn = document.createElement('button');
        btn.className = 'chat-react-btn'; btn.textContent = emoji;
        btn.addEventListener('click', () => {
          btn.classList.toggle(i === 0 ? 'liked' : 'disliked');
          reactions.querySelectorAll('.chat-react-btn')[1 - i].classList.remove(i === 0 ? 'disliked' : 'liked');
        });
        reactions.appendChild(btn);
      });
      bubbleWrap.appendChild(reactions);
    }

    wrap.appendChild(av); wrap.appendChild(bubbleWrap);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function streamText(bubble, text) {
    return new Promise(resolve => {
      const words = text.split(' ');
      let i = 0, displayed = '';
      const cursor = document.createElement('span');
      cursor.className = 'stream-cursor';
      bubble.innerHTML = ''; bubble.appendChild(cursor);
      const iv = setInterval(() => {
        if (i >= words.length) {
          clearInterval(iv); cursor.remove();
          bubble.innerHTML = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
          resolve();
          return;
        }
        displayed += (i > 0 ? ' ' : '') + words[i++];
        bubble.innerHTML = displayed
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br>') + ' ';
        bubble.appendChild(cursor);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }, 30);
    });
  }

  function showTyping() {
    if (gemEl) { gemEl.classList.add('thinking'); gemEl.textContent = '…'; }
    if (statusText) statusText.textContent = 'Thinking…';
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg'; wrap.id = 'chat-typing-wrap';
    const av = document.createElement('div');
    av.className = 'chat-avatar ai-av'; av.textContent = '✦';
    const typ = document.createElement('div');
    typ.className = 'chat-typing';
    typ.innerHTML = '<span></span><span></span><span></span>';
    wrap.appendChild(av); wrap.appendChild(typ);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() {
    document.getElementById('chat-typing-wrap')?.remove();
    if (gemEl) { gemEl.classList.remove('thinking'); gemEl.textContent = '✦'; }
    if (statusText) statusText.textContent = 'Powered by Claude';
  }

  function showFollowups(responseText) {
    if (!followupsEl) return;
    const chips = getFollowups(responseText);
    followupsEl.innerHTML = '';
    chips.forEach(label => {
      const btn = document.createElement('button');
      btn.className = 'chat-followup-chip'; btn.textContent = label;
      btn.addEventListener('click', () => sendMessage(label));
      followupsEl.appendChild(btn);
    });
    followupsEl.style.display = 'flex';
  }

  async function sendMessage(text) {
    text = (text || '').trim();
    if (!text || isLoading) return;
    isLoading = true; sendBtn.disabled = true;
    if (followupsEl) followupsEl.style.display = 'none';
    if (startersEl) startersEl.style.display = 'none';

    appendMessage('user', text);
    chatHistory.push({ role: 'user', content: '[Tone: ' + currentTone + '] ' + text });
    inputEl.value = ''; inputEl.style.height = 'auto';
    showTyping();

    const ANTHROPIC_API_KEY = '';

    if (ANTHROPIC_API_KEY) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 600, system: SYSTEM_PROMPT, messages: chatHistory })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        const reply = data?.content?.[0]?.text || "Sorry, couldn't get a response right now.";
        hideTyping();
        const bubble = appendMessage('assistant', '');
        await streamText(bubble, reply);
        if (gemEl) { gemEl.classList.add('replied'); setTimeout(() => gemEl.classList.remove('replied'), 500); }
        chatHistory.push({ role: 'assistant', content: reply });
        showFollowups(reply);
      } catch (err) {
        hideTyping();
        const reply = localRespond(text);
        const bubble = appendMessage('assistant', reply === 'RESUME_LINK' ? 'RESUME_LINK' : '');
        if (reply !== 'RESUME_LINK') await streamText(bubble, reply);
        showFollowups(reply);
      }
    } else {
      await new Promise(r => setTimeout(r, 500 + Math.random() * 400));
      hideTyping();
      const reply = localRespond(text);
      if (reply === 'RESUME_LINK') {
        appendMessage('assistant', 'RESUME_LINK');
      } else {
        const bubble = appendMessage('assistant', '');
        await streamText(bubble, reply);
        if (gemEl) { gemEl.classList.add('replied'); setTimeout(() => gemEl.classList.remove('replied'), 500); }
      }
      chatHistory.push({ role: 'assistant', content: reply });
      showFollowups(reply);
    }

    isLoading = false; sendBtn.disabled = false; inputEl.focus();
  }

  sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputEl.value); } });
  inputEl.addEventListener('input', () => { inputEl.style.height = 'auto'; inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + 'px'; });

  document.querySelectorAll('.starter-card').forEach(card => {
    card.addEventListener('click', () => sendMessage(card.dataset.q));
  });

  /* ─── VOICE INPUT ─── */
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US'; recognition.interimResults = false;
    let micActive = false;
    const badge = document.createElement('span'); badge.className = 'mic-badge';
    if (micBtn) micBtn.appendChild(badge);
    micBtn && micBtn.addEventListener('click', () => {
      if (micActive) { recognition.stop(); return; }
      recognition.start(); micActive = true;
      micBtn.classList.add('recording', 'mic-active');
      if (statusText) statusText.textContent = 'Listening…';
    });
    recognition.onresult = e => { inputEl.value = e.results[0][0].transcript; inputEl.style.height = 'auto'; inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + 'px'; };
    recognition.onend = () => {
      micActive = false; micBtn && micBtn.classList.remove('recording', 'mic-active');
      if (statusText) statusText.textContent = 'Powered by Claude';
      if (inputEl.value.trim()) sendMessage(inputEl.value);
    };
    recognition.onerror = () => { micActive = false; micBtn && micBtn.classList.remove('recording', 'mic-active'); if (statusText) statusText.textContent = 'Powered by Claude'; };
  } else {
    micBtn && (micBtn.style.display = 'none');
  }

  /* ─── SHARE TRANSCRIPT ─── */
  shareBtn && shareBtn.addEventListener('click', () => {
    if (!chatHistory.length) return;
    const text = chatHistory.map(m => (m.role === 'user' ? 'You' : 'Yash AI') + ': ' + m.content.replace(/\[Tone:[^\]]+\] /, '')).join('\n\n');
    const full = 'Chat with Yash Patil\'s AI\n' + '─'.repeat(30) + '\n\n' + text + '\n\n' + '─'.repeat(30) + '\nVisit: https://yashpatil3495.github.io/';
    navigator.clipboard.writeText(full).then(() => {
      const orig = shareBtn.innerHTML;
      shareBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
      shareBtn.style.color = '#4caf50';
      setTimeout(() => { shareBtn.innerHTML = orig; shareBtn.style.color = ''; }, 2000);
    });
  });

  [chatBtn, closeBtn, sendBtn, inputEl, micBtn, shareBtn].forEach(el => {
    if (!el) return;
    el.addEventListener('mouseenter', () => document.getElementById('cursor-ring')?.classList.add('grow'));
    el.addEventListener('mouseleave', () => document.getElementById('cursor-ring')?.classList.remove('grow'));
  });

  document.querySelectorAll('.section-ask-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      openChat();
      setTimeout(() => sendMessage(chip.dataset.q), 350);
    });
    chip.addEventListener('mouseenter', () => document.getElementById('cursor-ring')?.classList.add('grow'));
    chip.addEventListener('mouseleave', () => document.getElementById('cursor-ring')?.classList.remove('grow'));
  });

})();