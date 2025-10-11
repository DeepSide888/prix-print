import * as XLSX from 'xlsx';
import { Product } from '@/types/product';

export const exportToExcel = async (
  products: Product[],
  logoUrl: string | null
): Promise<void> => {
  // Create new workbook
  const wb = XLSX.utils.book_new();
  
  // Create labels sheet
  const ws = XLSX.utils.aoa_to_sheet([]);
  
  // Set column widths (approximate for 3 labels across A4 landscape)
  const colWidths = [
    { wch: 8 },  // A - image/gutter
    { wch: 12 }, // B - content
    { wch: 12 }, // C - content
    { wch: 8 },  // D - price/euro
    { wch: 8 },  // E - image/gutter
    { wch: 12 }, // F - content
    { wch: 12 }, // G - content
    { wch: 8 },  // H - price/euro
    { wch: 8 },  // I - image/gutter
    { wch: 12 }, // J - content
    { wch: 12 }, // K - content
    { wch: 8 },  // L - price/euro
  ];
  ws['!cols'] = colWidths;
  
  // Process products in groups of 15 (3x5 grid)
  const labelsPerPage = 15;
  const labelsPerRow = 3;
  const rowsPerLabel = 4;
  
  for (let pageIdx = 0; pageIdx < Math.ceil(products.length / labelsPerPage); pageIdx++) {
    const pageProducts = products.slice(pageIdx * labelsPerPage, (pageIdx + 1) * labelsPerPage);
    
    for (let labelIdx = 0; labelIdx < pageProducts.length; labelIdx++) {
      const product = pageProducts[labelIdx];
      
      // Calculate position
      const labelRow = Math.floor(labelIdx / labelsPerRow);
      const labelCol = labelIdx % labelsPerRow;
      
      const startRow = pageIdx * (rowsPerLabel * 5) + labelRow * rowsPerLabel;
      const startCol = labelCol * 4; // 4 columns per label
      
      // Helper to convert column index to letter
      const colLetter = (idx: number) => String.fromCharCode(65 + idx);
      
      // Add label content
      // Row 1: Logo placeholder and "Réf :" header
      const headerCell = `${colLetter(startCol + 1)}${startRow + 1}`;
      XLSX.utils.sheet_add_aoa(ws, [[`Réf : ${product.reference}`]], { origin: headerCell });
      
      // Row 2: Barcode
      const barcodeCell = `${colLetter(startCol + 1)}${startRow + 2}`;
      XLSX.utils.sheet_add_aoa(ws, [[product.codebar]], { origin: barcodeCell });
      
      // Row 3: Designation (merged)
      const designationCell = `${colLetter(startCol + 1)}${startRow + 3}`;
      XLSX.utils.sheet_add_aoa(ws, [[product.designation]], { origin: designationCell });
      
      // Row 4: Image placeholder and price
      const imagePlaceholder = product.imageUrl ? 'IMAGE' : `IMG-Réf. ${product.refNum}`;
      const imageCell = `${colLetter(startCol)}${startRow + 4}`;
      XLSX.utils.sheet_add_aoa(ws, [[imagePlaceholder]], { origin: imageCell });
      
      const priceCell = `${colLetter(startCol + 2)}${startRow + 4}`;
      XLSX.utils.sheet_add_aoa(ws, [[product.priceInt.toString()]], { origin: priceCell });
      
      const euroCell = `${colLetter(startCol + 3)}${startRow + 4}`;
      XLSX.utils.sheet_add_aoa(ws, [['€']], { origin: euroCell });
      
      // Add borders around label
      const labelRange = XLSX.utils.decode_range(
        `${colLetter(startCol)}${startRow + 1}:${colLetter(startCol + 3)}${startRow + 4}`
      );
      
      for (let R = labelRange.s.r; R <= labelRange.e.r; R++) {
        for (let C = labelRange.s.c; C <= labelRange.e.c; C++) {
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
          
          ws[cellRef].s = {
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } }
            },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        }
      }
    }
  }
  
  // Add sheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'ETIQUETTES PRIX');
  
  // Generate and download
  XLSX.writeFile(wb, 'etiquettes_prix.xlsx');
};
