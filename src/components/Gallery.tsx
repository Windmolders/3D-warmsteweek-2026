import { useState } from "react";
import { asset } from "../config";

export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [i, setI] = useState(0);
  if (photos.length === 0) return null;
  return (
    <div className="gallery">
      <img className="gallery-main" src={asset(photos[i])} alt={alt} />
      {photos.length > 1 && (
        <div className="gallery-thumbs">
          {photos.map((p, idx) => (
            <button key={p} className={idx === i ? "active" : ""} onClick={() => setI(idx)}>
              <img src={asset(p)} alt={`${alt} ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
