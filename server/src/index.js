/* Express API prix-print — images + PDF */
import express from "express"
import cors from "cors"
import multer from "multer"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json({ limit: "25mb" }))
app.use(express.urlencoded({ extended: true }))

// Dossier d’upload
const UPLOAD_DIR = path.join(__dirname, "..", "uploads")
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// Expose /uploads en statique
app.use("/uploads", express.static(UPLOAD_DIR))

// Multer: nommage propre
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, "_")
    cb(null, Date.now() + "_" + safe)
  }
})
const upload = multer({ storage })

/**
 * POST /api/assets/upload
 * multipart/form-data; files=[]
 * -> retourne [{url, filename, original, skuHint}]
 */
app.post("/api/assets/upload", upload.array("files", 200), (req, res) => {
  const host = req.headers.host
  const proto = req.headers["x-forwarded-proto"] || "http"
  const out = (req.files || []).map(f => {
    const url = `${proto}://${host}/uploads/${f.filename}`
    const base = path.parse(f.originalname).name
    return { url, filename: f.filename, original: f.originalname, skuHint: base }
  })
  res.json({ files: out })
})

/**
 * POST /api/export/pdf
 * Attendu: { labels, layout }
 * Placeholder minimal (renvoie un PDF vide pour ne pas casser le flux si l’ancien code n’est pas là)
 */
app.post("/api/export/pdf", async (req, res) => {
  const pdf = Buffer.from(
    "%PDF-1.4\n1 0 obj <<>> endobj\n2 0 obj << /Type /Catalog /Pages 3 0 R>> endobj\n3 0 obj << /Type /Pages /Kids [4 0 R] /Count 1>> endobj\n4 0 obj << /Type /Page /Parent 3 0 R /MediaBox [0 0 595 842]>> endobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000054 00000 n \n0000000103 00000 n \n0000000171 00000 n \ntrailer << /Root 2 0 R /Size 5>>\nstartxref\n239\n%%EOF"
  )
  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", "attachment; filename=labels.pdf")
  res.send(pdf)
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log("API on", PORT)
})
