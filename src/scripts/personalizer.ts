import { designs } from '../data/site';

type DesignState = {
  design: string;
  occasion: string;
  name: string;
  age: string;
  message: string;
  color: string;
  ink: string;
};
const STORAGE_KEY = 'love-labels:design:v1';
const defaults: DesignState = {
  design: 'birthday',
  occasion: 'birthday',
  name: 'Christopher',
  age: '18',
  message: 'Now you have the freedom!',
  color: '#f20c95',
  ink: '#292b1c',
};
const q = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;
export function initPersonalizer() {
  const form = q<HTMLFormElement>('#personalizer-form');
  const nameInput = q<HTMLInputElement>('#recipient');
  const ageInput = q<HTMLInputElement>('#age');
  const messageInput = q<HTMLTextAreaElement>('#message');
  const occasionInput = q<HTMLSelectElement>('#occasion');
  const status = q<HTMLElement>('#personalizer-status');
  const photoInput = q<HTMLInputElement>('#photo');
  const removePhoto = q<HTMLButtonElement>('#remove-photo');
  const dialog = q<HTMLDialogElement>('#design-preview');
  let photoData = '';
  let photoVersion = 0;
  let saveTimer: ReturnType<typeof setTimeout>;
  let state: DesignState = { ...defaults };
  let storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      if (designs.some((d) => d.id === saved.design)) state.design = saved.design;
      if (Array.from(occasionInput.options).some((o) => o.value === saved.occasion))
        state.occasion = saved.occasion;
      for (const key of ['name', 'message'] as const)
        if (typeof saved[key] === 'string')
          state[key] = saved[key].slice(0, key === 'name' ? 24 : 80);
      if (
        typeof saved.age === 'string' &&
        /^(?:\d{1,3})?$/.test(saved.age) &&
        Number(saved.age) <= 120
      )
        state.age = saved.age;
      const palette = designs.find((d) => d.color === saved.color);
      if (palette) {
        state.color = palette.color;
        state.ink = palette.ink;
      }
    }
  } catch {
    storageAvailable = false;
  }

  function syncInputs() {
    nameInput.value = state.name;
    ageInput.value = state.age;
    messageInput.value = state.message;
    occasionInput.value = state.occasion;
  }
  function setButtonStates() {
    document.querySelectorAll<HTMLButtonElement>('[data-design-option]').forEach((button) => {
      const selected = button.dataset.designOption === state.design;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll<HTMLButtonElement>('[data-color]').forEach((button) => {
      const selected = button.dataset.color === state.color;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  function render() {
    document.querySelectorAll<HTMLElement>('.live-can, .mini-can, .review-can').forEach((can) => {
      can.style.setProperty('--label-color', state.color);
      can.style.setProperty('--label-ink', state.ink);
      can.dataset.design = state.design;
      can.setAttribute(
        'aria-label',
        `${designs.find((d) => d.id === state.design)?.name} label for ${state.name || 'someone special'}${state.age ? ', age ' + state.age : ''}. ${state.message}`,
      );
      can.querySelectorAll<SVGElement>('.label-artwork').forEach((art) => {
        art.dataset.design = state.design;
        const name = art.querySelector('[data-label-name]')!;
        name.textContent = (state.name || 'YOUR NAME').toLocaleUpperCase();
        if (state.name.length < 10) name.removeAttribute('textLength');
        else name.setAttribute('textLength', '350');
        art.querySelector('[data-label-age]')!.textContent = state.age;
        const message = art.querySelector('[data-label-message]')!;
        message.textContent = (state.message || 'MADE JUST FOR YOU.').toLocaleUpperCase();
        if (state.message.length < 28) message.removeAttribute('textLength');
        else message.setAttribute('textLength', '330');
        const photo = art.querySelector<SVGImageElement>('[data-label-photo]')!;
        if (photoData) {
          photo.setAttribute('href', photoData);
          photo.style.display = '';
        } else {
          photo.removeAttribute('href');
          photo.style.display = 'none';
        }
      });
    });
    q('#message-count').textContent = `${state.message.length} / 80`;
    q('#summary-name').textContent = state.name || 'Someone special';
    q('#summary-occasion').textContent = occasionInput.selectedOptions[0].text;
    q('#summary-message').textContent = state.message || 'Made just for you.';
    setButtonStates();
    document.dispatchEvent(new Event('love-labels:change'));
  }
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        storageAvailable = true;
      } catch {
        storageAvailable = false;
      }
      status.textContent = storageAvailable
        ? 'Your design is saved on this device.'
        : 'Preview updated. Browser storage is unavailable; download your design to keep it.';
    }, 400);
  }
  function selectDesign(id: string, updateOccasion = true) {
    const design = designs.find((d) => d.id === id);
    if (!design) return;
    state.design = design.id;
    state.color = design.color;
    state.ink = design.ink;
    if (updateOccasion) {
      state.occasion = design.id;
      occasionInput.value = design.id;
    }
    render();
    save();
  }
  form.addEventListener('input', (event) => {
    if (event.target === nameInput) state.name = nameInput.value;
    if (event.target === ageInput) state.age = ageInput.validity.valid ? ageInput.value : '';
    if (event.target === messageInput) state.message = messageInput.value;
    render();
    if (event.target !== photoInput) save();
  });
  occasionInput.addEventListener('change', () => {
    state.occasion = occasionInput.value;
    const map: Record<string, string> = {
      wedding: 'anniversary',
      'thank-you': 'name-day',
      graduation: 'birthday',
      team: 'friends',
      'just-because': 'friends',
    };
    selectDesign(map[state.occasion] || state.occasion, false);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-color]').forEach((button) =>
    button.addEventListener('click', () => {
      state.color = button.dataset.color!;
      state.ink = button.dataset.ink!;
      render();
      save();
    }),
  );
  document
    .querySelectorAll<HTMLButtonElement>('[data-design-option]')
    .forEach((button) =>
      button.addEventListener('click', () => selectDesign(button.dataset.designOption!)),
    );
  document
    .querySelectorAll<HTMLAnchorElement>('[data-select-design]')
    .forEach((link) =>
      link.addEventListener('click', () => selectDesign(link.dataset.selectDesign!)),
    );

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files?.[0];
    if (!file) return;
    const version = ++photoVersion;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      status.textContent = 'Choose a JPG, PNG or WebP image smaller than 5 MB.';
      photoInput.value = '';
      return;
    }
    try {
      // Draw a square center crop, preserving the original aspect ratio.
      const original = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      const side = Math.min(original.width, original.height);
      context.drawImage(
        original,
        (original.width - side) / 2,
        (original.height - side) / 2,
        side,
        side,
        0,
        0,
        600,
        600,
      );
      original.close();
      if (version !== photoVersion) return;
      photoData = canvas.toDataURL('image/jpeg', 0.85);
      removePhoto.hidden = false;
      render();
      clearTimeout(saveTimer);
      status.textContent = 'Photo added. It stays on your device and is included in your download.';
    } catch {
      if (version === photoVersion)
        status.textContent = 'That image could not be opened. Please try another JPG, PNG or WebP.';
    }
  });
  removePhoto.addEventListener('click', () => {
    photoVersion++;
    photoData = '';
    photoInput.value = '';
    removePhoto.hidden = true;
    render();
    status.textContent = 'Photo removed.';
  });
  const angleInput = q<HTMLInputElement>('#can-angle');
  function setAngle(value: string) {
    angleInput.value = value;
    q<HTMLElement>('.live-can').style.setProperty('--can-angle', `${value}deg`);
    document.dispatchEvent(new Event('love-labels:angle'));
    document
      .querySelectorAll<HTMLButtonElement>('[data-angle]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button.dataset.angle === value)),
      );
  }
  angleInput.addEventListener('input', () => setAngle(angleInput.value));
  document
    .querySelectorAll<HTMLButtonElement>('[data-angle]')
    .forEach((button) => button.addEventListener('click', () => setAngle(button.dataset.angle!)));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!nameInput.value.trim()) {
      nameInput.setCustomValidity('Add a name or a short dedication.');
      nameInput.reportValidity();
      nameInput.addEventListener('input', () => nameInput.setCustomValidity(''), { once: true });
      return;
    }
    render();
    q('#download-status').textContent = '';
    dialog.showModal();
  });
  q('#download-design').addEventListener('click', async () => {
    const art = q<SVGSVGElement>('.live-can .label-artwork').cloneNode(true) as SVGSVGElement;
    art.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    art.setAttribute('width', '800');
    art.setAttribute('height', '1400');
    art.removeAttribute('aria-hidden');
    if (state.design !== 'birthday')
      art.querySelector('[data-label-age]')!.setAttribute('visibility', 'hidden');
    art.style.cssText = `color:${state.ink};font-family:Arial,sans-serif`;
    art.querySelectorAll<SVGElement>('[class^="art-"]').forEach((group) => {
      if (!group.classList.contains(`art-${state.design}`)) group.remove();
    });
    // Embed the local print artwork so downloaded proofs remain self-contained.
    try {
      const response = await fetch(import.meta.env.BASE_URL + 'images/products/label-artwork.webp');
      if (!response.ok) throw new Error('Artwork unavailable');
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      art
        .querySelectorAll('[data-print-artwork]')
        .forEach((image) => image.setAttribute('href', dataUrl));
    } catch {
      q('#download-status').textContent =
        'The artwork could not be loaded. Please try downloading again.';
      return;
    }
    let source = new XMLSerializer().serializeToString(art);
    source = source
      .replace(/var\(--label-color,\s*[^)]+\)/g, state.color)
      .replace(/currentColor/g, state.ink);
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `LOVE LABELS — ${state.name} — design proof, not a print dieline`;
    const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
    parsed.documentElement.prepend(title);
    downloadFile(
      new XMLSerializer().serializeToString(parsed),
      `love-labels-${state.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'design'}.svg`,
      'image/svg+xml',
    );
    q('#download-status').textContent =
      'Your design is ready. Keep it, print a proof, or share it with someone.';
  });
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('#clear-design')) return;
    clearTimeout(saveTimer);
    photoVersion++;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* Storage may be disabled. */
    }
    state = { ...defaults };
    photoData = '';
    photoInput.value = '';
    removePhoto.hidden = true;
    syncInputs();
    render();
    setAngle('0');
    status.textContent = '';
    q('#clear-status').textContent = 'Your saved design and current photo have been cleared.';
  });
  syncInputs();
  render();
}
export function downloadFile(contents: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
