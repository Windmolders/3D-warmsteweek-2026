import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import models from "./data/models.json";
import colors from "./data/colors.json";
import type { Model, PrintColor } from "./types";
import { DEFAULT_COLOR_ID, asset } from "./config";
import { InteractiveViewer, RenderPreview } from "./components/Viewer";
import { ColorPicker } from "./components/ColorPicker";
import { Gallery } from "./components/Gallery";
import { useCart } from "./cart";

const allModels = models as Model[];
const allColors = colors as PrintColor[];

export function Home() {
  return (
    <main className="container">
      <h1>Models</h1>
      <p className="lead">Pick a model, view it in 3D and choose your color.</p>
      <p className="location">
        Every model is on display in real life on the 2nd floor of the Corda building, close to the kitchen
        on the north side of the building. A sample of each color is available there too, so you can see the
        colors in real life.
      </p>
      <div className="grid">
        {allModels.map((m) => (
          <Link key={m.id} to={`/model/${m.id}`} className="card">
            <div className="card-img">
              {m.photos[0] ? <img src={asset(m.photos[0])} alt={m.name} loading="lazy" /> : <span>{m.name}</span>}
            </div>
            <div className="card-body">
              <strong>{m.name}</strong>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

/** Photo of the filament spool for the chosen color; falls back to a color fill when the file is missing. */
function FilamentPhoto({ color }: { color: PrintColor }) {
  const [failed, setFailed] = useState(false);
  const src = color.photo ? asset(color.photo) : undefined;
  return (
    <div className="canvas-box filament" style={!src || failed ? { background: color.hex } : undefined}>
      {src && !failed && <img src={src} alt={`${color.name} filament`} onError={() => setFailed(true)} />}
    </div>
  );
}

function AddToCart({ modelId, variantId, colorId }: { modelId: string; variantId?: string; colorId: string }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [added]);
  return (
    <>
      <button className="btn" onClick={() => { add({ modelId, variantId, colorId }); setAdded(true); }}>
        Add to cart
      </button>
      {added && <span role="status">Added ✓ <Link to="/cart">View cart</Link></span>}
    </>
  );
}

export function ModelPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const baseModel = allModels.find((m) => m.id === id);
  if (!baseModel) {
    return (
      <main className="container">
        <p>Model not found.</p>
        <Link to="/">← Back</Link>
      </main>
    );
  }
  const byId = (cid: string | null) => allColors.find((c) => c.id === cid);
  const color = byId(params.get("color")) ?? byId(DEFAULT_COLOR_ID) ?? allColors[0];
  const setParam = (key: string, value: string) =>
    setParams((prev) => { const n = new URLSearchParams(prev); n.set(key, value); return n; }, { replace: true });
  const setColor = (cid: string) => setParam("color", cid);
  const variants = baseModel.variants ?? [];
  const variant = variants.find((v) => v.id === params.get("variant")) ?? variants[0];
  const price = variant?.price ?? baseModel.price;
  // The selected variant replaces the model file for the viewers.
  const model: Model = variant ? { ...baseModel, file: variant.file, upAxis: variant.upAxis ?? baseModel.upAxis } : baseModel;

  return (
    <main className="container">
      <Link to="/" className="back">← All models</Link>
      <div className="model-head">
        <div>
          <h1>{model.name}</h1>
          <p className="lead">{model.description}</p>
        </div>
        {model.photos[0] && <img className="head-photo" src={asset(model.photos[0])} alt={model.name} />}
      </div>

      {variants.length > 1 && (
        <div className="tabs" role="tablist">
          {variants.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={v.id === variant.id}
              className={"tab" + (v.id === variant.id ? " active" : "")}
              onClick={() => setParam("variant", v.id)}
            >
              {v.label}
              {v.price && <span className="tab-price">{v.price}</span>}
            </button>
          ))}
        </div>
      )}
      {variants.length < 2 && price && (
        <div className="tabs">
          <span className="tab price-tag">{price}</span>
        </div>
      )}

      <div className="viewers">
        <figure className="main">
          <div className="canvas-box"><InteractiveViewer model={model} color={color.hex} finish={color.finish} /></div>
          <figcaption>3D model: drag to rotate, scroll to zoom</figcaption>
        </figure>
        <figure>
          <div className="canvas-box"><RenderPreview model={model} color={color.hex} finish={color.finish} /></div>
          <figcaption>You are viewing a model. Refer to the real image to understand the actual finished product.</figcaption>
        </figure>
        <figure>
          <FilamentPhoto key={color.id} color={color} />
          <figcaption>Filament: {color.name}</figcaption>
        </figure>
      </div>

      <section className="panel">
        <h2>Color: {color.name}</h2>
        <ColorPicker colors={allColors} value={color.id} onChange={setColor} />
        <p className="note">
          Colors in the models are approximate. You can see real color samples in the physical shop.
        </p> 
        <p className="note">Missing colors? Contact Jonas Windmolders on Teams to see if it is possible to add them.</p>
        <div className="actions">
          {/* With tabs the price is shown in the tab buttons instead. */}
          {variants.length < 2 && price && <span className="price">{price}</span>}
          <AddToCart
            key={`${model.id}-${variant?.id}-${color.id}`}
            modelId={model.id}
            variantId={variant?.id}
            colorId={color.id}
          />
          {model.download && (
            <a className="btn secondary" href={model.download} download>Download STL</a>
          )}
        </div>
      </section>

      <Gallery photos={model.photos} alt={model.name} />
    </main>
  );
}
