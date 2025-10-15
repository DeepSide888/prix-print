import React from 'react'
import useStore from '../utils/store.js'

export default function LabelEditor() {
  const { layout, setLayout } = useStore()
  const set = (patch) => setLayout(patch)

  const Field = ({ label, children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', alignItems: 'center', gap: 8 }}>
      <div className="small" style={{ fontWeight: 600 }}>{label}</div>
      {children}
    </div>
  )

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Paramètres</h3>

      <div style={{ display: 'grid', gap: 10 }}>
        <Field label="Colonnes">
          <input type="number" value={layout.cols} min={1} max={5}
            onChange={e => set({ cols: parseInt(e.target.value || '1', 10) })} />
        </Field>

        <Field label="Lignes">
          <input type="number" value={layout.rows} min={1} max={10}
            onChange={e => set({ rows: parseInt(e.target.value || '1', 10) })} />
        </Field>

        <Field label="Marges (mm)">
          <input type="number" value={layout.margins.mm} min={0} step="1"
            onChange={e => set({ margins: { mm: parseFloat(e.target.value || '0') } })} />
        </Field>

        <Field label="Gouttière (mm)">
          <input type="number" value={layout.gutter.mm} min={0} step="1"
            onChange={e => set({ gutter: { mm: parseFloat(e.target.value || '0') } })} />
        </Field>

        <Field label="Largeur étiquette (mm)">
          <input type="number" value={layout.label.w} min={10} step="0.1"
            onChange={e => set({ label: { ...layout.label, w: parseFloat(e.target.value || '0') } })} />
        </Field>

        <Field label="Hauteur étiquette (mm)">
          <input type="number" value={layout.label.h} min={10} step="0.1"
            onChange={e => set({ label: { ...layout.label, h: parseFloat(e.target.value || '0') } })} />
        </Field>

        <div style={{ height: 8 }} />

        <Field label="Taille nom (pt)">
          <input type="number" value={layout.text.name} min={6} step="1"
            onChange={e => set({ text: { ...layout.text, name: parseFloat(e.target.value || '0') } })} />
        </Field>

        <Field label="Taille prix (pt)">
          <input type="number" value={layout.text.price} min={6} step="1"
            onChange={e => set({ text: { ...layout.text, price: parseFloat(e.target.value || '0') } })} />
        </Field>

        <Field label="Taille SKU (pt)">
          <input type="number" value={layout.text.sku} min={6} step="1"
            onChange={e => set({ text: { ...layout.text, sku: parseFloat(e.target.value || '0') } })} />
        </Field>

        <label className="small" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={layout.showBorders}
                 onChange={e => set({ showBorders: e.target.checked })} />
          Cadres visibles
        </label>
      </div>
    </div>
  )
}
