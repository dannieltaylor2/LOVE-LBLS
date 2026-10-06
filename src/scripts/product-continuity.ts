import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Pose = { x: number; y: number; w: number; h: number; r: number };
type Stop = { at: number; pose: Pose; name: string };
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
const ratio = (n: number, a: number, b: number) => clamp((n - a) / Math.max(1, b - a));
function blend(a: Pose, b: Pose, t: number): Pose {
  const e = ease(t);
  return {
    x: mix(a.x, b.x, e),
    y: mix(a.y, b.y, t),
    w: mix(a.w, b.w, e),
    h: mix(a.h, b.h, e),
    r: mix(a.r, b.r, e),
  };
}
function labelOn(p: Pose): Pose {
  const offset = (p.w * 19.5) / 240;
  const angle = (p.r * Math.PI) / 180;
  return {
    x: p.x - Math.sin(angle) * offset,
    y: p.y + Math.cos(angle) * offset,
    w: (p.w * 200) / 240,
    h: (p.w * 419) / 240,
    r: p.r,
  };
}

/** One physical can and one physical label. Only their transforms change on scroll. */
export function mountProductContinuity(onHeroProgress: (progress: number) => void) {
  const q = <T extends Element = HTMLElement>(selector: string) =>
    document.querySelector<T>(selector)!;
  const can = q<HTMLElement>('.hero-can');
  const artwork = can.querySelector<SVGSVGElement>('.label-artwork')!;
  const artworkParent = artwork.parentElement!;
  const aspect = artwork.getAttribute('preserveAspectRatio');
  const oldCanStyle = can.style.cssText;
  const slot = document.createElement('div');
  slot.className = 'motion-can-slot';
  can.replaceWith(slot);
  const stage = document.createElement('div');
  stage.className = 'motion-product-stage';
  stage.setAttribute('aria-hidden', 'true');
  const body = document.createElement('div');
  body.className = 'motion-can-body';
  const label = document.createElement('div');
  label.className = 'motion-label-surface';
  const paperBack = q<HTMLElement>('.flat-art--back');
  const backParent = paperBack.parentElement!;
  const backNext = paperBack.nextSibling;
  const backStyle = paperBack.style.cssText;
  paperBack.classList.add('motion-label-back');
  const shade = document.createElement('div');
  shade.className = 'motion-label-light';
  artwork.setAttribute('preserveAspectRatio', 'none');
  label.append(artwork, paperBack, shade);
  body.append(can);
  stage.append(body, label);
  document.body.append(stage);
  document.documentElement.classList.add('object-continuity');
  const anchors = [
    '.travel-origin .can',
    '.story-fallback',
    '.unwrap-can .can',
    '.process-gift > .can',
    '.live-can',
    '.final-product > .can',
  ];
  anchors.forEach((selector) => q(selector).classList.add('motion-can-anchor'));
  q('.unwrapped-label').classList.add('motion-flat-anchor');
  q('.process-print .print-sheet').classList.add('motion-flat-anchor');
  can.style.cssText += ';width:240px;height:580px;transform:none;filter:none';
  const original = artwork.cloneNode(true) as SVGSVGElement;
  const initialColor = can.style.getPropertyValue('--label-color');
  const initialInk = can.style.getPropertyValue('--label-ink');
  const setBody = (value: string) => {
    body.style.transform = value;
  };
  const setLabel = (value: string) => {
    label.style.transform = value;
  };
  let stops: Stop[] = [];
  let width = innerWidth,
    height = innerHeight;
  let heroEnd = 1,
    unwrapStart = 0,
    unwrapEnd = 0,
    printAt = 0,
    giftAt = 0;
  let studioStart = 0,
    studioEnd = 0,
    finalDock = 0,
    finalBlank = 0;
  let flat: Pose, printed: Pose;
  let studioExit = 0;
  let personalized = false;
  let angle = 0;
  let destroyed = false;
  let textPaintFrame = 0;

  const top = (el: Element) => el.getBoundingClientRect().top + scrollY;
  function box(selector: string, rotation = 0): Pose {
    const el = q<HTMLElement>(selector),
      rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + scrollY + rect.height / 2,
      w: el.offsetWidth,
      h: el.offsetHeight,
      r: rotation,
    };
  }
  function stickyBox(
    selector: string,
    stageSelector: string,
    sectionSelector: string,
    rotation = 0,
  ): Pose {
    const result = box(selector, rotation);
    result.y += top(q(sectionSelector)) - top(q(stageSelector));
    return result;
  }
  function measure() {
    if (destroyed) return;
    width = innerWidth;
    height = innerHeight;
    heroEnd = Math.max(1, q<HTMLElement>('.hero-scroll').offsetHeight - height);
    const hero = stickyBox('.hero-product', '.hero-stage', '.hero-scroll');
    const gallery = box('.travel-origin .gallery-product', -12);
    const story = box('.story-can-target', 0);
    const unwrap = stickyBox('.unwrap-can', '.unwrap-stage', '.unwrap-scroll', -7);
    unwrapStart = top(q('.unwrap-scroll'));
    unwrapEnd = unwrapStart + Math.max(1, q<HTMLElement>('.unwrap-scroll').offsetHeight - height);
    flat = stickyBox('.unwrapped-label', '.unwrap-stage', '.unwrap-scroll', -3);
    // The front face is the actual printed object; its artwork never gets replaced by a screenshot.
    flat.x = flat.x - flat.w / 2 + (flat.h * 400) / 700 / 2;
    flat.w = (flat.h * 400) / 700;
    printed = box('.process-print .print-sheet', -19);
    printAt = Math.max(
      unwrapEnd + 120,
      Math.min(printed.y - height * 0.62, top(q('.how-it-works')) - 80),
    );
    const gift = box('.process-gift > .can', 6);
    giftAt = Math.max(printAt + height * 0.3, gift.y - height * 0.25);
    const studio = box('.live-can', 12);
    studioStart = Math.max(giftAt + 120, top(q('.personalizer')) - 80);
    studioEnd = Math.max(
      studioStart + 80,
      top(q('.personalizer')) + q<HTMLElement>('.personalizer').offsetHeight - height + 60,
    );
    const end = box('.final-product > .can', 12);
    finalDock = end.y - height * 0.6;
    finalBlank = end.y - height * 0.3;
    const exit = Math.min(studioEnd + height * 0.65, finalDock - height);
    studioExit = exit;
    const outside = (at: number): Pose => ({
      x: width + studio.w,
      y: at + height * 0.55,
      w: studio.w * 0.8,
      h: studio.h * 0.8,
      r: 18,
    });
    stops = [
      { at: 0, pose: hero, name: 'hero' },
      { at: heroEnd, pose: { ...hero, y: hero.y + heroEnd, r: -7 }, name: 'reveal' },
      {
        at: Math.max(heroEnd + 80, Math.min(gallery.y - height * 0.55, top(q('.collection')) - 80)),
        pose: gallery,
        name: 'collection',
      },
      {
        at: Math.min(gallery.y - height * 0.32, story.y - height * 0.5 - 80),
        pose: gallery,
        name: 'collection',
      },
      { at: story.y - height * 0.5, pose: story, name: 'product' },
      { at: Math.min(story.y - height * 0.43, unwrapStart - 80), pose: story, name: 'product' },
      { at: unwrapStart, pose: unwrap, name: 'unwrap' },
      { at: unwrapEnd, pose: { ...unwrap, y: unwrap.y + unwrapEnd - unwrapStart }, name: 'flat' },
      // Settle the metal body in the fourth process column before its copy enters view.
      { at: Math.max(unwrapEnd + 1, top(q('.how-it-works')) - 80), pose: gift, name: 'process' },
      { at: giftAt, pose: gift, name: 'process' },
      { at: studioStart, pose: studio, name: 'personalize' },
      { at: studioEnd, pose: studio, name: 'personalize' },
      { at: exit, pose: outside(exit), name: 'exit' },
      { at: finalDock - height * 0.7, pose: outside(finalDock - height * 0.7), name: 'interlude' },
      { at: finalDock, pose: end, name: 'final' },
      { at: finalBlank, pose: end, name: 'blank' },
    ];
    // Short landscape screens and enlarged text must still produce ordered, finite intervals.
    for (let i = 1; i < stops.length; i++) stops[i].at = Math.max(stops[i].at, stops[i - 1].at + 1);
    render();
  }
  function sample(scroll: number): { pose: Pose; scene: string } {
    if (scroll <= stops[0].at) return { pose: stops[0].pose, scene: 'hero' };
    for (let i = 1; i < stops.length; i++) {
      if (scroll <= stops[i].at)
        return {
          pose: blend(
            stops[i - 1].pose,
            stops[i].pose,
            ratio(scroll, stops[i - 1].at, stops[i].at),
          ),
          scene: stops[i].name,
        };
    }
    return { pose: stops[stops.length - 1].pose, scene: 'blank' };
  }
  function syncArtwork(usePersonalized: boolean, force = false) {
    if (personalized === usePersonalized && !force) return;
    personalized = usePersonalized;
    const sourceCan = q<HTMLElement>('.live-can');
    const source = usePersonalized
      ? sourceCan.querySelector<SVGSVGElement>('.label-artwork')!
      : original;
    artwork.dataset.design = source.dataset.design;
    label.style.setProperty(
      '--label-color',
      usePersonalized ? sourceCan.style.getPropertyValue('--label-color') : initialColor,
    );
    label.style.setProperty(
      '--label-ink',
      usePersonalized ? sourceCan.style.getPropertyValue('--label-ink') : initialInk,
    );
    for (const selector of [
      '[data-label-name]',
      '[data-label-age]',
      '[data-label-message]',
      '[data-label-photo]',
    ]) {
      const target = artwork.querySelector(selector)!,
        from = source.querySelector(selector)!;
      for (const attribute of Array.from(target.attributes)) {
        if (!from.hasAttribute(attribute.name)) target.removeAttribute(attribute.name);
      }
      for (const attribute of Array.from(from.attributes)) {
        if (target.getAttribute(attribute.name) !== attribute.value)
          target.setAttribute(attribute.name, attribute.value);
      }
      // Recreate text runs after attribute changes: Chromium otherwise reuses stale SVG glyph paint.
      if (target instanceof SVGTextElement) target.textContent = from.textContent;
    }
    // Chromium can retain glyph paint from the old SVG viewport during a 3D handoff.
    // Invalidate text once after the new transform is committed, not on every scroll frame.
    if (destroyed) return;
    cancelAnimationFrame(textPaintFrame);
    textPaintFrame = requestAnimationFrame(() => {
      if (destroyed) return;
      artwork.querySelectorAll('text').forEach((text) => {
        text.textContent = text.textContent;
      });
      textPaintFrame = 0;
    });
  }
  function paint(set: (value: string) => void, pose: Pose, baseW: number, baseH: number, yaw = 0) {
    set(
      `translate3d(${pose.x}px,${pose.y - scrollY}px,0) rotate(${pose.r}deg) rotateY(${yaw}deg) scale(${pose.w / baseW},${pose.h / baseH}) translate(-50%,-50%)`,
    );
  }
  function render() {
    if (!stops.length || destroyed) return;
    const s = scrollY,
      { pose, scene } = sample(s);
    stage.dataset.scene = scene;
    onHeroProgress(ratio(s, 0, heroEnd));
    let paper = labelOn(pose),
      yaw = 0,
      flatten = 0;
    if (s >= unwrapStart && s <= unwrapEnd) {
      const t = ratio(s, unwrapStart, unwrapEnd);
      paper = blend(labelOn(pose), { ...flat, y: flat.y + s - unwrapStart }, t);
      yaw = -Math.sin(t * Math.PI) * 58;
      flatten = t;
    } else if (s > unwrapEnd && s < printAt) {
      paper = blend(
        { ...flat, y: flat.y + unwrapEnd - unwrapStart },
        printed,
        ratio(s, unwrapEnd, printAt),
      );
      flatten = 1;
    } else if (s >= printAt && s < giftAt) {
      const t = ratio(s, printAt, giftAt);
      paper = blend(printed, labelOn(pose), t);
      yaw = Math.sin(t * Math.PI) * 65;
      flatten = 1 - t;
    }
    const personalizeProgress = ratio(s, giftAt, studioStart);
    if (s > giftAt && s < studioStart) yaw = Math.sin(personalizeProgress * Math.PI) * 90;
    const studioYaw =
      s >= studioStart && s <= studioExit ? angle * (1 - ratio(s, studioEnd, studioExit)) : 0;
    if (s >= studioStart && s <= studioExit) yaw = studioYaw;
    if (s > finalDock) {
      const t = ratio(s, finalDock, finalBlank);
      const attached = labelOn(pose);
      paper = blend(
        attached,
        { ...attached, x: width + attached.w, y: attached.y - attached.h * 0.18, r: 45 },
        t,
      );
      yaw = -Math.sin(t * Math.PI) * 65;
      flatten = t;
    }
    paint(setBody, pose, 240, 580, studioYaw);
    paint(setLabel, paper, 200, 419, yaw);
    syncArtwork(personalizeProgress >= 0.5);
    shade.style.opacity = String(1 - flatten * 0.85);
    const backOpen = flatten * (s <= unwrapEnd ? 1 : 1 - ratio(s, unwrapEnd, printAt));
    paperBack.style.transform = `scaleX(${backOpen})`;
    paperBack.style.opacity = String(backOpen);
    label.style.setProperty('--paper-curl', String(flatten > 0 ? Math.sin(flatten * Math.PI) : 0));
    label.classList.toggle('motion-cursor-mask', s < heroEnd);
    body.style.visibility =
      pose.x - pose.w > width || pose.y - s + pose.h < 0 ? 'hidden' : 'visible';
    label.style.visibility =
      paper.x - paper.w > width || paper.y - s + paper.h < 0 ? 'hidden' : 'visible';
    stage.dataset.personalized = String(personalized);
  }
  function updatePersonalization() {
    syncArtwork(personalized, true);
    render();
  }
  function updateAngle() {
    angle = Number(q<HTMLInputElement>('#can-angle').value);
    render();
  }
  syncArtwork(false, true);
  measure();
  const trigger = ScrollTrigger.create({
    start: 0,
    end: () => ScrollTrigger.maxScroll(window),
    onUpdate: render,
    onRefresh: measure,
  });
  document.addEventListener('love-labels:change', updatePersonalization);
  document.addEventListener('love-labels:angle', updateAngle);
  return () => {
    destroyed = true;
    trigger.kill();
    cancelAnimationFrame(textPaintFrame);
    document.removeEventListener('love-labels:change', updatePersonalization);
    document.removeEventListener('love-labels:angle', updateAngle);
    // Restore the same nodes, including the original hero artwork, before mobile/reduced-motion starts.
    personalized = true;
    syncArtwork(false);
    artworkParent.append(artwork);
    backParent.insertBefore(paperBack, backNext);
    paperBack.classList.remove('motion-label-back');
    paperBack.style.cssText = backStyle;
    if (aspect === null) artwork.removeAttribute('preserveAspectRatio');
    else artwork.setAttribute('preserveAspectRatio', aspect);
    slot.replaceWith(can);
    can.style.cssText = oldCanStyle;
    stage.remove();
    anchors.forEach((selector) => q(selector).classList.remove('motion-can-anchor'));
    document
      .querySelectorAll('.motion-flat-anchor')
      .forEach((el) => el.classList.remove('motion-flat-anchor'));
    document.documentElement.classList.remove('object-continuity');
  };
}

