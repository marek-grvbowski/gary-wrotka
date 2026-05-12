export type InquiryItem = {
  slug: string;
  name: string;
  flavor: string;
  volume: string;
  image: string;
  qty: number;
};

const KEY = 'gary-wrotka-cart-v1';
const EVENT = 'cart:change';

function read(): InquiryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is InquiryItem =>
      x && typeof x.slug === 'string' && typeof x.qty === 'number'
    );
  } catch {
    return [];
  }
}

function write(items: InquiryItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: items }));
}

export function getCart(): InquiryItem[] {
  return read();
}

export function addItem(item: Omit<InquiryItem, 'qty'>, qty = 1) {
  const items = read();
  const existing = items.find((x) => x.slug === item.slug);
  if (existing) {
    existing.qty += qty;
  } else {
    items.push({ ...item, qty });
  }
  write(items);
  showToast(`Dodano: ${item.name}`);
}

export function removeItem(slug: string) {
  write(read().filter((x) => x.slug !== slug));
}

export function updateQty(slug: string, qty: number) {
  const items = read();
  const item = items.find((x) => x.slug === slug);
  if (!item) return;
  if (qty <= 0) {
    write(items.filter((x) => x.slug !== slug));
  } else {
    item.qty = qty;
    write(items);
  }
}

export function clearCart() {
  write([]);
}

export function count(): number {
  return read().reduce((sum, x) => sum + x.qty, 0);
}

export function totalItems(): number {
  return read().length;
}

function showToast(message: string) {
  const el = document.getElementById('gw-toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
  window.clearTimeout((el as any)._t);
  (el as any)._t = window.setTimeout(() => el.classList.remove('visible'), 2200);
}

function updateBadges() {
  const c = count();
  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
    el.textContent = String(c);
    el.dataset.empty = c === 0 ? '1' : '0';
  });
}

export function initInquiryCart() {
  if (typeof window === 'undefined') return;
  updateBadges();
  window.addEventListener(EVENT, updateBadges);
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) updateBadges();
  });

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const openBtn = target.closest('[data-open-drawer]');
    if (openBtn) {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('drawer:open'));
    }
  });
}
