import { Product } from '@/types/product';
import { LabelPreview } from './LabelPreview';
import { Card } from './ui/card';

interface LabelGridProps {
  products: Product[];
  logoUrl?: string | null;
}

export const LabelGrid = ({ products, logoUrl }: LabelGridProps) => {
  if (products.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Upload an Excel file to preview labels</p>
      </Card>
    );
  }
  
  // Group products into pages of 15
  const pages: Product[][] = [];
  for (let i = 0; i < products.length; i += 15) {
    pages.push(products.slice(i, i + 15));
  }
  
  return (
    <div className="space-y-8">
      {pages.map((pageProducts, pageIdx) => (
        <Card key={pageIdx} className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Page {pageIdx + 1}</h3>
            <span className="text-sm text-muted-foreground">
              Labels {pageIdx * 15 + 1}–{pageIdx * 15 + pageProducts.length}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {pageProducts.map((product, idx) => (
              <LabelPreview 
                key={`${pageIdx}-${idx}`} 
                product={product} 
                logoUrl={logoUrl}
              />
            ))}
            
            {/* Fill empty slots for visualization */}
            {Array.from({ length: 15 - pageProducts.length }).map((_, idx) => (
              <div 
                key={`empty-${idx}`} 
                className="border border-dashed border-border rounded-sm aspect-[4/3] bg-muted/20"
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
