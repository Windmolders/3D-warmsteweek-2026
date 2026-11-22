import type { PrintColor } from "../types";

export function ColorPicker({
  colors,
  value,
  onChange,
}: {
  colors: PrintColor[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="swatches" role="radiogroup" aria-label="Color">
      {colors.map((c) => (
        <button
          key={c.id}
          role="radio"
          aria-checked={c.id === value}
          aria-label={c.name}
          title={c.name}
          className={"swatch" + (c.id === value ? " active" : "")}
          style={{ background: c.hex }}
          onClick={() => onChange(c.id)}
        />
      ))}
    </div>
  );
}
