"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Upload, FileArchive, X, Loader2 } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { minioService } from "@/src/lib/minio";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Expediente, expedientesService } from "@/src/lib/expedientes";

interface ImportModuloDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ImportModuloDialog({ open, onOpenChange, onSuccess }: ImportModuloDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [selectedExpediente, setSelectedExpediente] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadExpedientes = async () => {
      try {
        const data = await expedientesService.getAll();
        setExpedientes(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Error al cargar expedientes",
          variant: "destructive",
        });
      }
    };
    if (open) loadExpedientes();
  }, [open, toast]);

  const acceptZip = (f?: File | null) => !!f && f.name.toLowerCase().endsWith(".zip");

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    const valid = arr.filter((f) => {
      if (!acceptZip(f)) {
        toast({
          title: "Archivo ignorado",
          description: `${f.name} no es un ZIP y fue ignorado.`,
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

  const removeFile = (name: string) => setFiles((prev) => prev.filter((f) => f.name !== name));

  const clearAll = () => setFiles([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;
    if (!selectedExpediente) {
      toast({ title: "Error", description: "Debes seleccionar un expediente", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (!selectedExpediente) {
  toast({ title: "Error", description: "Debes seleccionar un expediente", variant: "destructive" });
  return;
}
      for (const file of files) {
        try {
          await minioService.uploadModulo(file, selectedExpediente);
          toast({
            title: "Módulo importado",
            description: `${file.name} importado correctamente`,
            variant: "success"
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
      setSelectedExpediente(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[min(92%,720px)]">
        <DialogHeader>
          <DialogTitle>Importar Módulo</DialogTitle>
          <DialogDescription>
            Arrastra un archivo ZIP con el módulo completo o haz clic para seleccionarlo. Selecciona el expediente donde se guardará.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Expediente</Label>
            <Select onValueChange={setSelectedExpediente} value={selectedExpediente}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un expediente" />
              </SelectTrigger>
              <SelectContent>
                {expedientes.map((exp) => (
                  <SelectItem key={exp.id} value={exp.id}>{exp.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Archivo ZIP</Label>
            <div
              role="button"
              tabIndex={0}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onKeyDown={(e) => { if (e.key === "Enter") document.getElementById("import-modulo-input")?.click(); }}
              className={`relative flex items-center justify-center flex-col gap-3 p-6 rounded-lg border-2 transition-colors outline-none
                ${isDragActive ? "border-primary bg-primary/5" : "border-dashed border-gray-200 bg-white"}
                hover:border-primary focus-visible:ring-2 focus-visible:ring-primary/30`}
            >
              <input
                id="import-modulo-input"
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                disabled={isLoading}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                aria-hidden
              />

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-gradient-to-tr from-primary to-primary/70 text-white shadow-sm">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Arrastra y suelta un ZIP aquí</p>
                  <p className="text-sm text-muted-foreground">o haz clic para seleccionarlo</p>
                </div>
              </div>

              {files.length > 0 && (
                <ul className="mt-4 max-h-48 w-full overflow-auto divide-y rounded border bg-white border-gray-100">
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
                      <Button type="button" variant="outline" size="sm" onClick={() => removeFile(f.name)} disabled={isLoading}>
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => { onOpenChange(false); clearAll(); }} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={files.length === 0 || !selectedExpediente || isLoading} className="inline-flex items-center">
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
