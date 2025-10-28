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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { type Modulo, ModuloEstado, modulosService } from "@/src/lib/modulos"
import { expedientesService } from "@/src/lib/expedientes"
import { useToast } from "@/src/hooks/use-toast"

interface EditModuloDialogProps {
  modulo: Modulo
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditModuloDialog({ modulo, open, onOpenChange, onSuccess }: EditModuloDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [expedientes, setExpedientes] = useState<any[]>([])
  const [modulos, setModulos] = useState<any[]>([])
  const [formData, setFormData] = useState({
    expedienteId: modulo.expediente?.id || "defaultExpedienteId",
    moduloContenedorId: modulo.moduloContenedor?.id || "defaultModuloContenedorId",
    numero: modulo.numero,
    titulo: modulo.titulo,
    descripcion: modulo.descripcion,
    estado: modulo.estado,
    ruta: modulo.ruta || "",
  })
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadExpedientes()
      loadModulos()
    }
  }, [open])

  useEffect(() => {
    setFormData({
      expedienteId: modulo.expediente?.id || "defaultExpedienteId",
      moduloContenedorId: modulo.moduloContenedor?.id || "defaultModuloContenedorId",
      numero: modulo.numero,
      titulo: modulo.titulo,
      descripcion: modulo.descripcion,
      estado: modulo.estado,
      ruta: modulo.ruta || "",
    })
  }, [modulo])

  const loadExpedientes = async () => {
    try {
      const data = await expedientesService.getAll()
      setExpedientes(data)
    } catch (error) {
      console.error("Error loading expedientes:", error)
    }
  }

  const loadModulos = async () => {
    try {
      const data = await modulosService.getAll()
      setModulos(data.filter((m: any) => m.id !== modulo.id))
    } catch (error) {
      console.error("Error loading modulos:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const submitData: any = {
        expedienteId: formData.expedienteId,
        numero: formData.numero,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        estado: formData.estado,
        ruta: formData.ruta,
      }

      if (formData.moduloContenedorId) {
        submitData.moduloContenedorId = formData.moduloContenedorId
      }

      await modulosService.update(modulo.id, submitData)
      toast({
        title: "Módulo actualizado",
        description: "El módulo ha sido actualizado correctamente",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al actualizar módulo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Módulo</DialogTitle>
          <DialogDescription>Modifica los datos del módulo</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-expedienteId">Expediente</Label>
              <Select
                value={formData.expedienteId}
                onValueChange={(value) => setFormData({ ...formData, expedienteId: value })}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="edit-moduloContenedorId">Módulo Contenedor (opcional)</Label>
              <Select
                value={formData.moduloContenedorId}
                onValueChange={(value) => setFormData({ ...formData, moduloContenedorId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin módulo contenedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defaultModuloContenedorId">Sin módulo contenedor</SelectItem>
                  {modulos.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id}>
                      {mod.numero} - {mod.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-titulo">Título</Label>
              <Input
                id="edit-titulo"
                placeholder="Título del módulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Textarea
                id="edit-descripcion"
                placeholder="Descripción del módulo"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ruta">Ruta</Label>
              <Input
                id="edit-ruta"
                placeholder="Ruta del módulo"
                value={formData.ruta}
                onChange={(e) => setFormData({ ...formData, ruta: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value as ModuloEstado })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BORRADOR">Borrador</SelectItem>
                  <SelectItem value="EN_REVISION">En Revisión</SelectItem>
                  <SelectItem value="COMPLETADO">Completado</SelectItem>
                </SelectContent>
              </Select>
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
