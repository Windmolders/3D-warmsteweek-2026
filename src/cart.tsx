import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import models from "./data/models.json";
import colors from "./data/colors.json";
import type { Model, PrintColor } from "./types";
import { asset, buildOrderUrl } from "./config";

const allModels = models as Model[];
const allColors = colors as PrintColor[];
const STORAGE_KEY = "cart";

/** Only ids are stored, so names and prices always come from the current data files. */
export interface CartItem {
  modelId: string;
  variantId?: string;
  colorId: string;
  qty: number;
}

/** A cart item joined with the current model, variant and color data. */
function resolve(item: CartItem) {
  const model = allModels.find((m) => m.id === item.modelId);
  const color = allColors.find((c) => c.id === item.colorId);
  const variant = model?.variants?.find((v) => v.id === item.variantId);
  if (!model || !color || (model.variants?.length && !variant)) return null;
  const price = variant?.price ?? model.price ?? "";
  const amount = Number(price.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
  return { item, model, color, variant, amount };
}

type Line = NonNullable<ReturnType<typeof resolve>>;

const euro = (n: number) => `€ ${Number.isInteger(n) ? n : n.toFixed(2)}`;
const keyOf = (i: CartItem) => `${i.modelId}|${i.variantId ?? ""}|${i.colorId}`;

/** One line per ordered piece (Model - submodel - color - price), followed by the total. */
function orderText(lines: Line[], total: number): string {
  const rows = lines.flatMap((l) => {
    const row = [l.model.name, l.variant?.label, l.color.name, euro(l.amount)].filter(Boolean).join(" - ");
    return Array<string>(l.item.qty).fill(row);
  });
  return [...rows, "", `Total: ${euro(total)}`].join("\n");
}

function load(): CartItem[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    // Drop entries for models or colors that no longer exist.
    return Array.isArray(stored) ? (stored as CartItem[]).filter((i) => i.qty > 0 && resolve(i)) : [];
  } catch {
    return [];
  }
}

interface Cart {
  items: CartItem[];
  count: number;
  add: (item: Omit<CartItem, "qty">) => void;
  setQty: (item: CartItem, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<Cart | null>(null);

export function useCart(): Cart {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart needs CartProvider");
  return cart;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage blocked: the cart only lives until the page is closed.
    }
  }, [items]);

  const cart: Cart = {
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    add: (item) =>
      setItems((prev) => {
        const key = keyOf({ ...item, qty: 1 });
        return prev.some((i) => keyOf(i) === key)
          ? prev.map((i) => (keyOf(i) === key ? { ...i, qty: i.qty + 1 } : i))
          : [...prev, { ...item, qty: 1 }];
      }),
    setQty: (item, qty) =>
      setItems((prev) =>
        qty < 1
          ? prev.filter((i) => keyOf(i) !== keyOf(item))
          : prev.map((i) => (keyOf(i) === keyOf(item) ? { ...i, qty } : i)),
      ),
    clear: () => setItems([]),
  };

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function CartPage() {
  const { items, setQty, clear } = useCart();
  const lines = items.map(resolve).filter((l): l is Line => l !== null);
  const total = lines.reduce((sum, l) => sum + l.amount * l.item.qty, 0);

  if (!lines.length) {
    return (
      <main className="container">
        <h1>Cart</h1>
        <p className="lead">Your cart is empty.</p>
        <Link to="/">← All models</Link>
      </main>
    );
  }

  return (
    <main className="container">
      <Link to="/" className="back">← All models</Link>
      <h1>Cart</h1>
      <section className="panel">
        {lines.map(({ item, model, color, variant, amount }) => (
          <div className="cart-row" key={keyOf(item)}>
            {model.photos[0] && <img src={asset(model.photos[0])} alt="" />}
            <div className="cart-info">
              <Link to={`/model/${model.id}?color=${color.id}${variant ? `&variant=${variant.id}` : ""}`}>
                {model.name}
              </Link>
              <span>
                <i className="dot" style={{ background: color.hex }} />
                {[variant?.label, color.name].filter(Boolean).join(" · ")}
              </span>
            </div>
            <div className="qty">
              <button onClick={() => setQty(item, item.qty - 1)} aria-label="One less">−</button>
              <span>{item.qty}</span>
              <button onClick={() => setQty(item, item.qty + 1)} aria-label="One more">+</button>
            </div>
            <strong className="cart-price">{euro(amount * item.qty)}</strong>
            <button className="remove" onClick={() => setQty(item, 0)} aria-label="Remove">✕</button>
          </div>
        ))}
        <div className="cart-total">
          <span>Total</span>
          <span>{euro(total)}</span>
        </div>
        <div className="actions">
          <a className="btn" href={buildOrderUrl(orderText(lines, total))} target="_blank" rel="noopener noreferrer">
            Place order
          </a>
          <button className="btn secondary" onClick={clear}>Clear cart</button>
        </div>
        <p className="note">
          Your order is filled in on the order form. It is only placed after you submit that form.
        </p>
      </section>
    </main>
  );
}
