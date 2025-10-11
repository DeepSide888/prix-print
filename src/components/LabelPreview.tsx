import { Product } from '@/types/product';
import point54Logo from '@/assets/point54-logo.png';

interface LabelPreviewProps {
  product: Product;
  logoUrl?: string | null;
}

export const LabelPreview = ({ product, logoUrl }: LabelPreviewProps) => {
  return (
    <div className="border border-border rounded-sm p-2 bg-white aspect-[4/3] flex flex-col">
      {/* Top row: Logo and Reference header */}
      <div className="flex items-start justify-between mb-1">
        <img 
          src={logoUrl || point54Logo} 
          alt="Point 54" 
          className="h-6 object-contain"
        />
        <div className="text-right flex-1 ml-2">
          <div className="text-[10px] leading-tight">
            <span className="font-normal">Réf : </span>
            <span className="font-medium">{product.reference}</span>
          </div>
          <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">
            {product.codebar}
          </div>
        </div>
      </div>
      
      {/* Middle: Image and Designation */}
      <div className="flex-1 flex gap-2">
        {/* Image gutter */}
        <div className="w-1/4 flex items-center justify-center bg-muted rounded text-xs text-muted-foreground text-center p-1">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt="" className="max-w-full max-h-full object-contain" />
          ) : (
            <span className="text-[8px] leading-tight">IMG-Réf. {product.refNum}</span>
          )}
        </div>
        
        {/* Designation */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-center font-bold text-xs leading-tight line-clamp-2">
            {product.designation}
          </p>
        </div>
      </div>
      
      {/* Bottom: Price */}
      <div className="flex items-end justify-end gap-1 mt-1">
        <span className="text-2xl font-bold text-primary leading-none">
          {product.priceInt}
        </span>
        <span className="text-lg font-bold text-primary leading-none mb-0.5">
          €
        </span>
      </div>
    </div>
  );
};
