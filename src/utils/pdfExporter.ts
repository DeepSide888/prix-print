import jsPDF from 'jspdf';
import { Product } from '@/types/product';

const ORANGE_COLOR = '#ff7a00';
const PAGE_WIDTH = 297; // A4 landscape in mm
const PAGE_HEIGHT = 210;
const MARGIN = 10;
const COLS = 3;
const ROWS = 5;

export const exportToPDF = async (
  products: Product[],
  logoUrl: string | null
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  const cellWidth = (PAGE_WIDTH - 2 * MARGIN) / COLS;
  const cellHeight = (PAGE_HEIGHT - 2 * MARGIN) / ROWS;
  
  const labelsPerPage = COLS * ROWS;
  const totalPages = Math.ceil(products.length / labelsPerPage);
  
  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) {
      doc.addPage();
    }
    
    const pageProducts = products.slice(pageIdx * labelsPerPage, (pageIdx + 1) * labelsPerPage);
    
    for (let labelIdx = 0; labelIdx < pageProducts.length; labelIdx++) {
      const product = pageProducts[labelIdx];
      
      const row = Math.floor(labelIdx / COLS);
      const col = labelIdx % COLS;
      
      const x = MARGIN + col * cellWidth;
      const y = MARGIN + row * cellHeight;
      
      // Draw label border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(x, y, cellWidth, cellHeight);
      
      // Image gutter (left side)
      const gutterWidth = cellWidth * 0.25;
      const gutterX = x + 2;
      const gutterY = y + cellHeight * 0.5;
      
      if (product.imageUrl) {
        try {
          // In a real implementation, we'd load and draw the image here
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text('[IMAGE]', gutterX, gutterY);
        } catch (e) {
          console.error('Failed to load image', e);
        }
      } else {
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(`IMG-Réf. ${product.refNum}`, gutterX, gutterY, { maxWidth: gutterWidth - 2 });
      }
      
      // Logo (top-left, very small)
      if (logoUrl) {
        try {
          // In a real implementation, we'd load and draw the logo here
          doc.setFontSize(6);
          doc.setTextColor(255, 122, 0);
          doc.text('P54', x + 2, y + 4);
        } catch (e) {
          console.error('Failed to load logo', e);
        }
      }
      
      // Content area (right of gutter)
      const contentX = x + gutterWidth + 2;
      const contentWidth = cellWidth - gutterWidth - 4;
      
      // Header: "Réf :" + reference
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(`Réf : ${product.reference}`, contentX, y + 6);
      
      // Barcode
      doc.setFontSize(8);
      doc.text(product.codebar, contentX, y + 11);
      
      // Designation (centered, bold)
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const designationLines = doc.splitTextToSize(product.designation, contentWidth);
      const designationY = y + cellHeight * 0.45;
      doc.text(designationLines.slice(0, 2), contentX + contentWidth / 2, designationY, {
        align: 'center',
        maxWidth: contentWidth
      });
      
      // Price (bottom, large orange number)
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 122, 0);
      const priceText = product.priceInt.toString();
      const priceY = y + cellHeight - 6;
      doc.text(priceText, contentX + contentWidth * 0.6, priceY);
      
      // Euro symbol
      doc.setFontSize(20);
      doc.text('€', contentX + contentWidth * 0.85, priceY);
    }
  }
  
  doc.save('etiquettes_prix.pdf');
};
