import { useCallback } from 'react';
import { Upload, FileSpreadsheet, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FileUploadProps {
  type: 'excel' | 'images' | 'logo';
  file: File | File[] | null;
  onFileChange: (files: File | File[] | null) => void;
  accept?: string;
  multiple?: boolean;
}

export const FileUpload = ({ type, file, onFileChange, accept, multiple = false }: FileUploadProps) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    if (multiple) {
      onFileChange(droppedFiles);
    } else {
      onFileChange(droppedFiles[0] || null);
    }
  }, [multiple, onFileChange]);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    
    if (multiple) {
      onFileChange(Array.from(selectedFiles));
    } else {
      onFileChange(selectedFiles[0] || null);
    }
  };
  
  const handleRemove = () => {
    onFileChange(null);
  };
  
  const getIcon = () => {
    switch (type) {
      case 'excel': return <FileSpreadsheet className="h-8 w-8" />;
      case 'images': return <ImageIcon className="h-8 w-8" />;
      case 'logo': return <ImageIcon className="h-8 w-8" />;
    }
  };
  
  const getLabel = () => {
    switch (type) {
      case 'excel': return 'Excel File (LISTING PRODUITS)';
      case 'images': return 'Product Images (Optional)';
      case 'logo': return 'Company Logo (Optional)';
    }
  };
  
  const getDescription = () => {
    switch (type) {
      case 'excel': return 'Required columns: CODEBAR, QTE, PRIX, DESIGNATION, REFERENCE';
      case 'images': return 'Name files by reference (e.g., Réf. 1.jpg, Ref_2.png)';
      case 'logo': return 'Will appear in top-left of each label';
    }
  };
  
  const hasFile = multiple ? (Array.isArray(file) && file.length > 0) : !!file;
  
  return (
    <Card className="p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            {getIcon()}
            <h3 className="font-semibold">{getLabel()}</h3>
          </div>
          {type === 'excel' && <span className="text-xs text-destructive font-medium">Required</span>}
        </div>
        
        <p className="text-sm text-muted-foreground">{getDescription()}</p>
        
        {!hasFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          >
            <input
              type="file"
              id={`file-${type}`}
              className="hidden"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
            />
            <label htmlFor={`file-${type}`} className="cursor-pointer">
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">{accept}</p>
            </label>
          </div>
        ) : (
          <div className="bg-accent rounded-lg p-4">
            {multiple && Array.isArray(file) ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{file.length} file(s) selected</span>
                  <Button variant="ghost" size="sm" onClick={handleRemove}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-1">
                  {file.map((f, idx) => (
                    <div key={idx} className="truncate">{f.name}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate flex-1">
                  {file instanceof File ? file.name : 'File selected'}
                </span>
                <Button variant="ghost" size="sm" onClick={handleRemove}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
