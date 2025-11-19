"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Edit, Trash2, Download, Eye, FilePlus2, ClipboardPlus } from "lucide-react";
import {
  type Documento,
  documentosService,
  DocumentoTipo,
} from "@/src/lib/documentos";
import { useToast } from "@/src/hooks/use-toast";
import { EditDocumentoDialog } from "./edit-documento-dialog";
import { minioService } from "@/src/lib/minio";
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
import { ViewDocumentoDialog } from "./view-documento-dialog";
import { mimeToExt } from "@/src/utils/mimeTypeTranslator";

interface DocumentosListProps {
  documentos: Documento[];
  isLoading: boolean;
  onUpdate: () => void;
}

export function DocumentosList({
  documentos,
  isLoading,
  onUpdate,
}: DocumentosListProps) {
  const [editingDocumento, setEditingDocumento] = useState<Documento | null>(null);
  const [viewingDocumento, setViewingDocumento] = useState<Documento | null>(null);
  const [deletingDocumento, setDeletingDocumento] = useState<Documento | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deletingDocumento) return;
    try {
      await documentosService.delete(deletingDocumento.id);
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado correctamente",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al eliminar documento",
        variant: "destructive",
      });
    } finally {
      setDeletingDocumento(null);
    }
  };

  const handleDownload = async (documento: Documento) => {
    try {
      await minioService.downloadDocumento(documento.id,documento.nombre);
      toast({
        title: "Descarga iniciada",
        description: "El documento se está descargando",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al descargar documento",
        variant: "destructive",
      });
    }
  };

  // 🧩 Nueva acción: generar plantilla desde documento
  const handleGenerarPlantilla = async (documento: Documento) => {
  try {
    // 1️⃣ Generar plantilla en backend
    const res = await documentosService.generarPlantillaDesdeDocumento(documento.id);
    toast({
      title: "Plantilla generada",
      description: res.message,
    });

    // 2️⃣ Actualizar el documento original a tipo PLANTILLA
    await documentosService.update(documento.id, { tipo: DocumentoTipo.PLANTILLA });

    // 3️⃣ Refrescar la lista
    onUpdate();
  } catch (error: any) {
    console.error("❌ Error generando plantilla:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Error al generar plantilla",
      variant: "destructive",
    });
  }
};


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (documentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No se encontraron documentos</p>
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
              <TableHead className="text-primary-foreground">Tipo</TableHead>
              <TableHead className="text-primary-foreground">Versión</TableHead>
              <TableHead className="text-primary-foreground">MIME Type</TableHead>
              <TableHead className="text-primary-foreground">Fecha Subida</TableHead>
              <TableHead className="text-primary-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentos.map((documento) => (
              <TableRow key={documento.id}>
                <TableCell className="font-medium max-w-xs truncate">{documento.nombre}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      documento.tipo === DocumentoTipo.PLANTILLA
                        ? "default"
                        : documento.tipo === DocumentoTipo.INFORME
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {documento.tipo}
                  </Badge>
                </TableCell>
                <TableCell>{documento.version}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {mimeToExt(documento.mime_type)}
                </TableCell>
                <TableCell>{new Date(documento.subido_en).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingDocumento(documento)}
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(documento)}
                      title="Descargar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    {/* 🧩 Mostrar solo si el documento no es plantilla */}
                    {documento.tipo === DocumentoTipo.INFORME && documento.mime_type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGenerarPlantilla(documento)}
                        title="Generar plantilla desde este documento"
                      >
                        <ClipboardPlus className="h-4 w-4 text-blue-500" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingDocumento(documento)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingDocumento(documento)}
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

      {/* 🔍 Dialogs */}
      {viewingDocumento && (
        <ViewDocumentoDialog
          documento={viewingDocumento}
          open={!!viewingDocumento}
          onOpenChange={(open) => !open && setViewingDocumento(null)}
        />
      )}

      {editingDocumento && (
        <EditDocumentoDialog
          documento={editingDocumento}
          open={!!editingDocumento}
          onOpenChange={(open) => !open && setEditingDocumento(null)}
          onSuccess={onUpdate}
        />
      )}

      {/* 🗑 Confirmación de eliminación */}
      <AlertDialog
        open={!!deletingDocumento}
        onOpenChange={(open) => !open && setDeletingDocumento(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El documento "{deletingDocumento?.nombre}" será
              eliminado permanentemente.
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
