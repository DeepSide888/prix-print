import * as XLSX from 'xlsx';

import { Product } from '@/types/product';

type RowValue = string | number | null | undefined;

const toStringValue = (value: RowValue): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return typeof value === 'string' ? value : value.toString();
};

const toNumberValue = (value: RowValue): number | undefined => {
  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number.parseFloat(toStringValue(value));

  return Number.isNaN(parsed) ? undefined : parsed;
};

export const parseExcelFile = async (file: File): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Find the "LISTING PRODUITS" sheet
        const sheetName = workbook.SheetNames.find(name => 
          name.toUpperCase() === 'LISTING PRODUITS'
        );
        
        if (!sheetName) {
          reject(new Error('Sheet "LISTING PRODUITS" not found in Excel file'));
          return;
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Find header row
        const headers = jsonData[0] as string[];
        const codebarIdx = headers.findIndex(h => h?.toUpperCase() === 'CODEBAR');
        const qteIdx = headers.findIndex(h => h?.toUpperCase() === 'QTE');
        const prixIdx = headers.findIndex(h => h?.toUpperCase() === 'PRIX');
        const designationIdx = headers.findIndex(h => h?.toUpperCase() === 'DESIGNATION');
        const referenceIdx = headers.findIndex(h => h?.toUpperCase() === 'REFERENCE');
        
        if (codebarIdx === -1 || prixIdx === -1 || designationIdx === -1 || referenceIdx === -1) {
          reject(new Error('Required columns not found. Expected: CODEBAR, PRIX, DESIGNATION, REFERENCE'));
          return;
        }
        
        // Parse products
        const products: Product[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as RowValue[];

          const designation = toStringValue(row[designationIdx]).trim();
          const prix = toNumberValue(row[prixIdx]);

          // Skip rows with empty designation or price
          if (!designation || prix === undefined) continue;

          const reference = toStringValue(row[referenceIdx]).trim();
          const refNum = reference.match(/\d+/)?.[0] || '';

          products.push({
            codebar: toStringValue(row[codebarIdx]).trim(),
            qte: toNumberValue(row[qteIdx]) ?? 0,
            prix,
            designation,
            reference,
            refNum,
            priceInt: Math.floor(prix)
          });
        }
        
        resolve(products);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsBinaryString(file);
  });
};
