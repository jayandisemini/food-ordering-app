import { useSyncExternalStore } from "react";

export type CartItem = { id: string; qty: number };

const listeners = new Set<() => void>();
let cart: CartItem[] = [];
let favorites: Set<string> = new Set();

const emit = () => listeners.forEach((l) => l());

export const cartStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getCart: () => cart,
  getFavorites: () => favorites,
  add(id: string, qty = 1) {
    const existing = cart.find((c) => c.id === id);
    if (existing) cart = cart.map((c) => (c.id === id ? { ...c, qty: c.qty + qty } : c));
    else cart = [...cart, { id, qty }];
    emit();
  },
  setQty(id: string, qty: number) {
    cart = qty <= 0 ? cart.filter((c) => c.id !== id) : cart.map((c) => (c.id === id ? { ...c, qty } : c));
    emit();
  },
  remove(id: string) {
    cart = cart.filter((c) => c.id !== id);
    emit();
  },
  clear() {
    cart = [];
    emit();
  },
  toggleFav(id: string) {
    const next = new Set(favorites);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    favorites = next;
    emit();
  },
};

export function useCart() {
  return useSyncExternalStore(
    cartStore.subscribe,
    () => cart,
    () => cart,
  );
}
export function useFavorites() {
  return useSyncExternalStore(
    cartStore.subscribe,
    () => favorites,
    () => favorites,
  );
}
