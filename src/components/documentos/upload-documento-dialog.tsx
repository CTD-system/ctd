"use client";

import type React from "react";

import { useState } from "react";

import { Upload, X, FileText } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { minioService } from "@/src/lib/minio";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";

import { DialogHeader, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select } from "../ui/select";

interface UploadDocumentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FileWithType {
  file: File;
  tipo: string;
}

export function UploadDocumentoDialog({
  open,
  onOpenChange,
  onSuccess,
}: UploadDocumentoDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [filesWithTypes, setFilesWithTypes] = useState<FileWithType[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const newFiles = selectedFiles.map((file) => ({
        file,
        tipo: "OTRO",
      }));
      setFilesWithTypes([...filesWithTypes, ...newFiles]);
    }
  };

  const handleTipoChange = (index: number, tipo: string) => {
    const updated = [...filesWithTypes];
    updated[index].tipo = tipo;
    setFilesWithTypes(updated);
  };

  const handleRemoveFile = (index: number) => {
    setFilesWithTypes(filesWithTypes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (filesWithTypes.length === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona al menos un archivo",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const files = filesWithTypes.map((f) => f.file);
      const tipos = filesWithTypes.map((f) => f.tipo);
      await minioService.uploadDocumentos(files, tipos);
      toast({
        title: "Documentos subidos",
        description: `${files.length} documento(s) subido(s) correctamente`,
      });
      onSuccess();
      onOpenChange(false);
      setFilesWithTypes([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Error al subir documentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Subir Documentos</DialogTitle>
          <DialogDescription>
            Selecciona uno o varios archivos y asigna su tipo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="files">Archivos</Label>
              <Input
                id="files"
                type="file"
                onChange={handleFileChange}
                multiple
                className="cursor-pointer"
                disabled={isLoading}
              />
            </div>

            {filesWithTypes.length > 0 && (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <Label>Archivos seleccionados ({filesWithTypes.length})</Label>
                {filesWithTypes.map((fileWithType, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {fileWithType.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(fileWithType.file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Select
                      value={fileWithType.tipo}
                      onValueChange={(value) => handleTipoChange(index, value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANTILLA">Plantilla</SelectItem>
                        <SelectItem value="ANEXO">Anexo</SelectItem>
                        <SelectItem value="INFORME">Informe</SelectItem>
                        <SelectItem value="OTRO">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isLoading}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || filesWithTypes.length === 0}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir{" "}
                  {filesWithTypes.length > 0
                    ? `(${filesWithTypes.length})`
                    : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
