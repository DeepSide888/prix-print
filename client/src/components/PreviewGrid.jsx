import React from "react"
import useStore from "../utils/store.js"

export default function PreviewGrid() {
  const { labels, layout } = useStore()
  const total = layout.cols * layout.rows
  const cells = Array.from({ length: total }, (_, i) => labels[i] || {})

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${layout.cols}, ${layout.label.w}mm)`,
    gap: `${layout.gutter.mm}mm`,
    padding: `${layout.margins.mm}mm`,
    background: "var(--card)",
    borderRadius: "var(--radius)",
    border: "1px solid var(--ring)",
    boxShadow: "var(--shadow)"
  }

  return (
    <div style={gridStyle} id="preview-root">
      {cells.map((item, idx) => (
        <LabelCard key={idx} item={item} layout={layout} />
      ))}
    </div>
  )
}

function LabelCard({ item, layout }) {
  const wmm = layout.label.w
  const hmm = layout.label.h
  const leftCol = Math.min(24, Math.max(20, Math.round(wmm * 0.34)))
  const gap = 2 // mm

  const card = {
    width: `${wmm}mm`,
    height: `${hmm}mm`,
    border: layout.showBorders ? "1px dashed #ffb37a" : "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 12,
    padding: "3mm",
    display: "grid",
    gridTemplateColumns: `${leftCol}mm 1fr`,
    gridTemplateRows: "auto 1fr auto",
    columnGap: `${gap}mm`,
    rowGap: `${gap}mm`,
    boxShadow: "0 2px 10px rgba(17,24,39,.06)"
  }

  const logo = (
    <img
      alt="Point54"
      src="/point54.png"
      style={{ height: "10mm", width: "auto", gridColumn: "1 / 2", gridRow: "1 / 2" }}
    />
  )

  const refBox = {
    gridColumn: "2 / 3",
    gridRow: "1 / 2",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 2
  }

  const imageBox = {
    gridColumn: "1 / 2",
    gridRow: "2 / 4",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    background: "#fff"
  }

  const img = {
    maxWidth: "100%",
    maxHeight: "100%",
    width: "100%",
    height: "100%",
    objectFit: "contain"
  }

  const title = {
    gridColumn: "2 / 3",
    gridRow: "2 / 3",
    fontSize: layout.text.name,
    fontWeight: 700,
    lineHeight: 1.15,
    color: "#111",
    display: "flex",
    alignItems: "center"
  }

  const priceRow = {
    gridColumn: "2 / 3",
    gridRow: "3 / 4",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4
  }

  const priceSize = Math.max(layout.text.price * 2.2, 18)
  const euroSize = Math.round(priceSize * 0.55)
  const price = { fontWeight: 900, fontSize: priceSize, color: "var(--accent)", letterSpacing: ".5px" }
  const euro = { fontWeight: 900, fontSize: euroSize, color: "var(--accent)" }

  return (
    <div style={card}>
      {logo}

      <div style={refBox}>
        <div style={{ fontSize: Math.max(layout.text.sku - 1, 9), color: "#444" }}>
          Réf : <strong>{safe(item.sku)}</strong>
        </div>
        {item.barcode ? (
          <div style={{ fontSize: 11, color: "#666" }}>{`Code ${safe(item.barcode)}`}</div>
        ) : null}
      </div>

      <div style={imageBox}>
        {item.image ? (
          <img alt="" style={img} src={item.image} />
        ) : (
          <div style={{ fontSize: 11, color: "#9ca3af", padding: 4, textAlign: "center" }}>
            Image auto: /samples/images/{safe(item.sku)}.jpg
          </div>
        )}
      </div>

      <div style={title}>{safe(item.name)}</div>

      <div style={priceRow}>
        <div style={price}>{fmtPrice(item.price)}</div>
        <div style={euro}>€</div>
      </div>
    </div>
  )
}

function safe(v) {
  return v == null ? "" : String(v)
}
function fmtPrice(v) {
  if (v == null || v === "") return ""
  const s = String(v).replace(/[^\d,.\-]/g, "").replace(",", ".")
  const n = parseFloat(s)
  return isFinite(n) ? n.toFixed(2).replace(".", ",") : s
}
