import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartLine = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string | null;
};

type CartState = {
  storeSlug: string | null;
  items: CartLine[];
  ensureShop: (slug: string) => void;
  addItem: (line: Omit<CartLine, 'quantity'> & { quantity?: number }) => void;
  setQty: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      storeSlug: null,
      items: [],
      ensureShop: (slug) => {
        if (get().storeSlug !== slug) {
          set({ storeSlug: slug, items: [] });
        }
      },
      addItem: (line) => {
        const qty = line.quantity ?? 1;
        const items = get().items;
        const idx = items.findIndex((i) => i.productId === line.productId);
        if (idx >= 0) {
          const next = [...items];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
          set({ items: next });
          return;
        }
        set({
          items: [
            ...items,
            {
              productId: line.productId,
              name: line.name,
              unitPrice: line.unitPrice,
              imageUrl: line.imageUrl,
              quantity: qty,
            },
          ],
        });
      },
      setQty: (productId, quantity) => {
        if (quantity < 1) {
          set({ items: get().items.filter((i) => i.productId !== productId) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        });
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      clear: () => set({ items: [] }),
    }),
    { name: 'tutienda-cart' },
  ),
);
