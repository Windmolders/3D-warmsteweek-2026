import models from "./data/models.json";
import type { Model } from "./types";
import { ORDER_FORM, SITE_TITLE, asset } from "./config";

const allModels = models as Model[];
const SITE_URL = "https://windmolders.github.io/3D-warmsteweek-2026/";

/** Lines like "Large  € 19" for models with variants, or a single "€ 15". */
function priceLines(m: Model): { label?: string; price: string }[] {
  if (m.variants && m.variants.length > 1) {
    return m.variants.filter((v) => v.price).map((v) => ({ label: v.label, price: v.price! }));
  }
  const price = m.variants?.[0]?.price ?? m.price;
  return price ? [{ price }] : [];
}

/** Printable A4 price list at /#/pricelist (use the browser's Print / Save as PDF). */
export function PriceList() {
  return (
    <main className="pricelist">
      <header className="pl-head">
        <h1>{SITE_TITLE} – Price list</h1>
        <p>All proceeds go to charity.</p>
        <p>
          See all models in every color at <strong>{SITE_URL}</strong>
        </p>
      </header>

      <div className="pl-grid">
        {allModels.map((m) => (
          <div key={m.id} className="pl-card">
            {m.photos[0] && <img src={asset(m.photos[0])} alt={m.name} />}
            <div className="pl-name">{m.name}</div>
            <div className="pl-prices">
              {priceLines(m).map((l) => (
                <div key={l.label ?? "single"}>
                  {l.label && <span className="pl-label">{l.label}</span>}
                  <strong>{l.price}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="pl-foot">
        Order via the order form: <strong>{ORDER_FORM.url}</strong>
        <br />
        Questions or special requests? Contact Jonas Windmolders on Teams.
      </footer>
    </main>
  );
}
