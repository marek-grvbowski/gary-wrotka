export function initAnimations() {
  if (typeof window === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Reveal on scroll (all variants)
  const targets = document.querySelectorAll<HTMLElement>(
    '.reveal, .reveal-stagger, .reveal-zoom, .reveal-clip'
  );
  if (targets.length > 0 && 'IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add('is-visible'));
  }

  // 2. Image fade-in
  const images = document.querySelectorAll<HTMLImageElement>('img.fade-img');
  images.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
      img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
    }
  });

  // 3. Scroll progress bar (top)
  if (!reduceMotion) {
    let bar = document.querySelector<HTMLElement>('.scroll-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'scroll-progress';
      document.body.appendChild(bar);
    }
    let ticking = false;
    const update = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (scrolled / max) * 100 : 0;
      bar!.style.width = `${pct}%`;
      bar!.style.opacity = scrolled > 32 ? '1' : '0';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  // 4. Magnetic buttons — light pull-to-cursor effect
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const magnets = document.querySelectorAll<HTMLElement>('.magnetic');
    magnets.forEach((el) => {
      const strength = 0.25;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.setProperty('--mx', `${x * strength}px`);
        el.style.setProperty('--my', `${y * strength}px`);
      });
      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });
  }
}
