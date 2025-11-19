"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Upload, FileArchive, X, Loader2 } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { minioService } from "@/src/lib/minio";
import { expedientesService } from "@/src/lib/expedientes";

interface ImportExpedienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ImportExpedienteDialog({ open, onOpenChange, onSuccess }: ImportExpedienteDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const { toast } = useToast();
const [existingListNames, setExistingListNames] = useState<string[] | null>(null);
  useEffect(() => {
  if (open && !existingListNames) {
    expedientesService.getAll().then((arr) => {
  setExistingListNames(arr.map(e => e.nombre));
});
  }
}, [open]);

  const acceptZip = (f?: File | null) => !!f && f.name.toLowerCase().endsWith(".zip");

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    
    const valid = arr.filter((f) => {
      const baseName = f.name.replace(/\.zip$/i, "");
      if (!acceptZip(f)) {
        toast({
          title: "Archivo ignorado",
          description: `${f.name} no es un ZIP y fue ignorado.`,
          variant: "destructive",
        });
        
        return false;
      }
        if (f.size > 200 * 1024 * 1024) {
    toast({
      title: "Archivo muy grande",
      description: `${f.name} supera los 200MB y fue ignorado.`,
      variant: "destructive",
    });
    return false;
  }
  if (existingListNames?.includes(baseName)) {
  toast({
    title: "Nombre duplicado",
    description: `Ya existe un expediente llamado "${baseName}".`,
    variant: "destructive",
  });
  return false;
}
      return true;
    });

    // Evitar duplicados por nombre
    const existingNames = new Set(files.map((f) => f.name));
    const filtered = valid.filter((f) => !existingNames.has(f.name));

    if (filtered.length === 0 && valid.length > 0) {
      toast({
        title: "Duplicado",
        description: "Algunos archivos ya estaban en la lista y fueron ignorados.",
      });
    }

    setFiles((prev) => [...prev, ...filtered]);
  }, [files, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    addFiles(selected);
    // reset input so same file can be selected again if removed
    e.currentTarget.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const dt = e.dataTransfer;
    if (!dt || !dt.files || dt.files.length === 0) return;
    addFiles(dt.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const clearAll = () => setFiles([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setIsLoading(true);
    try {
      for (const file of files) {
        try {
          await minioService.importarCTD(file);
          toast({
            title: "Importado",
            description: `${file.name} importado correctamente.`,
            variant: "success",
          });
        } catch (innerError: any) {
          toast({
            title: `Error al importar ${file.name}`,
            description: innerError?.response?.data?.message || innerError?.message || "Error desconocido",
            variant: "destructive",
          });
        }
      }
      onSuccess();
      onOpenChange(false);
      clearAll();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[min(92%,720px)]">
        <DialogHeader>
          <DialogTitle>Importar Expedientes</DialogTitle>
          <DialogDescription>Arrastra uno o varios archivos ZIP con la estructura del expediente o haz clic para seleccionarlos.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="mb-2">Archivos ZIP</Label>

            <div
              role="button"
              tabIndex={0}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const input = document.getElementById("import-zip-input") as HTMLInputElement | null;
                  input?.click();
                }
              }}
              className={`relative flex items-center justify-center flex-col gap-3 p-6 rounded-lg border-2 transition-colors outline-none
                ${isDragActive ? "border-primary bg-primary/5" : "border-dashed border-gray-200 bg-white"}
                hover:border-primary focus-visible:ring-2 focus-visible:ring-primary/30`}
              aria-label="Zona de subida de ZIPs"
            >
              <input
                id="import-zip-input"
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                disabled={isLoading}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                multiple
                aria-hidden
              />

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-gradient-to-tr from-primary to-primary/70 text-white shadow-sm" aria-hidden>
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Arrastra y suelta ZIPs aquí</p>
                  <p className="text-sm text-muted-foreground">o haz clic para seleccionar varios archivos</p>
                </div>
              </div>

              <div className="w-full flex justify-center">
                <div className="text-xs text-muted-foreground">
                  Tamaño máximo recomendado por archivo: 200MB. Evita nombres duplicados.
                </div>
              </div>
            </div>

            {/* Lista de archivos */}
            <div className="mt-4 space-y-2">
              {files.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{files.length} archivo(s) listo(s) para importar</div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={clearAll} disabled={isLoading} className="text-sm text-muted-foreground hover:underline">
                        Limpiar
                      </button>
                    </div>
                  </div>

                  <ul className="max-h-48 overflow-auto divide-y rounded border bg-white border-gray-100">
                    {files.map((f) => (
                      <li key={f.name} className="flex items-center justify-between gap-3 p-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-gray-50 border">
                            <FileArchive className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate max-w-[360px]">{f.name}</div>
                            <div className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => removeFile(f.name)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-sm text-red-600 hover:bg-red-50 border border-red-100"
                            aria-label={`Eliminar ${f.name}`}
                          >
                            <X className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No hay archivos seleccionados</div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => { onOpenChange(false); setFiles([]); }} disabled={isLoading}>
              Cancelar
            </Button>

            <Button type="submit" disabled={files.length === 0 || isLoading} className="inline-flex items-center">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar {files.length > 0 ? `(${files.length})` : ''}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
