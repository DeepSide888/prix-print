export interface Product {
  codebar: string;
  qte: number;
  prix: number;
  designation: string;
  reference: string;
  refNum: string;
  priceInt: number;
  imageUrl?: string;
}

export interface LabelGeneratorConfig {
  excelFile: File | null;
  imagesFiles: File[];
  logoFile: File | null;
}
