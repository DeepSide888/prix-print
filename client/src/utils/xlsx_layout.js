import * as XLSX from 'xlsx'

// ---- Helpers ----
const norm = (s='') =>
  s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[^a-z0-9]/g,'')

const MAP = {
  cols:['colonnes','cols','nbcolonnes'],
  rows:['lignes','rows','nblignes'],
  margins_mm:['margesmm','marges','marge','margin','margins'],
  gutter_mm:['gouttieremm','gouttiere','gutter','guttermm'],
  label_w_mm:['largeuretiquettemm','labelw','labelwmm'],
  label_h_mm:['hauteuretiquettemm','labelh','labelhmm'],
  text_name_pt:['taillenompt','nametext','nametextpt'],
  text_price_pt:['tailleprixpt','pricetext','pricetextpt'],
  text_sku_pt:['tailleskupt','skutext','skutextpt'],
  show_borders:['cadresvisibles','showborders','bordures','borders'],
  image_maxh_mm:['imagemaxhmm','imagehauteurmax','imgmaxh','imgmaxhmm']
}

const num = v => {
  if (v == null || v === '') return undefined
  const s = String(v).replace(',', '.').replace(/[^\d.\-]/g,'')
  const n = parseFloat(s); return isFinite(n) ? n : undefined
}
const bool = v => (typeof v === 'boolean') ? v : ['1','true','oui','yes','y'].includes(String(v).toLowerCase())

function extractKVPairs(ws){
  const aoa = XLSX.utils.sheet_to_json(ws, { header:1, raw:true })
  const out = {}
  for (const row of aoa){
    if (!row || row.length===0) continue
    if (row.length>=2 && row[0]!=null && row[1]!=null){ out[norm(String(row[0]))]=row[1]; continue }
    if (typeof row[0]==='string' && row[0].includes(':')){
      const [k,...rest]=row[0].split(':'); out[norm(k)]=rest.join(':').trim()
    }
  }
  return out
}

// ---- Lecture CONFIG explicite (facultatif) ----
export function extractLayoutFromWorkbook(wb){
  const sn = wb.SheetNames.find(n=>/config|layout|etiquettes/i.test(n)) || null
  if (!sn) return {}
  const dict = extractKVPairs(wb.Sheets[sn])
  if (!Object.keys(dict).length) return {}

  const pick = (key) => {
    if (dict[norm(key)]!=null) return dict[norm(key)]
    const al = MAP[key]||[]; for(const a of al){ if(dict[a]!=null) return dict[a] }
    return undefined
  }

  const patch = {}
  const cols = num(pick('cols')); if(cols) patch.cols=cols
  const rows = num(pick('rows')); if(rows) patch.rows=rows
  const margins=num(pick('margins_mm')); if(margins!=null) patch.margins={mm:margins}
  const gutter =num(pick('gutter_mm'));  if(gutter !=null) patch.gutter={mm:gutter}
  const lw=num(pick('label_w_mm')); const lh=num(pick('label_h_mm'))
  if(lw||lh) patch.label={...(patch.label||{}), ...(lw?{w:lw}:{}) , ...(lh?{h:lh}:{})}
  const tN=num(pick('text_name_pt')), tP=num(pick('text_price_pt')), tS=num(pick('text_sku_pt'))
  if(tN||tP||tS) patch.text={...(patch.text||{}), ...(tN?{name:tN}:{}) , ...(tP?{price:tP}:{}) , ...(tS?{sku:tS}:{})}
  const show=pick('show_borders'); if(show!=null) patch.showBorders=bool(show)
  const imgH=num(pick('image_maxh_mm')); if(imgH!=null) patch.imageMaxH=imgH

  return patch
}

// ---- Déduction grille B..D et lignes 1..4 avec garde-fou ----
export function inferLabelFromGrid(wb){
  const ws = wb.Sheets['ETIQUETTES PRIX'] || wb.Sheets[wb.SheetNames[0]]
  if(!ws) return { label: { w: 70, h: 38 } } // fallback

  const cols = ws['!cols'] || []
  const rows = ws['!rows'] || []

  const colWmm = (i) => ((cols[i]?.w ?? 8.43) * 25.4 / 8.43)
  const rowHmm = (i) => (((rows[i]?.hpt ?? 15) * 25.4) / 72)

  let w = colWmm(1) + colWmm(2) + colWmm(3)      // B..D
  let h = rowHmm(0) + rowHmm(1) + rowHmm(2) + rowHmm(3) // 1..4

  // Validation stricte: 60–85 mm de large, 30–50 mm de haut. Sinon 70×38.
  const within = (x, min, max) => x >= min && x <= max
  if (!within(w, 60, 85) || !within(h, 30, 50)) {
    w = 70; h = 38
  }

  return { label: { w: Math.round(w*100)/100, h: Math.round(h*100)/100 } }
}
