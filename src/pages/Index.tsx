import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/FileUpload';
import { LabelGrid } from '@/components/LabelGrid';
import { Product } from '@/types/product';
import { parseExcelFile } from '@/utils/excelParser';
import { findImageForProduct, createImageUrl } from '@/utils/imageMatching';
import { exportToExcel } from '@/utils/excelExporter';
import { exportToPDF } from '@/utils/pdfExporter';
import { exportMissingImagesCsv } from '@/utils/csvExporter';
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import point54Logo from '@/assets/point54-logo.png';

const Index = () => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [imagesFiles, setImagesFiles] = useState<File[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Process Excel file when uploaded
  useEffect(() => {
    if (!excelFile) {
      setProducts([]);
      return;
    }
    
    const processFile = async () => {
      setIsProcessing(true);
      try {
        const parsedProducts = await parseExcelFile(excelFile);
        
        // Match images to products
        const productsWithImages = parsedProducts.map(product => {
          const imageFile = findImageForProduct(product.reference, product.refNum, imagesFiles);
          return {
            ...product,
            imageUrl: imageFile ? createImageUrl(imageFile) : undefined
          };
        });
        
        setProducts(productsWithImages);
        
        toast({
          title: "Excel file processed",
          description: `Found ${productsWithImages.length} products`,
        });
      } catch (error) {
        console.error('Error processing Excel:', error);
        toast({
          title: "Error processing Excel",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    processFile();
  }, [excelFile, imagesFiles, toast]);
  
  // Handle logo file
  useEffect(() => {
    if (logoFile) {
      const url = createImageUrl(logoFile);
      setLogoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLogoUrl(null);
    }
  }, [logoFile]);
  
  const handleExportExcel = async () => {
    if (products.length === 0) {
      toast({
        title: "No products to export",
        description: "Please upload an Excel file first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await exportToExcel(products, logoUrl);
      toast({
        title: "Excel exported",
        description: "etiquettes_prix.xlsx has been downloaded",
      });
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast({
        title: "Export failed",
        description: "Failed to export Excel file",
        variant: "destructive"
      });
    }
  };
  
  const handleExportPDF = async () => {
    if (products.length === 0) {
      toast({
        title: "No products to export",
        description: "Please upload an Excel file first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await exportToPDF(products, logoUrl);
      toast({
        title: "PDF exported",
        description: "etiquettes_prix.pdf has been downloaded",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export failed",
        description: "Failed to export PDF file",
        variant: "destructive"
      });
    }
  };
  
  const handleExportMissingImages = () => {
    if (products.length === 0) {
      toast({
        title: "No products to export",
        description: "Please upload an Excel file first",
        variant: "destructive"
      });
      return;
    }
    
    const missingCount = products.filter(p => !p.imageUrl).length;
    
    if (missingCount === 0) {
      toast({
        title: "No missing images",
        description: "All products have images!",
      });
      return;
    }
    
    try {
      exportMissingImagesCsv(products);
      toast({
        title: "CSV exported",
        description: `missing_images.csv with ${missingCount} items has been downloaded`,
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Export failed",
        description: "Failed to export CSV file",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <img src={point54Logo} alt="Point 54" className="h-12" />
            <div>
              <h1 className="text-2xl font-bold">Price Label Generator</h1>
              <p className="text-sm text-muted-foreground">Create professional retail price labels</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* File Upload Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">1. Upload Files</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <FileUpload
              type="excel"
              file={excelFile}
              onFileChange={(file) => setExcelFile(file as File | null)}
              accept=".xlsx,.xls"
            />
            <FileUpload
              type="images"
              file={imagesFiles}
              onFileChange={(files) => setImagesFiles(files as File[])}
              accept=".jpg,.jpeg,.png,.webp"
              multiple
            />
            <FileUpload
              type="logo"
              file={logoFile}
              onFileChange={(file) => setLogoFile(file as File | null)}
              accept=".png,.jpg,.jpeg"
            />
          </div>
        </section>
        
        {/* Export Section */}
        {products.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">2. Export Labels</h2>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExportExcel} size="lg" className="gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Export Excel
              </Button>
              <Button onClick={handleExportPDF} size="lg" variant="secondary" className="gap-2">
                <Printer className="h-5 w-5" />
                Export PDF
              </Button>
              <Button 
                onClick={handleExportMissingImages} 
                size="lg" 
                variant="outline"
                className="gap-2"
              >
                <FileText className="h-5 w-5" />
                Export Missing Images CSV
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-accent rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-primary">{products.length}</span>
                  <span className="text-muted-foreground"> total products</span>
                </div>
                <div>
                  <span className="font-semibold text-primary">
                    {products.filter(p => p.imageUrl).length}
                  </span>
                  <span className="text-muted-foreground"> with images</span>
                </div>
                <div>
                  <span className="font-semibold text-primary">
                    {Math.ceil(products.length / 15)}
                  </span>
                  <span className="text-muted-foreground"> pages</span>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Preview Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">3. Preview</h2>
          {isProcessing ? (
            <div className="text-center p-12 text-muted-foreground">
              Processing Excel file...
            </div>
          ) : (
            <LabelGrid products={products} logoUrl={logoUrl} />
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
