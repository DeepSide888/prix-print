export const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric
};

export const findImageForProduct = (
  reference: string,
  refNum: string,
  imageFiles: File[]
): File | null => {
  if (!imageFiles.length) return null;
  
  // Build candidate names
  const candidates = [
    `ref${refNum}`,
    `ref_${refNum}`,
    `ref-${refNum}`,
    refNum
  ];
  
  // Normalize all candidate names
  const normalizedCandidates = candidates.map(c => normalizeString(c));
  
  // Try to find matching image
  for (const file of imageFiles) {
    const fileNameWithoutExt = file.name.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const normalizedFileName = normalizeString(fileNameWithoutExt);
    
    if (normalizedCandidates.includes(normalizedFileName)) {
      return file;
    }
  }
  
  return null;
};

export const createImageUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

export const revokeImageUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};