/** Small screens keep the object local to the scene: no fixed layer or pinning. */
export function mountLocalUnwrap() {
  const scene = document.querySelector<HTMLElement>('.unwrap-stage')!;
  const visual = scene.querySelector<HTMLElement>('.unwrap-visual')!;
  const can = scene.querySelector<HTMLElement>('.unwrap-can')!;
  const art = can.querySelector<SVGSVGElement>('.label-artwork')!;
  const artParent = art.parentElement!;
  const aspect = art.getAttribute('preserveAspectRatio');
  const back = scene.querySelector<HTMLElement>('.flat-art--back')!;
  const backParent = back.parentElement!,
    backNext = back.nextSibling;
  const backStyle = back.style.cssText;
  const surface = document.createElement('div');
  surface.className = 'local-label-surface';
  surface.setAttribute('aria-hidden', 'true');
  const light = document.createElement('div');
  light.className = 'motion-label-light';
  back.classList.add('motion-label-back');
  art.setAttribute('preserveAspectRatio', 'none');
  surface.append(art, back, light);
  visual.append(surface);
  scene.classList.add('local-unwrap');
  let start: Pose, end: Pose;
  const progress = { value: 0 };
  function measure() {
    const a = can.getBoundingClientRect(),
      v = visual.getBoundingClientRect();
    start = labelOn({
      x: a.left + a.width / 2 - v.left,
      y: a.top + a.height / 2 - v.top,
      w: can.offsetWidth,
      h: can.offsetHeight,
      r: -7,
    });
    const flat = scene.querySelector<HTMLElement>('.unwrapped-label')!;
    const b = flat.getBoundingClientRect();
    end = {
      x: b.left - v.left + (b.height * 400) / 700 / 2,
      y: b.top - v.top + b.height / 2,
      w: (b.height * 400) / 700,
      h: b.height,
      r: 0,
    };
    render();
  }
  function render() {
    if (!start || !end) return;
    const t = progress.value,
      p = blend(start, end, t);
    surface.style.transform = `translate3d(${p.x}px,${p.y}px,0) rotate(${p.r}deg) rotateY(${-Math.sin(t * Math.PI) * 40}deg) scale(${p.w / 200},${p.h / 419}) translate(-50%,-50%)`;
    back.style.transform = `scaleX(${t})`;
    back.style.opacity = String(t);
    light.style.opacity = String(1 - t * 0.85);
  }
  measure();
  const tween = gsap.to(progress, {
    value: 1,
    ease: 'none',
    onUpdate: render,
    scrollTrigger: {
      trigger: scene,
      start: 'top 65%',
      end: 'bottom 65%',
      scrub: true,
      onRefresh: measure,
      invalidateOnRefresh: true,
    },
  });
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    artParent.append(art);
    if (aspect === null) art.removeAttribute('preserveAspectRatio');
    else art.setAttribute('preserveAspectRatio', aspect);
    backParent.insertBefore(back, backNext);
    back.classList.remove('motion-label-back');
    back.style.cssText = backStyle;
    surface.remove();
    scene.classList.remove('local-unwrap');
  };
}
