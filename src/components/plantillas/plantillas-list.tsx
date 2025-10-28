"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Edit, Trash2, Copy, Eye, ChevronLeft } from "lucide-react";
import { type Plantilla, plantillasService } from "@/src/lib/plantillas";
import { useToast } from "@/src/hooks/use-toast";
// versión completa con bloques
import { ViewPlantillaDialog } from "./view-plantilla-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { EditPlantillaPage } from "./edit-plantilla-dialog";

interface PlantillasListProps {
  plantillas: Plantilla[];
  isLoading: boolean;
  onUpdate: () => void;
    onEdit: (id: string) => void; // <-- nuevo prop

}

export function PlantillasList({ plantillas,onEdit, isLoading, onUpdate }: PlantillasListProps) {
  const [editingPlantilla, setEditingPlantilla] = useState<Plantilla | null>(null);
  const [viewingPlantilla, setViewingPlantilla] = useState<Plantilla | null>(null);
  const [deletingPlantilla, setDeletingPlantilla] = useState<Plantilla | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deletingPlantilla) return;

    try {
      await plantillasService.delete(deletingPlantilla.id);
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla ha sido eliminada correctamente",
        variant: "success",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al eliminar plantilla",
        variant: "destructive",
      });
    } finally {
      setDeletingPlantilla(null);
    }
  };

  const handleDuplicate = async (plantilla: Plantilla) => {
    try {
      await plantillasService.create({
        nombre: `${plantilla.nombre} (Copia)`,
        descripcion: plantilla.descripcion,
        tipo_archivo: plantilla.tipo_archivo,
        titulo: plantilla.titulo,
        encabezado: plantilla.encabezado,
        pie_pagina: plantilla.pie_pagina,
        fuente: plantilla.fuente,
        tamano_fuente: plantilla.tamano_fuente,
        color_texto: plantilla.color_texto,
        autogenerar_indice: plantilla.autogenerar_indice,
        estructura: plantilla.estructura,
      });
      toast({
        title: "Plantilla duplicada",
        description: "La plantilla ha sido duplicada correctamente",
        variant: "success",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al duplicar plantilla",
        variant: "destructive",
      });
    }
  };

  // Si hay una plantilla en edición, mostramos la vista de edición completa
  if (editingPlantilla) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setEditingPlantilla(null)}
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a la lista
        </Button>
        <EditPlantillaPage
          plantilla={editingPlantilla}
          onSuccess={() => {
            onUpdate();
            setEditingPlantilla(null);
          }}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (plantillas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No se encontraron plantillas</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-primary">
            <TableRow>
              <TableHead className="text-primary-foreground">Nombre</TableHead>
              <TableHead className="text-primary-foreground">Tipo Archivo</TableHead>
              <TableHead className="text-primary-foreground">Fecha Creación</TableHead>
              <TableHead className="text-primary-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plantillas.map((plantilla) => (
              <TableRow key={plantilla.id}>
                <TableCell className="font-medium">{plantilla.nombre}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {plantilla.tipo_archivo === "WORD" ? "Word" : "Otro"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(plantilla.creado_en).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingPlantilla(plantilla)}
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(plantilla)}
                      title="Duplicar"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(plantilla.id)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingPlantilla(plantilla)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {viewingPlantilla && (
        <ViewPlantillaDialog
          plantilla={viewingPlantilla}
          open={!!viewingPlantilla}
          onOpenChange={(open) => !open && setViewingPlantilla(null)}
        />
      )}

      <AlertDialog
        open={!!deletingPlantilla}
        onOpenChange={(open) => !open && setDeletingPlantilla(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La plantilla "{deletingPlantilla?.nombre}" será eliminada
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
