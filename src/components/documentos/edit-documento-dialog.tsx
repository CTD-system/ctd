"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { type Documento, documentosService } from "@/src/lib/documentos"
import { useToast } from "@/src/hooks/use-toast"

interface EditDocumentoDialogProps {
  documento: Documento
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditDocumentoDialog({ documento, open, onOpenChange, onSuccess }: EditDocumentoDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: documento.nombre,
    tipo: documento.tipo,
  })
  const { toast } = useToast()

  useEffect(() => {
    setFormData({
      nombre: documento.nombre,
      tipo: documento.tipo,
    })
  }, [documento])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await documentosService.update(documento.id, formData)
      toast({
        title: "Documento actualizado",
        description: "El documento ha sido actualizado correctamente",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al actualizar documento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
          <DialogDescription>Modifica los datos del documento</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre</Label>
              <Input
                id="edit-nombre"
                placeholder="Nombre del documento"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tipo">Tipo</Label>
              <Input
                id="edit-tipo"
                placeholder="Tipo de documento"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as Documento["tipo"] })}
                required
              />
            </div>
        
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
