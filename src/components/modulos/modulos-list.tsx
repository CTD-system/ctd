"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Edit, Trash2, Eye, Download, Loader2, FilePlus2 } from "lucide-react"
import { type Modulo, ModuloEstado, modulosService } from "@/src/lib/modulos"
import { documentosService, type Documento } from "@/src/lib/documentos"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Checkbox } from "@/src/components/ui/checkbox"
import { AsignarDocumentosDialog } from "./asignar-documentos-dialog"

interface ModulosListProps {
  modulos: Modulo[]
  isLoading: boolean
  onUpdate: () => void
}

export function ModulosList({ modulos, isLoading, onUpdate }: ModulosListProps) {
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null)
  const [viewingModulo, setViewingModulo] = useState<Modulo | null>(null)
  const [deletingModulo, setDeletingModulo] = useState<Modulo | null>(null)
  const [selectedModulo, setSelectedModulo] = useState<Modulo | null>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [loadingAssign, setLoadingAssign] = useState(false)
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const { toast } = useToast()
  const [assignModulo, setAssignModulo] = useState<Modulo | null>(null)

  // 🔹 Cargar documentos cuando se abre el diálogo
 

  // 🗑️ Eliminar módulo
  const handleDelete = async () => {
    if (!deletingModulo) return
    try {
      await modulosService.delete(deletingModulo.id)
      toast({ title: "Módulo eliminado", description: "El módulo ha sido eliminado correctamente" })
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

  // 📦 Descargar módulo completo
  const handleExport = async (modulo: Modulo) => {
    try {
      await minioService.downloadModuloCompleto(modulo.id, modulo.titulo)
      toast({
        title: "Descarga iniciada",
        description: `El módulo "${modulo.titulo}" se está descargando como ZIP`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al exportar módulo",
        variant: "destructive",
      })
    }
  }

  // 👁️ Ver detalles
  const handleView = async (moduloId: string) => {
    try {
      setLoadingDetalle(true)
      const moduloCompleto = await modulosService.getById(moduloId)
      setViewingModulo(moduloCompleto)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo cargar el módulo",
        variant: "destructive",
      })
    } finally {
      setLoadingDetalle(false)
    }
  }

  // 📎 Asignar documentos seleccionados al módulo
  

  // 🌀 Cargando lista
  if (isLoading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )

  if (modulos.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No se encontraron módulos</p>
      </div>
    )

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-primary">
            <TableRow>
              <TableHead className="text-primary-foreground">Título</TableHead>
              <TableHead className="text-primary-foreground">Módulo Contenedor</TableHead>
              <TableHead className="text-primary-foreground">Estado</TableHead>
              <TableHead className="text-primary-foreground">Fecha Creación</TableHead>
              <TableHead className="text-primary-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modulos.map((modulo) => (
              <TableRow key={modulo.id}>
                <TableCell>{modulo.titulo}</TableCell>
                <TableCell>{modulo.moduloContenedor ? modulo.moduloContenedor.titulo : "—"}</TableCell>
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
                    <Button variant="ghost" size="icon" onClick={() => handleView(modulo.id)} title="Ver detalles">
                      {loadingDetalle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => handleExport(modulo)} title="Exportar ZIP">
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => setEditingModulo(modulo)} title="Editar">
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>

                    <Button
  variant="ghost"
  size="icon"
  onClick={() => setAssignModulo(modulo)}
  title="Asignar documentos"
>
  <FilePlus2 className="h-4 w-4 text-blue-600" />
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

      {assignModulo && (
  <AsignarDocumentosDialog
    moduloId={assignModulo.id}
    open={!!assignModulo}
    onOpenChange={(open) => !open && setAssignModulo(null)}
    onSuccess={onUpdate}
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
              El módulo "{deletingModulo?.titulo}" será eliminado permanentemente.
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
