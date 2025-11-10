"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import { modulosService } from "@/src/lib/modulos";
import { expedientesService } from "@/src/lib/expedientes";
import { useToast } from "@/src/hooks/use-toast";

interface CreateModuloDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateModuloDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateModuloDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [modulos, setModulos] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    expediente_id: "",
    modulo_contenedor_id: "",

    titulo: "",
    descripcion: "",
    estado: "",
    crearIndiceWord: true,
    crearReferenciasWord: false,
  });

  const { toast } = useToast();

  useEffect(() => {
     if (!open) {
    // cuando cierre → reseteo
    setFormData({
      expediente_id: "",
      modulo_contenedor_id: "",

      titulo: "",
      descripcion: "",
      estado: "",       // ojo: aquí debe ir el value EXACTO que usas en Select (en minúscula)
      crearIndiceWord: true,
      crearReferenciasWord: false,
    });
  }
    if (open) {
      loadExpedientes();
      loadModulos();
    }
  }, [open]);

  const loadExpedientes = async () => {
    try {
      const data = await expedientesService.getAll();
      setExpedientes(data);
    } catch (error) {
      console.error("Error loading expedientes:", error);
    }
  };

  const loadModulos = async () => {
    try {
      const data = await modulosService.getAll();
      setModulos(data);
    } catch (error) {
      console.error("Error loading modulos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.expediente_id || formData.expediente_id.trim() === "") {
    toast({
      title: "Falta expediente",
      description: "Debe seleccionar un expediente.",
      variant: "destructive",
    });
    return;
  }

   if (!formData.estado || formData.estado.trim() === "") {
    toast({
      title: "Falta estado",
      description: "Debe seleccionar un estado para el módulo.",
      variant: "destructive",
    });
    return;
  }
    setIsLoading(true);

    try {
      const submitData: any = {
        expediente_id: formData.expediente_id,

        titulo: formData.titulo,
        descripcion: formData.descripcion,
        estado: formData.estado,
        crearIndiceWord: formData.crearIndiceWord,
        crearReferenciasWord: formData.crearReferenciasWord,
      };

      if (
        formData.modulo_contenedor_id &&
        formData.modulo_contenedor_id !== "none"
      ) {
        submitData.modulo_contenedor_id = formData.modulo_contenedor_id;
      }

      await modulosService.create(submitData);
      toast({
        title: "Módulo creado",
        description: "El módulo ha sido creado correctamente",
      });
      onSuccess();
      onOpenChange(false);

      // Resetear formulario
      setFormData({ 
        expediente_id: "",
        modulo_contenedor_id: "",
        titulo: "",
        descripcion: "",
        estado: "BORRADOR",
        crearIndiceWord: true,
        crearReferenciasWord: false,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al crear módulo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Módulo</DialogTitle>
          <DialogDescription>
            Completa la información del nuevo módulo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* 🧱 Grid principal: dos columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Expediente */}
            {/* Expediente (solo se muestra si no hay módulo contenedor seleccionado) */}
{!formData.modulo_contenedor_id ||
  formData.modulo_contenedor_id === "none" ? (
  <div className="space-y-1">
    <Label htmlFor="expediente_id">Expediente</Label>
    <Select
      value={formData.expediente_id}
      onValueChange={(value) =>
        setFormData({ ...formData, expediente_id: value })
      }
    >
      <SelectTrigger className="truncate max-w-full">
        <SelectValue placeholder="Seleccionar expediente" />
      </SelectTrigger>
      <SelectContent>
        {expedientes.map((exp) => (
          <SelectItem key={exp.id} value={exp.id}>
            {exp.codigo} - {exp.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
) : null}

{/* Módulo Contenedor */}
<div className="space-y-1">
  <Label htmlFor="modulo_contenedor_id">Módulo Contenedor (opcional)</Label>
  <Select
    value={formData.modulo_contenedor_id}
    onValueChange={(value) => {
      if (value === "none") {
        // Volver a mostrar el campo expediente
        setFormData({
          ...formData,
          modulo_contenedor_id: "",
          expediente_id: "",
        });
      } else {
        const selectedModulo = modulos.find((m) => m.id === value);
        setFormData({
          ...formData,
          modulo_contenedor_id: value,
          expediente_id: selectedModulo?.expediente?.id || "",
        });
      }
    }}
  >
    <SelectTrigger className="truncate max-w-full">
      <SelectValue placeholder="Sin módulo contenedor" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="none">Sin módulo contenedor</SelectItem>
      {modulos.map((mod) => (
        <SelectItem key={mod.id} value={mod.id}>
          {mod.titulo} ({mod.expediente?.codigo})
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


            {/* Título */}
            <div className="space-y-1">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                placeholder="Título del módulo"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                required
              />
            </div>

            {/* Estado */}
            <div className="space-y-1">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) =>
                  setFormData({ ...formData, estado: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="en_revision">En Revisión</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col justify-center space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="crearIndiceWord"
                  checked={formData.crearIndiceWord}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      crearIndiceWord: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="crearIndiceWord">Crear Índice Word</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="crearReferenciasWord"
                  checked={formData.crearReferenciasWord}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      crearReferenciasWord: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="crearReferenciasWord">
                  Crear Referencias Word
                </Label>
              </div>
            </div>

            {/* Descripción (ocupa todo el ancho) */}
            <div className="col-span-full space-y-1">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción del módulo"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Módulo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
