"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import { useToast } from "@/src/hooks/use-toast";
import { plantillasService, type Plantilla } from "@/src/lib/plantillas";
import { documentosService, DocumentoTipo, type Documento } from "@/src/lib/documentos";
import { modulosService, type Modulo } from "@/src/lib/modulos";
import { Badge } from "@/src/components/ui/badge";
import { X } from "lucide-react";

interface CreateDocumentoFromPlantillaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateDocumentoFromPlantillaDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateDocumentoFromPlantillaDialogProps) {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [anexosDisponibles, setAnexosDisponibles] = useState<Documento[]>([]);
  const [selectedPlantilla, setSelectedPlantilla] = useState<string>("");
  const [selectedModulo, setSelectedModulo] = useState<string>("");
  const [selectedAnexos, setSelectedAnexos] = useState<string[]>([]);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<DocumentoTipo>(DocumentoTipo.OTRO);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 🔹 Cargar plantillas, módulos y anexos tipo "ANEXO"
  useEffect(() => {
    const loadData = async () => {
      try {
        const [plantillasData, modulosData, documentosData] = await Promise.all([
          plantillasService.getAll(),
          modulosService.getAll(),
          documentosService.getAll(),
        ]);

        setPlantillas(plantillasData);
        setModulos(modulosData);
        setAnexosDisponibles(documentosData.filter((d) => d.tipo === DocumentoTipo.ANEXO));
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Error al cargar datos iniciales",
          variant: "destructive",
        });
      }
    };
    if (open) loadData();
     if (!open) {
    // reset only when closing
    setSelectedPlantilla("");
    setSelectedModulo("");
    setSelectedAnexos([]);
    setNombre("");
    setTipo(DocumentoTipo.OTRO);
  }
    
  }, [open]);

  const handleToggleAnexo = (id: string) => {
    setSelectedAnexos((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleRemoveAnexo = (id: string) => {
    setSelectedAnexos(selectedAnexos.filter((a) => a !== id));
  };

  const handleCreate = async () => {
    if (!selectedPlantilla || !nombre.trim() || !selectedModulo) {
      toast({
        title: "Campos incompletos",
        description: "Debes seleccionar una plantilla, módulo y escribir un nombre.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await documentosService.createFromPlantilla(selectedPlantilla, {
        modulo_id: selectedModulo,
        nombre,
        tipo,
        anexos: selectedAnexos,
      });

      toast({
        title: "Documento creado",
        description: "El documento se ha generado correctamente desde la plantilla.",
        variant: "success",
      });

      onOpenChange(false);
      onSuccess();

      // Reset form
      setSelectedAnexos([]);
      setSelectedPlantilla("");
      setSelectedModulo("");
      setNombre("");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Error al crear documento desde plantilla",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Documento desde Plantilla</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* PLANTILLA */}
          <div className="space-y-2">
            <Label>Plantilla</Label>
            <Select value={selectedPlantilla} onValueChange={setSelectedPlantilla}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una plantilla" />
              </SelectTrigger>
              <SelectContent>
                {plantillas.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* MÓDULO DESTINO */}
          <div className="space-y-2">
            <Label>Módulo destino</Label>
            <Select value={selectedModulo} onValueChange={setSelectedModulo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el módulo destino" />
              </SelectTrigger>
              <SelectContent>
                {modulos.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* NOMBRE */}
          <div className="space-y-2">
            <Label>Nombre del documento</Label>
            <Input
              placeholder="Ej: Informe de resultados"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          {/* TIPO */}
          <div className="space-y-2">
            <Label>Tipo de documento</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as DocumentoTipo)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DocumentoTipo).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ANEXOS MULTI-SELECT */}
          <div className="space-y-2">
            <Label>Anexos (opcional, solo tipo “anexo”)</Label>
            <div className="border rounded-md p-2 max-h-48 overflow-y-auto space-y-1">
              {anexosDisponibles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  No hay anexos disponibles
                </p>
              ) : (
                anexosDisponibles.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2">
                    <Checkbox
                      id={doc.id}
                      checked={selectedAnexos.includes(doc.id)}
                      onCheckedChange={() => handleToggleAnexo(doc.id)}
                    />
                    <Label htmlFor={doc.id} className="text-sm cursor-pointer">
                      {doc.nombre}
                    </Label>
                  </div>
                ))
              )}
            </div>

            {selectedAnexos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto border p-2 rounded-md">
                {selectedAnexos.map((id) => {
                  const doc = anexosDisponibles.find((d) => d.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {doc?.nombre || "Anexo"}
                      <button onClick={() => handleRemoveAnexo(id)} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear Documento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
