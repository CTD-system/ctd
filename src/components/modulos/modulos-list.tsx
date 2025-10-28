"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Edit, Trash2, Eye, Download } from "lucide-react"
import { type Modulo, ModuloEstado, modulosService } from "@/src/lib/modulos"
import { useToast } from "@/src/hooks/use-toast"
import { EditModuloDialog } from "./edit-modulo-dialog"
import { ViewModuloDialog } from "./view-modulo-dialog"
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

interface ModulosListProps {
  modulos: Modulo[]
  isLoading: boolean
  onUpdate: () => void
}

export function ModulosList({ modulos, isLoading, onUpdate }: ModulosListProps) {
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null)
  const [viewingModulo, setViewingModulo] = useState<Modulo | null>(null)
  const [deletingModulo, setDeletingModulo] = useState<Modulo | null>(null)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!deletingModulo) return

    try {
      await modulosService.delete(deletingModulo.id)
      toast({
        title: "Módulo eliminado",
        description: "El módulo ha sido eliminado correctamente",
      })
      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al eliminar módulo",
        variant: "destructive",
      })
    } finally {
      setDeletingModulo(null)
    }
  }

  const handleExport = async (modulo: Modulo) => {
    try {
      const filename = `modulo_${modulo.numero}.zip`
      await minioService.downloadModulo(filename)
      toast({
        title: "Descarga iniciada",
        description: "El módulo se está descargando como ZIP",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al exportar módulo",
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

  if (modulos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No se encontraron módulos</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-primary">
            <TableRow>
              <TableHead className="text-primary-foreground">Número</TableHead>
              <TableHead className="text-primary-foreground">Título</TableHead>
              <TableHead className="text-primary-foreground">Descripción</TableHead>
              <TableHead className="text-primary-foreground">Estado</TableHead>
              <TableHead className="text-primary-foreground">Fecha Creación</TableHead>
              <TableHead className="text-primary-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modulos.map((modulo) => (
              <TableRow key={modulo.id}>
                <TableCell className="font-medium">{modulo.numero}</TableCell>
                <TableCell>{modulo.titulo}</TableCell>
                <TableCell className="max-w-xs truncate">{modulo.descripcion}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      modulo.estado === ModuloEstado.BORRADOR
                        ? "default"
                        : modulo.estado === ModuloEstado.EN_REVISION
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {modulo.estado}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(modulo.creado_en).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewingModulo(modulo)} title="Ver detalles">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleExport(modulo)} title="Exportar ZIP">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditingModulo(modulo)} title="Editar">
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingModulo(modulo)} title="Eliminar">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {viewingModulo && (
        <ViewModuloDialog
          modulo={viewingModulo}
          open={!!viewingModulo}
          onOpenChange={(open) => !open && setViewingModulo(null)}
        />
      )}

      {editingModulo && (
        <EditModuloDialog
          modulo={editingModulo}
          open={!!editingModulo}
          onOpenChange={(open) => !open && setEditingModulo(null)}
          onSuccess={onUpdate}
        />
      )}

      <AlertDialog open={!!deletingModulo} onOpenChange={(open) => !open && setDeletingModulo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El módulo "{deletingModulo?.titulo}" será eliminado permanentemente.
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
