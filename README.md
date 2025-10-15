# prix-print

Monorepo minimal pour édition et export d’étiquettes 3×5 A4.
- Front: React + Vite (drag-drop basique, import CSV/XLSX, mapping image par SKU, preview 3×5).
- Back: Node + Express + pdf-lib pour export PDF. PNG via html-to-image côté front.

## Démarrage

```bash
# 1) Installer
cd server && npm i && cd ../client && npm i

# 2) Lancer en dev
# Terminal A
cd server && npm run dev
# Terminal B
cd client && npm run dev

# Front: http://localhost:5173
# API:   http://localhost:8000
```

## Import des données

- CSV/XLSX colonnes attendues: `sku, name, price, barcode, image`.
- `image` est optionnelle. Si vide, l’app tentera `/samples/images/<sku>.jpg` ou `.png`.
- Exemple dans `samples/sample.csv`.

## Export

- PDF: bouton *Exporter PDF* qui POST vers `server` avec le layout courant.
- PNG: bouton *Exporter PNG* depuis la preview (capture client).

## Layout 3×5 A4 (par défaut)

- A4 portrait: 210×297 mm. Marges 6 mm. Grille 3 colonnes × 5 lignes.
- Taille étiquette approx: 63.3×51.0 mm.
- Ces valeurs sont paramétrables dans l’éditeur.
