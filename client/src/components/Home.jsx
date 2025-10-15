import React from "react"
import useStore from "../utils/store.js"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { extractLayoutFromWorkbook, inferLabelFromGrid } from "../utils/xlsx_layout.js"

const norm = (s="") => s.toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"")
const ALIASES = {
  sku:["sku","reference","référence","ref","ref.","réf","réf:","refproduit","referenceproduit"],
  name:["name","designation","désignation","libelle","libellé","titre","produit","nom"],
  price:["price","prix","prixttc","pu","p.u","p.u.","tarif","montant"],
  barcode:["barcode","ean","codebar","codebarre","codebarres"],
  image:["image","photo","img","urlimage","imageurl","path","chemin"]
}
const pickCol=(hn,rh,w)=>{for(let i=0;i<hn.length;i++) if(w.includes(hn[i])) return rh[i]; return null}
const coercePrice=v=>{if(v==null)return"";const s=String(v).replace(/[^\d,.\-]/g,"").replace(",", ".");const n=parseFloat(s);return isFinite(n)?n.toFixed(2):""}
const mapRows=rows=>{
  if(!rows?.length) return []
  const rh=Object.keys(rows[0]); const hn=rh.map(norm)
  const sku=pickCol(hn,rh,ALIASES.sku), name=pickCol(hn,rh,ALIASES.name), price=pickCol(hn,rh,ALIASES.price)
  const bc=pickCol(hn,rh,ALIASES.barcode), img=pickCol(hn,rh,ALIASES.image)
  return rows.map(r=>({
    sku:r[sku]?String(r[sku]).trim():"", name:r[name]?String(r[name]).trim():"",
    price:r[price]!=null?coercePrice(r[price]):"", barcode:r[bc]?String(r[bc]):"",
    image:r[img]?String(r[img]).trim():""
  })).filter(r=>r.sku||r.name||r.barcode)
}

export default function Home() {
  const { goEditor, setItems, setLabels, applyLayout, loadDemo, goAssets } = useStore()

  const onCSV = async (file) => {
    if (!file) return
    const name = file.name.toLowerCase()
    if (name.endsWith(".csv")) {
      Papa.parse(file, { header: true, skipEmptyLines: true, complete: (res) => {
        const mapped = mapRows(res.data); setItems(mapped); setLabels(mapped.slice(0, 15)); goEditor()
      }})
    } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      const sheetName = wb.SheetNames.includes("LISTING PRODUITS") ? "LISTING PRODUITS" : wb.SheetNames[0]
      const ws = wb.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" })
      const mapped = mapRows(rows); setItems(mapped); setLabels(mapped.slice(0, 15))
      const patchCfg = extractLayoutFromWorkbook(wb); if (patchCfg && Object.keys(patchCfg).length) applyLayout(patchCfg)
      const patchGrid = inferLabelFromGrid(wb); if (patchGrid) applyLayout(patchGrid)
      goEditor()
    }
  }

  return (
    <>
      <div className="hero">
        <div className="container">
          <h1><span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:40,height:40,background:"var(--accent)",color:"#fff",borderRadius:12}}>🗂</span>&nbsp;Product Labels</h1>
          <div className="hero-sub">Point54 – Éditeur d’étiquettes professionnel</div>

          <div className="topbar">
            <div className="badge">HALLOWEEN 2025</div>
            <button className="btn btn-outline" onClick={()=>downloadEmptyProject()}>Sauvegarder (.json)</button>
          </div>

          <div className="cards">
            <div className="card" onClick={()=>goEditor()}><h3>Nouveau Projet</h3><div className="hint">Créer un nouveau projet d’étiquettes</div></div>
            <div className="card active" onClick={()=>document.getElementById("open-json").click()}><h3>Ouvrir Projet</h3><div className="hint">Charger un projet existant (.json)</div></div>
            <div className="card" onClick={()=>document.getElementById("import-csv").click()}><h3>Importer CSV/XLSX</h3><div className="hint">Charger des données produits</div></div>
            <div className="card" onClick={goAssets}><h3>Gestionnaire d’Assets</h3><div className="hint">Uploader et lier vos images</div></div>
            <div className="card" onClick={()=>goEditor()}><h3>Éditeur de Template</h3><div className="hint">Concevoir vos étiquettes</div></div>
            <div className="card" onClick={()=>goEditor()}><h3>Aperçu & Export PDF</h3><div className="hint">Visualiser et exporter</div></div>
          </div>

          <div className="spacer"/>
          <div className="section" style={{borderStyle:"dashed"}}>
            <div style={{textAlign:"center", marginBottom:12, fontWeight:700}}>Données de Démonstration</div>
            <div style={{textAlign:"center", color:"var(--muted)", fontSize:14, marginBottom:12}}>10 produits d’exemple pour tester</div>
            <div style={{display:"flex", justifyContent:"center"}}>
              <button className="btn btn-primary" onClick={loadDemo}>Charger les données démo</button>
            </div>
          </div>
        </div>
      </div>

      <input id="import-csv" className="hidden-input" type="file" accept=".csv,.xlsx,.xls" onChange={(e)=>onCSV(e.target.files[0])}/>
      <input id="open-json" className="hidden-input" type="file" accept=".json" onChange={(e)=>openProject(e, setItems, setLabels, goEditor)}/>
    </>
  )
}

function openProject(e, setItems, setLabels, goEditor){
  const f = e.target.files?.[0]; if(!f) return
  const fr = new FileReader()
  fr.onload = () => {
    try{ const data = JSON.parse(fr.result); const rows = data.items || []
      setItems(rows); setLabels(rows.slice(0,15)); goEditor()
    }catch{ alert("Fichier projet invalide") }
  }
  fr.readAsText(f)
}
function downloadEmptyProject(){
  const blob = new Blob([JSON.stringify({items:[]}, null, 2)], {type:"application/json"})
  const url = URL.createObjectURL(blob); const a = document.createElement("a")
  a.href = url; a.download = "project.json"; a.click(); URL.revokeObjectURL(url)
}
