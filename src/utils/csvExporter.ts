import { Product } from '@/types/product';

export const exportMissingImagesCsv = (products: Product[]): void => {
  const missingImages = products.filter(p => !p.imageUrl);
  
  if (missingImages.length === 0) {
    console.log('No missing images to export');
    return;
  }
  
  // Create CSV content
  const headers = ['REFERENCE', 'CODEBAR', 'DESIGNATION'];
  const rows = missingImages.map(p => [
    p.reference,
    p.codebar,
    p.designation
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'missing_images.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
