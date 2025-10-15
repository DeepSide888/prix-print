import { create } from "zustand"

const useStore = create((set, get) => ({
  page: "home",
  items: [],
  labels: [],
  layout: {
    cols: 3,
    rows: 5,
    margins: { mm: 6 },
    gutter: { mm: 6 },
    label: { w: 70, h: 38 },
    text: { name: 12, price: 16, sku: 10 },
    imageMaxH: 28,
    showBorders: false
  },

  setItems: (v) => set({ items: v }),
  setLabels: (v) => set({ labels: v }),
  applyLayout: (patch) => {
    const cur = get().layout
    set({
      layout: {
        ...cur,
        ...patch,
        margins: { ...cur.margins, ...(patch?.margins || {}) },
        gutter:  { ...cur.gutter,  ...(patch?.gutter  || {}) },
        label:   { ...cur.label,   ...(patch?.label   || {}) },
        text:    { ...cur.text,    ...(patch?.text    || {}) }
      }
    })
  },

  loadProject: (data) => {
    const items = Array.isArray(data?.items) ? data.items : []
    const labels = Array.isArray(data?.labels) ? data.labels : items.slice(0, 15)
    set({ items, labels })
    if (data?.layout) get().applyLayout(data.layout)
    set({ page: "editor" })
  },

  goEditor: () => set({ page: "editor" }),
  goHome:   () => set({ page: "home" }),
  goAssets: () => set({ page: "assets" })
}))

export default useStore
