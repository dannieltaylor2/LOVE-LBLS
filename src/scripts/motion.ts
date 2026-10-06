import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { designs } from '../data/site';

gsap.registerPlugin(ScrollTrigger);
export function initMotion() {
  const media = gsap.matchMedia();
  const heroProduct = document.querySelector<HTMLElement>('.hero-product')!;
  const heroCan = document.querySelector<HTMLElement>('.hero-can')!;
  let scrollRadius = 0;
  let pointerRadius = 0;
  let keyboardRevealed = false;
  let targetX = 120,
    targetY = 280,
    currentX = 120,
    currentY = 280;
  let frame = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function drawMask() {
    heroCan.style.setProperty('--reveal-x', `${currentX}px`);
    heroCan.style.setProperty('--reveal-y', `${currentY}px`);
    heroCan.style.setProperty(
      '--reveal-radius',
      `${keyboardRevealed ? 900 : Math.max(scrollRadius, pointerRadius)}px`,
    );
  }
  function tick() {
    currentX += (targetX - currentX) * 0.2;
    currentY += (targetY - currentY) * 0.2;
    drawMask();
    if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.15)
      frame = requestAnimationFrame(tick);
    else frame = 0;
  }
  function move(event: PointerEvent) {
    if (reduced.matches) return;
    const svg = heroCan.querySelector<SVGSVGElement>('.can-metal')!;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    targetX = point.x;
    targetY = point.y;
    pointerRadius = 130;
    if (!frame) frame = requestAnimationFrame(tick);
  }
  heroProduct.addEventListener('pointermove', move, { passive: true });
  heroProduct.addEventListener('pointerdown', move, { passive: true });
  heroProduct.addEventListener('pointerleave', () => {
    pointerRadius = 0;
    drawMask();
  });
  heroProduct.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'mouse') {
      pointerRadius = 0;
      drawMask();
    }
  });
  heroProduct.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      keyboardRevealed = !keyboardRevealed;
      heroProduct.setAttribute('aria-pressed', String(keyboardRevealed));
      drawMask();
    }
  });

  media.add(
    {
      desktop: '(min-width: 601px)',
      mobile: '(max-width: 600px)',
      motion: '(prefers-reduced-motion: no-preference)',
    },
    (context) => {
      const { desktop, motion } = context.conditions!;
      if (!motion) {
        scrollRadius = 900;
        drawMask();
        return;
      }
      const mask = { radius: 0 };
      if (desktop) {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: '.hero-scroll',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        });
        timeline
          .to(
            mask,
            {
              radius: 750,
              duration: 1,
              ease: 'none',
              onUpdate: () => {
                scrollRadius = mask.radius;
                drawMask();
              },
            },
            0,
          )
          .to('.hero-text', { autoAlpha: 0, y: -35, duration: 0.32, ease: 'none' }, 0.16)
          .to('.reveal-annotation', { autoAlpha: 0, duration: 0.2 }, 0.05)
          .to('.hero-product', { rotation: -7, xPercent: 4, duration: 1, ease: 'none' }, 0)
          .to('.hero-payoff', { autoAlpha: 1, y: -10, duration: 0.36, ease: 'none' }, 0.47);
      } else {
        gsap.to(mask, {
          radius: 750,
          ease: 'none',
          scrollTrigger: { trigger: heroProduct, start: 'top 55%', end: 'bottom 40%', scrub: 0.3 },
          onUpdate: () => {
            scrollRadius = mask.radius;
            drawMask();
          },
        });
      }
      return () => {
        scrollRadius = 0;
        drawMask();
      };
    },
  );
  media.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    const traveler = document.querySelector<HTMLElement>('.traveler')!;
    const target = document.querySelector<HTMLElement>('.story-can-target')!;
    const origin = document.querySelector<HTMLElement>('.travel-origin .design-product-link')!;
    const wrapper = document.querySelector<HTMLElement>('.collection-story')!;
    wrapper.classList.add('has-traveler');
    const offset = () => {
      const a = origin.getBoundingClientRect(),
        b = target.getBoundingClientRect();
      return {
        x: b.left + b.width / 2 - (a.left + a.width / 2),
        y: b.top + b.height / 2 - (a.top + a.height / 2),
      };
    };
    gsap.to(traveler, {
      x: () => offset().x,
      y: () => offset().y,
      rotation: -7,
      scale: () => target.offsetWidth / traveler.offsetWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: '.design-exhibition',
        start: 'center 43%',
        endTrigger: '.story-can-target',
        end: 'center center',
        scrub: 0.45,
        invalidateOnRefresh: true,
      },
    });
    gsap.to('.design-display:not(.travel-origin) .gallery-product', {
      y: -90,
      opacity: 0,
      rotation: (i) => [-22, 17, 28][i],
      ease: 'none',
      scrollTrigger: {
        trigger: '.design-exhibition',
        start: 'bottom 54%',
        endTrigger: '.product-story',
        end: 'top 32%',
        scrub: true,
      },
    });
    return () => wrapper.classList.remove('has-traveler');
  });
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const unwrap = gsap.timeline({
      scrollTrigger: {
        trigger: '.unwrap-scroll',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.55,
        invalidateOnRefresh: true,
      },
    });
    unwrap
      .to(
        '.unwrap-can',
        { xPercent: -55, rotation: -15, opacity: 0.15, duration: 0.85, ease: 'none' },
        0,
      )
      .to('.unwrap-can .can-label-layer', { opacity: 0, duration: 0.5 }, 0)
      .to(
        '.unwrapped-label',
        { opacity: 1, rotateY: 0, scaleX: 1, x: 0, duration: 1, ease: 'none' },
        0,
      )
      .to(
        '.label-curl',
        { opacity: 0, scaleX: 0, transformOrigin: 'right center', duration: 0.75 },
        0.25,
      )
      .to('.unwrap-instruction', { opacity: 0, duration: 0.2 }, 0.75);
    gsap.fromTo(
      '.callout',
      { opacity: 0.3, x: 10 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '.product-callouts',
          start: 'top 80%',
          end: 'bottom 65%',
          scrub: true,
        },
      },
    );
  });
  const hover = document.querySelector<HTMLElement>('.occasion-hover')!;
  const hoverArt = hover.querySelector<SVGElement>('.label-artwork')!;
  const hoverCan = hover.querySelector<HTMLElement>('.can')!;
  const menu = document.querySelector<HTMLElement>('.occasion-menu')!;
  const hoverCapable = window.matchMedia('(hover: hover) and (min-width: 901px)');
  const moveHover = gsap.quickTo(hover, 'y', { duration: 0.35, ease: 'power3.out' });
  document.querySelectorAll<HTMLElement>('.occasion-row').forEach((row) => {
    row.addEventListener('pointerenter', () => {
      if (
        !hoverCapable.matches ||
        reduced.matches ||
        row.querySelector('button')?.getAttribute('aria-expanded') === 'true'
      )
        return;
      const design = designs.find((d) => d.id === row.dataset.occasion)!;
      hoverCan.style.setProperty('--label-color', design.color);
      hoverCan.style.setProperty('--label-ink', design.ink);
      hoverArt.dataset.design = design.id;
      hoverArt.querySelector('[data-label-name]')!.textContent = design.sampleName;
      hoverArt.querySelector('[data-label-age]')!.textContent = design.sampleAge;
      hoverArt.querySelector('[data-label-message]')!.textContent = design.sampleMessage;
      hover.style.opacity = '1';
    });
    row.addEventListener(
      'pointermove',
      (event) => {
        if (hoverCapable.matches && !reduced.matches)
          moveHover(event.clientY - menu.getBoundingClientRect().top - 330);
      },
      { passive: true },
    );
    row.addEventListener('pointerleave', () => {
      hover.style.opacity = '0';
    });
    row.querySelector('button')?.addEventListener('click', () => {
      hover.style.opacity = '0';
      ScrollTrigger.refresh();
    });
  });
  // Refresh once font metrics and lazy photography have settled, not on each frame.
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
