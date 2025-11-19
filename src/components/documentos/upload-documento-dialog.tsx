"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { minioService } from "@/src/lib/minio";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";
import { modulosService } from "@/src/lib/modulos"; // <-- asegúrate que exista este servicio

interface UploadDocumentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FileWithTipo {
  file: File;
  tipo: string;
}

export function UploadDocumentoDialog({
  open,
  onOpenChange,
  onSuccess,
}: UploadDocumentoDialogProps) {
  const [files, setFiles] = useState<FileWithTipo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [modulos, setModulos] = useState<any[]>([]);
  const [selectedModulo, setSelectedModulo] = useState<string>("");
  const { toast } = useToast();

  // Cargar módulos disponibles
  useEffect(() => {
    const fetchModulos = async () => {
      try {
        const data = await modulosService.getAll();
        setModulos(data);
      } catch {
        toast({
          title: "Error",
          description: "No se pudieron cargar los módulos.",
          variant: "destructive",
        });
      }
    };
    fetchModulos();
  }, [toast]);

  const acceptWord = (file?: File | null) =>
  !!file && /\.(doc|docx|pdf|rtf)$/i.test(file.name);


  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles);
      const valid = arr.filter((f) => {
        if (!acceptWord(f)) {
          toast({
            title: "Archivo ignorado",
            description: `${f.name} no es un documento Word (.doc o .docx).`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });

      const existingNames = new Set(files.map((f) => f.file.name));
      const filtered = valid.filter((f) => !existingNames.has(f.name));

      if (filtered.length === 0 && valid.length > 0) {
        toast({
          title: "Duplicado",
          description: "Algunos archivos ya estaban en la lista y fueron ignorados.",
        });
      }

      const mapped = filtered.map((file) => ({ file, tipo: "OTRO" }));
      setFiles((prev) => [...prev, ...mapped]);
    },
    [files, toast]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    addFiles(selected);
    e.currentTarget.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const dt = e.dataTransfer;
    if (!dt?.files?.length) return;
    addFiles(dt.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleTipoChange = (index: number, tipo: string) => {
    const updated = [...files];
    updated[index].tipo = tipo;
    setFiles(updated);
  };

  const removeFile = (name: string) => setFiles((prev) => prev.filter((f) => f.file.name !== name));
  const clearAll = () => setFiles([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 || !selectedModulo) {
      toast({
        title: "Campos requeridos",
        description: "Debes seleccionar al menos un archivo y un módulo.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const wordFiles = files.map((f) => f.file);
      const tipos = files.map((f) => f.tipo);

      await minioService.uploadDocumentos(wordFiles, tipos, selectedModulo);

      toast({
        title: "Éxito",
        description: `${wordFiles.length} documento(s) subido(s) correctamente.`,
        variant: "success",
      });

      onSuccess();
      onOpenChange(false);
      clearAll();
      setSelectedModulo("");
    } catch (error: any) {
      toast({
        title: "Error al subir documentos",
        description: error?.response?.data?.message || error?.message || "Error desconocido.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[min(92%,720px)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Documentos</DialogTitle>
          <DialogDescription>
            Arrastra o selecciona uno o varios documentos .doc , .docx , .pdf , .rtf para subir.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selector de módulo */}
          <div className="space-y-2">
            <Label>Módulo destino</Label>
            <Select value={selectedModulo} onValueChange={setSelectedModulo} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un módulo" />
              </SelectTrigger>
              <SelectContent className="max-h-64 overflow-y-auto">
                {modulos.map((mod) => (
                  <SelectItem key={mod.id} value={mod.id}>
                    {mod.nombre || mod.titulo || `Módulo ${mod.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Zona de drop */}
          <div>
            <Label>Archivos</Label>
            <div
              role="button"
              tabIndex={0}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 transition-colors
                ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-dashed border-gray-200 bg-white"
                } hover:border-primary focus-visible:ring-2 focus-visible:ring-primary/30`}
            >
              <input
                id="upload-word-input"
                type="file"
                 accept=".doc,.docx,.pdf,.rtf"
                onChange={handleFileChange}
                disabled={isLoading}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                multiple
              />

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-gradient-to-tr from-primary to-primary/70 text-white shadow-sm">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Arrastra y suelta documentos aquí</p>
                  <p className="text-sm text-muted-foreground">
                    o haz clic para seleccionar varios archivos Word
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-2">
                Solo  se aceptan archivos Word (.doc, .docx), PDF y RTF. Tamaño máximo recomendado: 50MB.
              </p>
            </div>

            {/* Lista de archivos con scroll */}
            <div className="mt-4 space-y-2">
              {files.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {files.length} documento(s) listo(s) para subir
                    </div>
                    <button
                      type="button"
                      onClick={clearAll}
                      disabled={isLoading}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      Limpiar
                    </button>
                  </div>

                  <ul className="max-h-[300px] overflow-y-auto divide-y rounded border bg-white border-gray-100">
                    {files.map((f, index) => (
                      <li
                        key={f.file.name}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-md bg-gray-50 border flex-shrink-0">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 break-all">
                            <div className="font-medium truncate max-w-[250px]">
                              {f.file.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {(f.file.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Select
                            value={f.tipo}
                            onValueChange={(v) => handleTipoChange(index, v)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
  {/* si es Word */}
{/\.docx$/i.test(f.file.name) ? (
  // solo DOCX puede ser plantilla
  <>
    <SelectItem value="PLANTILLA">Plantilla</SelectItem>
    <SelectItem value="ANEXO">Anexo</SelectItem>
    <SelectItem value="INFORME">Informe</SelectItem>
    <SelectItem value="OTRO">Otro</SelectItem>
  </>
) : /\.doc$/i.test(f.file.name) ? (
  // DOC pero NO plantilla
  <>
    <SelectItem value="ANEXO">Anexo</SelectItem>
    <SelectItem value="INFORME">Informe</SelectItem>
    <SelectItem value="OTRO">Otro</SelectItem>
  </>
) : (
  // NO es Word: pdf, rtf, jpeg, etc
  <>
    <SelectItem value="ANEXO">Anexo</SelectItem>
    <SelectItem value="OTRO">Otro</SelectItem>
  </>
)}

</SelectContent>
                          </Select>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(f.file.name)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No hay documentos seleccionados
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                clearAll();
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={files.length === 0 || !selectedModulo || isLoading}
              className="inline-flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir {files.length > 0 ? `(${files.length})` : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
