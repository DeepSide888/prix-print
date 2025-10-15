import React, { useRef } from "react"
import axios from "axios"
import useStore from "../utils/store.js"
import DataImport from "./DataImport.jsx"
import LabelEditor from "./LabelEditor.jsx"
import PreviewGrid from "./PreviewGrid.jsx"

export default function Editor() {
  const { labels, layout, items, setItems, setLabels, loadProject, goHome, goAssets } = useStore()
  const openRef = useRef(null)

  const exportPDF = async () => {
    const payload = { labels, layout }
    const res = await axios.post("/api/export/pdf", payload, { responseType: "blob" })
    downloadBlob(res.data, "labels.pdf")
  }

  const saveProject = () => {
    const blob = new Blob([JSON.stringify({ items, labels, layout }, null, 2)], { type: "application/json" })
    downloadBlob(blob, "project.prixprint.json")
  }

  const openProject = (f) => {
    if (!f) return
    const fr = new FileReader()
    fr.onload = () => {
      try { loadProject(JSON.parse(fr.result)) }
      catch { alert("Fichier projet invalide") }
    }
    fr.readAsText(f)
  }

  return (
    <>
      <div className="wrap">
        <div className="grow">
          <div className="toolbar" style={{ gap: 12, borderBottom: "1px solid var(--ring)", background: "#fff" }}>
            <button className="btn btn-outline" onClick={goHome}>Accueil</button>
            <DataImport />
            <button className="btn btn-outline" onClick={() => openRef.current?.click()}>Ouvrir (.json)</button>
            <button className="btn btn-outline" onClick={saveProject}>Sauvegarder (.json)</button>
            <button className="btn" onClick={goAssets}>Gestionnaire d’Assets</button>
            <div style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={exportPDF}>Exporter PDF</button>
          </div>

          <div style={{ padding: 16 }}>
            <div className="section" style={{ padding: 12 }}>
              <PreviewGrid />
            </div>
          </div>
        </div>

        <div className="panel" style={{ borderLeft: "1px solid var(--ring)", boxShadow: "var(--shadow)" }}>
          <LabelEditor />
          <div className="small" style={{ marginTop: 12 }}>
            <div>Page: A4 portrait. Marges {layout.margins.mm} mm.</div>
            <div>Grille: {layout.cols}×{layout.rows}. Étiquette {Math.round(layout.label.w*100)/100}×{Math.round(layout.label.h*100)/100} mm.</div>
          </div>
        </div>
      </div>

      <input ref={openRef} className="hidden-input" type="file" accept=".json" onChange={(e) => openProject(e.target.files?.[0])}/>
    </>
  )
}

function downloadBlob(dataOrBlob, filename) {
  const blob = dataOrBlob instanceof Blob ? dataOrBlob : new Blob([dataOrBlob])
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
