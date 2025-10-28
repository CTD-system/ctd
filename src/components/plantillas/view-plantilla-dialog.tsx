"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { plantillasService, type Plantilla } from "@/src/lib/plantillas";
import { PlantillaPreview } from "./plantilla-preview";
import { useEffect, useState } from "react";

interface ViewPlantillaDialogProps {
  plantilla: Plantilla;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPlantillaDialog({
  plantilla,
  open,
  onOpenChange,
}: ViewPlantillaDialogProps) {
  const [plantillaCompleta, setPlantillaCompleta] = useState<Plantilla | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Cargar plantilla completa al abrir el diálogo
  useEffect(() => {
    if (open && plantilla?.id) {
      setLoading(true);
      plantillasService
        .getById(plantilla.id)
        .then((data) => setPlantillaCompleta(data))
        .catch(() => setPlantillaCompleta(null))
        .finally(() => setLoading(false));
    }
  }, [open, plantilla]);

  const data = plantillaCompleta || plantilla;

  return (
    <Dialog  open={open} onOpenChange={onOpenChange} >
       <DialogPortal >
      <DialogContent
      className={`${
    activeTab === "preview"
      ? "max-auto overflow-y-scroll "
      : "max-w-4xl"
  } max-h-[90vh]`}
      >
        <DialogHeader>
          <DialogTitle>Detalles de la Plantilla</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab}
  onValueChange={setActiveTab}
  className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="preview">Previsualización</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nombre
              </label>
              <p className="text-base">{data.nombre}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Descripción
              </label>
              <p className="text-base">{data.descripcion}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tipo de Archivo
                </label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {data.tipo_archivo ===
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      ? "word"
                      : "otro"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Autogenerar Índice
                </label>
                <p className="text-base">
                  {data.autogenerar_indice ? "Sí" : "No"}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Título del Documento
              </label>
              <p className="text-base">{data.titulo}</p>
            </div>
            <div className="grid grid-cols-2 gap-4"></div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Fuente
                </label>
                <p className="text-base">{data.fuente}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tamaño de Fuente
                </label>
                <p className="text-base">{data.tamano_fuente}pt</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Color de Texto
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: data.color_texto }}
                  />
                  <p className="text-base">{data.color_texto}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Fecha de Creación
                </label>
                <p className="text-base">
                  {new Date(data.creado_en).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Última Actualización
                </label>
                <p className="text-base">
                  {new Date(data.creado_en).toLocaleString()}
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="preview" >
            <PlantillaPreview
              estructura={
                typeof data.estructura === "string"
                  ? JSON.parse(data.estructura)
                  : data.estructura
              }
              fuente={data.fuente}
              tamanoFuente={data.tamano_fuente}
              colorTexto={data.color_texto}
              encabezado={data.encabezado}
              piePagina={data.pie_pagina}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
