import React, { useRef, useState } from "react"
import { uploadFiles } from "../utils/api.js"
import useStore from "../utils/store.js"

function norm(s = "") {
  return s.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export default function AssetManager() {
  const inputRef = useRef(null)
  const { items, setItems, goEditor, labels, setLabels } = useStore()
  const [pending, setPending] = useState(false)
  const [log, setLog] = useState([])

  const onPick = () => inputRef.current?.click()

  const autoAssociate = (files) => {
    // Associer par nom de fichier sans extension qui matche sku ou ref (insensible)
    const nameToUrl = {}
    for (const f of files) {
      const base = f.skuHint || ""
      const key = norm(base)
      nameToUrl[key] = f.url
    }

    let hit = 0
    const next = items.map((it) => {
      const k1 = norm(it.sku || "")
      const k2 = norm((it.name || "").replace(/\s+/g, ""))
      const url = nameToUrl[k1] || nameToUrl[k2] || it.image
      if (url && url !== it.image) hit++
      return { ...it, image: url }
    })
    setItems(next)
    // mets aussi à jour l’aperçu courant
    const nextLabels = labels.map((l) => {
      const k1 = norm(l?.sku || "")
      const k2 = norm((l?.name || "").replace(/\s+/g, ""))
      const url = nameToUrl[k1] || nameToUrl[k2] || l?.image
      return { ...l, image: url }
    })
    setLabels(nextLabels)
    setLog((old) => [`Associations appliquées: ${hit}`, ...old])
  }

  const onFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    setPending(true)
    try {
      const res = await uploadFiles(files)
      setLog((old) => [`Upload: ${res.files.length} fichier(s)`, ...old])
      autoAssociate(res.files)
    } catch (e) {
      alert("Upload échoué")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="hero">
      <div className="container">
        <h1>Gestionnaire d’Assets</h1>
        <div className="hero-sub">Charge et lie tes images produits</div>

        <div className="topbar" style={{ gap: 8 }}>
          <button className="btn btn-outline" onClick={goEditor}>Retour éditeur</button>
          <button className="btn btn-primary" onClick={onPick} disabled={pending}>
            {pending ? "Upload..." : "Importer des images"}
          </button>
          <input
            ref={inputRef}
            className="hidden-input"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>

        <div className="section" style={{ marginTop: 12 }}>
          <div className="small" style={{ marginBottom: 8 }}>
            Astuce: nomme les fichiers avec le <b>SKU</b> ou la <b>référence</b> pour l’association automatique. Exemple: <code>Ref_12.jpg</code>
          </div>
          <LogPanel log={log} />
        </div>
      </div>
    </div>
  )
}

function LogPanel({ log }) {
  if (!log?.length) return null
  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Journal</div>
      <ul style={{ margin: 0 }}>
        {log.map((l, i) => (
          <li key={i} className="small">{l}</li>
        ))}
      </ul>
    </div>
  )
}
