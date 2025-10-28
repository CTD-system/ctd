"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Edit, Trash2, Eye, Download } from "lucide-react"
import { type Expediente, ExpedienteEstado, expedientesService } from "@/src/lib/expedientes"
import { useToast } from "@/src/hooks/use-toast"
import { EditExpedienteDialog } from "./edit-expediente-dialog"
import { ViewExpedienteDialog } from "./view-expediente-dialog"
import { minioService } from "@/src/lib/minio"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"

interface ExpedientesListProps {
  expedientes: Expediente[]
  isLoading: boolean
  onUpdate: () => void
}

export function ExpedientesList({ expedientes, isLoading, onUpdate }: ExpedientesListProps) {
  const [editingExpediente, setEditingExpediente] = useState<Expediente | null>(null)
  const [viewingExpediente, setViewingExpediente] = useState<Expediente | null>(null)
  const [deletingExpediente, setDeletingExpediente] = useState<Expediente | null>(null)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!deletingExpediente) return

    try {
      await expedientesService.delete(deletingExpediente.id)
      toast({
        title: "Expediente eliminado",
        description: "El expediente ha sido eliminado correctamente",
      })
      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al eliminar expediente",
        variant: "destructive",
      })
    } finally {
      setDeletingExpediente(null)
    }
  }

  const handleExport = async (expediente: Expediente) => {
    try {
      await minioService.downloadExpedienteCompleto(expediente.id)
      toast({
        title: "Descarga iniciada",
        description: "El expediente se está descargando como ZIP",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al exportar expediente",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (expedientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No se encontraron expedientes</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-primary">
            <TableRow>
              <TableHead className="text-primary-foreground">Código</TableHead>
              <TableHead className="text-primary-foreground">Nombre</TableHead>
              <TableHead className="text-primary-foreground">Descripción</TableHead>
              <TableHead className="text-primary-foreground">Estado</TableHead>
              <TableHead className="text-primary-foreground">Fecha Creación</TableHead>
              <TableHead className="text-primary-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expedientes.map((expediente) => (
              <TableRow key={expediente.id}>
                <TableCell className="font-medium">{expediente.codigo}</TableCell>
                <TableCell>{expediente.nombre}</TableCell>
                <TableCell className="max-w-xs truncate">{expediente.descripcion}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      expediente.estado ===  ExpedienteEstado.APROBADO
                        ? "default"
                        : expediente.estado === ExpedienteEstado.EN_REVISION
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {expediente.estado}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(expediente.creado_en).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingExpediente(expediente)}
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleExport(expediente)} title="Exportar ZIP">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditingExpediente(expediente)} title="Editar">
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingExpediente(expediente)}
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

      {viewingExpediente && (
        <ViewExpedienteDialog
          expediente={viewingExpediente}
          open={!!viewingExpediente}
          onOpenChange={(open) => !open && setViewingExpediente(null)}
        />
      )}

      {editingExpediente && (
        <EditExpedienteDialog
          expediente={editingExpediente}
          open={!!editingExpediente}
          onOpenChange={(open) => !open && setEditingExpediente(null)}
          onSuccess={onUpdate}
        />
      )}

      <AlertDialog open={!!deletingExpediente} onOpenChange={(open) => !open && setDeletingExpediente(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El expediente "{deletingExpediente?.nombre}" será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
