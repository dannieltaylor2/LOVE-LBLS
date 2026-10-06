import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { designs } from '../data/site';
import { mountProductContinuity, mountLocalUnwrap } from './product-continuity';

gsap.registerPlugin(ScrollTrigger);
let disposePrevious: (() => void) | undefined;
export function initMotion() {
  disposePrevious?.();
  const media = gsap.matchMedia();
  const heroProduct = document.querySelector<HTMLElement>('.hero-product')!;
  const heroCan = document.querySelector<HTMLElement>('.hero-can')!;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const abort = new AbortController();
  const signal = abort.signal;
  let scrollRadius = 0,
    pointerRadius = 0,
    keyboardRevealed = false;
  let targetX = 120,
    targetY = 280,
    currentX = 120,
    currentY = 280;
  let frame = 0,
    disposed = false;
  function drawMask() {
    const radius = keyboardRevealed ? 900 : Math.max(scrollRadius, pointerRadius);
    heroCan.style.setProperty('--reveal-x', `${currentX}px`);
    heroCan.style.setProperty('--reveal-y', `${currentY}px`);
    heroCan.style.setProperty('--reveal-radius', `${radius}px`);
    heroCan.style.setProperty('--reveal-alpha', String(Math.min(1, radius / 30)));
    const label = document.querySelector<HTMLElement>('.motion-label-surface');
    if (label) {
      label.style.setProperty('--pointer-x', `${currentX - 20}px`);
      label.style.setProperty('--pointer-y', `${currentY - 100}px`);
      label.style.setProperty('--pointer-radius', `${radius}px`);
      label.style.setProperty('--reveal-alpha', String(Math.min(1, radius / 30)));
    }
  }
  function stopPointer() {
    cancelAnimationFrame(frame);
    frame = 0;
    pointerRadius = 0;
    drawMask();
  }
  function tick() {
    currentX += (targetX - currentX) * 0.24;
    currentY += (targetY - currentY) * 0.24;
    drawMask();
    if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.15)
      frame = requestAnimationFrame(tick);
    else frame = 0;
  }
  function move(event: PointerEvent) {
    if (reduced.matches) return;
    const matrix = heroCan.querySelector<SVGSVGElement>('.can-metal')!.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    targetX = point.x;
    targetY = point.y;
    pointerRadius = 130;
    if (!frame) frame = requestAnimationFrame(tick);
  }
  heroProduct.addEventListener('pointermove', move, { passive: true, signal });
  heroProduct.addEventListener('pointerdown', move, { passive: true, signal });
  heroProduct.addEventListener('pointerleave', stopPointer, { signal });
  heroProduct.addEventListener('pointercancel', stopPointer, { signal });
  heroProduct.addEventListener(
    'pointerup',
    (e) => {
      if (e.pointerType !== 'mouse') stopPointer();
    },
    { signal },
  );
  heroProduct.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        keyboardRevealed = !keyboardRevealed;
        heroProduct.setAttribute('aria-pressed', String(keyboardRevealed));
        drawMask();
      }
    },
    { signal },
  );
  const pointerObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) stopPointer();
  });
  pointerObserver.observe(heroProduct);
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) stopPointer();
    },
    { signal },
  );

  const headings = new Map<HTMLElement, string>();
  document.querySelectorAll<HTMLElement>('main h2').forEach((heading) => {
    headings.set(heading, heading.innerHTML);
    const lines: HTMLSpanElement[] = [];
    let line = document.createElement('span');
    line.className = 'motion-type-line';
    for (const child of Array.from(heading.childNodes)) {
      if (child.nodeName === 'BR') {
        lines.push(line);
        line = document.createElement('span');
        line.className = 'motion-type-line';
      } else line.append(child);
    }
    lines.push(line);
    heading.replaceChildren(...lines);
  });

  media.add(
    {
      desktop: '(min-width: 901px) and (min-height: 650px)',
      mobile: '(max-width: 900px), (max-height: 649px)',
      motion: '(prefers-reduced-motion: no-preference)',
    },
    (context) => {
      const { desktop, motion } = context.conditions!;
      if (!motion) {
        scrollRadius = 900;
        drawMask();
        return;
      }
      let releaseContinuity: (() => void) | undefined;
      if (desktop) {
        releaseContinuity = mountProductContinuity((progress) => {
          const next = progress * 900;
          if (next !== scrollRadius) {
            scrollRadius = next;
            drawMask();
          }
        });
        drawMask();
        gsap
          .timeline({
            scrollTrigger: {
              trigger: '.hero-scroll',
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
          .to(
            '.hero-text',
            { opacity: 0, clipPath: 'inset(0 0 100% 0)', duration: 0.25, ease: 'none' },
            0.18,
          )
          .to('.reveal-annotation', { opacity: 0, duration: 0.16, ease: 'none' }, 0.05)
          .to('.hero-payoff', { autoAlpha: 1, duration: 0.25, ease: 'none' }, 0.45)
          .to({}, { duration: 0.3 }, 0.7);
      } else {
        const mask = { radius: 0 };
        gsap.to(mask, {
          radius: 900,
          ease: 'none',
          onUpdate: () => {
            scrollRadius = mask.radius;
            drawMask();
          },
          scrollTrigger: {
            trigger: heroProduct,
            start: 'top 70%',
            end: 'center 35%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        releaseContinuity = mountLocalUnwrap();
      }
      document.querySelectorAll<HTMLElement>('main h2:not(.hero-payoff h2)').forEach((heading) => {
        gsap.fromTo(
          heading.querySelectorAll('.motion-type-line'),
          { clipPath: 'inset(0 0 100% 0)' },
          {
            clipPath: 'inset(0 0 0% 0)',
            stagger: 0.12,
            ease: 'none',
            scrollTrigger: {
              trigger: heading,
              start: 'top 94%',
              end: 'bottom 72%',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
      document
        .querySelectorAll<HTMLElement>('.section-kicker, .design-caption, .occasion-row')
        .forEach((el) => {
          gsap.fromTo(
            el,
            { '--line-progress': 0 },
            {
              '--line-progress': 1,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 72%', scrub: true },
            },
          );
        });
      document.querySelectorAll<HTMLElement>('.callout').forEach((el, index) => {
        gsap.fromTo(
          el,
          { opacity: 0.15, '--callout-progress': 0 },
          {
            opacity: 1,
            '--callout-progress': 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.product-story',
              start: `top ${76 - index * 5}%`,
              end: 'center 55%',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
      document
        .querySelectorAll<HTMLElement>('.story-main-image, .story-secondary-image')
        .forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: 'inset(0 0 16% 0)' },
            {
              clipPath: 'inset(0 0 0% 0)',
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top 95%', end: 'center 65%', scrub: true },
            },
          );
        });
      return () => {
        releaseContinuity?.();
        scrollRadius = 0;
        stopPointer();
      };
    },
  );
  const hover = document.querySelector<HTMLElement>('.occasion-hover')!;
  const hoverArt = hover.querySelector<SVGElement>('.label-artwork')!;
  const hoverCan = hover.querySelector<HTMLElement>('.can')!;
  const menu = document.querySelector<HTMLElement>('.occasion-menu')!;
  const hoverCapable = window.matchMedia('(hover: hover) and (min-width: 901px)');
  const moveHover = gsap.quickTo(hover, 'y', { duration: 0.35, ease: 'power3.out' });
  document.querySelectorAll<HTMLElement>('.occasion-row').forEach((row) => {
    row.addEventListener(
      'pointerenter',
      () => {
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
      },
      { signal },
    );
    row.addEventListener(
      'pointermove',
      (event) => {
        if (hoverCapable.matches && !reduced.matches)
          moveHover(event.clientY - menu.getBoundingClientRect().top - 330);
      },
      { passive: true, signal },
    );
    row.addEventListener(
      'pointerleave',
      () => {
        hover.style.opacity = '0';
      },
      { signal },
    );
    row.querySelector('button')?.addEventListener(
      'click',
      () => {
        hover.style.opacity = '0';
        ScrollTrigger.refresh();
      },
      { signal },
    );
  });
  // All geometry reads happen during refresh, never in the scroll-render path.
  const refreshTask = gsap
    .delayedCall(0.12, () => {
      if (!disposed) ScrollTrigger.refresh();
    })
    .pause();
  const scheduleRefresh = () => refreshTask.restart(true);
  const resizeObserver = new ResizeObserver(scheduleRefresh);
  resizeObserver.observe(document.querySelector('main')!);
  document
    .querySelectorAll('img, image')
    .forEach((image) => image.addEventListener('load', scheduleRefresh, { once: true, signal }));
  document.fonts.ready.then(() => {
    if (!disposed) scheduleRefresh();
  });
  window.addEventListener('load', scheduleRefresh, { once: true, signal });
  window.addEventListener('pageshow', scheduleRefresh, { signal });
  window.addEventListener('orientationchange', scheduleRefresh, { signal });
  disposePrevious = () => {
    disposed = true;
    abort.abort();
    pointerObserver.disconnect();
    resizeObserver.disconnect();
    refreshTask.kill();
    moveHover.tween.kill();
    cancelAnimationFrame(frame);
    media.revert();
    headings.forEach((html, heading) => {
      heading.innerHTML = html;
    });
  };
  document.addEventListener('astro:before-swap', disposePrevious, { once: true, signal });
}
