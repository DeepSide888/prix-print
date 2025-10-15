import React, { useRef } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import useStore from '../utils/store.js'
import { extractLayoutFromWorkbook, inferLabelFromGrid } from '../utils/xlsx_layout.js'

// mapping colonnes produits
const norm = (s='') =>
  s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[^a-z0-9]/g,'')
const ALIASES = {
  sku:['sku','reference','référence','ref','ref.','réf','réf:','refproduit','referenceproduit'],
  name:['name','designation','désignation','libelle','libellé','titre','produit','nom'],
  price:['price','prix','prixttc','pu','p.u','p.u.','tarif','montant'],
  barcode:['barcode','ean','codebar','codebarre','codebarres'],
  image:['image','photo','img','urlimage','imageurl','path','chemin']
}
const pickCol = (headersNorm, rawHeaders, wanted) => {
  for (let i=0;i<headersNorm.length;i++) if (wanted.includes(headersNorm[i])) return rawHeaders[i]
  return null
}
const coercePrice = (v) => {
  if (v == null) return ''
  const s = String(v).replace(/[^\d,.\-]/g,'').replace(',', '.')
  const n = parseFloat(s); return isFinite(n) ? n.toFixed(2) : ''
}
const mapRows = (rows) => {
  if (!rows?.length) return []
  const rawHeaders = Object.keys(rows[0])
  const headersNorm = rawHeaders.map(norm)
  const skuCol     = pickCol(headersNorm, rawHeaders, ALIASES.sku)
  const nameCol    = pickCol(headersNorm, rawHeaders, ALIASES.name)
  const priceCol   = pickCol(headersNorm, rawHeaders, ALIASES.price)
  const barcodeCol = pickCol(headersNorm, rawHeaders, ALIASES.barcode)
  const imageCol   = pickCol(headersNorm, rawHeaders, ALIASES.image)
  return rows.map(r => ({
    sku: r[skuCol] != null ? String(r[skuCol]).trim() : '',
    name: r[nameCol] != null ? String(r[nameCol]).trim() : '',
    price: r[priceCol] != null ? coercePrice(r[priceCol]) : '',
    barcode: r[barcodeCol] != null ? String(r[barcodeCol]) : '',
    image: r[imageCol] != null ? String(r[imageCol]).trim() : ''
  })).filter(r => r.sku || r.name || r.barcode)
}

export default function DataImport() {
  const fileRef = useRef(null)
  const { setItems, setLabels, goEditor, applyLayout } = useStore()

  const onFile = async (f) => {
    if (!f) return
    const name = f.name.toLowerCase()

    if (name.endsWith('.csv')) {
      Papa.parse(f, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          const mapped = mapRows(res.data)
          setItems(mapped); setLabels(mapped.slice(0, 15)); goEditor()
        }
      })
      return
    }

    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const buf = await f.arrayBuffer()
      const wb = XLSX.read(buf)

      // 1) Produits
      const sheetName = wb.SheetNames.includes('LISTING PRODUITS')
        ? 'LISTING PRODUITS' : wb.SheetNames[0]
      const ws = wb.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
      const mapped = mapRows(rows)
      setItems(mapped); setLabels(mapped.slice(0, 15))

      // 2) CONFIG explicite
      const patchCfg = extractLayoutFromWorkbook(wb)
      if (patchCfg && Object.keys(patchCfg).length) applyLayout(patchCfg)

      // 3) Déduction grille (B..D, lignes 1..4)
      const patchGrid = inferLabelFromGrid(wb)
      if (patchGrid) applyLayout(patchGrid)

      goEditor()
      return
    }

    alert('Format non supporté. Utilise CSV, XLSX ou XLS.')
  }

  return (
    <>
      <button className="btn btn-outline" onClick={() => fileRef.current?.click()}>
        Importer CSV/XLSX
      </button>
      <input
        ref={fileRef}
        className="hidden-input"
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </>
  )
}
