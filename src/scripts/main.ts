import { initPersonalizer, downloadFile } from './personalizer';
import { initMotion } from './motion';

const menu = document.querySelector<HTMLDialogElement>('#mobile-menu')!;
const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
menuToggle.addEventListener('click', () => {
  menu.showModal();
  menuToggle.setAttribute('aria-expanded', 'true');
});
menu.querySelector('.menu-close')!.addEventListener('click', () => menu.close());
menu.addEventListener('close', () => menuToggle.setAttribute('aria-expanded', 'false'));
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => menu.close()));
document.addEventListener('click', (event) => {
  const target = event.target as Element;
  const close = target.closest('[data-close-dialog]');
  if (close) close.closest('dialog')?.close();
});
document.querySelectorAll('dialog').forEach((dialog) =>
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  }),
);
const header = document.querySelector<HTMLElement>('.site-header')!;
const heroSentinel = document.createElement('div');
heroSentinel.setAttribute('aria-hidden', 'true');
heroSentinel.style.cssText = 'position:absolute;top:50px;width:1px;height:1px;pointer-events:none';
document.body.prepend(heroSentinel);
new IntersectionObserver(([entry]) =>
  header.classList.toggle('scrolled', !entry.isIntersecting),
).observe(heroSentinel);
const chapters = document.querySelectorAll<HTMLElement>('[data-chapter]');
const chapterLinks = document.querySelectorAll<HTMLAnchorElement>('.chapter-nav a');
const chapterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      chapterLinks.forEach((link) => {
        const active = link.hash === '#' + entry.target.id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  },
  { rootMargin: '-15% 0px -65% 0px' },
);
chapters.forEach((section) => chapterObserver.observe(section));
document.querySelectorAll<HTMLButtonElement>('.occasion-trigger').forEach((button) =>
  button.addEventListener('click', () => {
    const panel = document.getElementById(button.getAttribute('aria-controls')!)!;
    const expanded = button.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll<HTMLButtonElement>('.occasion-trigger').forEach((other) => {
      other.setAttribute('aria-expanded', 'false');
      document.getElementById(other.getAttribute('aria-controls')!)!.hidden = true;
    });
    button.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;
  }),
);
const infoDialog = document.querySelector<HTMLDialogElement>('#info-dialog')!;
const titles: Record<string, string> = {
  faq: 'Good questions.',
  shipping: 'Shipping.',
  contact: 'Let’s make it personal.',
  terms: 'Terms.',
  privacy: 'Your privacy.',
  instagram: 'Stay in the loop.',
};
document.querySelectorAll<HTMLButtonElement>('[data-info]').forEach((button) =>
  button.addEventListener('click', () => {
    const id = button.dataset.info!;
    const template = document.querySelector<HTMLTemplateElement>(`#info-${id}`)!;
    document.querySelector('#info-title')!.textContent = titles[id];
    document.querySelector('#info-body')!.replaceChildren(template.content.cloneNode(true));
    infoDialog.showModal();
    infoDialog.scrollTop = 0;
    const form = infoDialog.querySelector<HTMLFormElement>('#enquiry-form');
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const text = `LOVE LABELS — ENQUIRY BRIEF\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}\n\nThis brief was saved locally. It has not been submitted.\n`;
      downloadFile(text, 'love-labels-enquiry.txt', 'text/plain');
      document.querySelector('#enquiry-status')!.textContent =
        'Your enquiry brief has been downloaded. Nothing has been sent.';
    });
  }),
);
initPersonalizer();
initMotion();
