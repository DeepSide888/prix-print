// Simple client API
const BASE =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : "http://localhost:8000"

export async function uploadFiles(files) {
  const fd = new FormData()
  for (const f of files) fd.append("files", f)
  const res = await fetch(`${BASE}/api/assets/upload`, { method: "POST", body: fd })
  if (!res.ok) throw new Error("Upload échoué")
  return res.json() // {files:[{url, filename, original, skuHint}]}
}
