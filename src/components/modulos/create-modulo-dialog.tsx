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
import { modulosService } from "@/src/lib/modulos"
import { expedientesService } from "@/src/lib/expedientes"
import { useToast } from "@/src/hooks/use-toast"

interface CreateModuloDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateModuloDialog({ open, onOpenChange, onSuccess }: CreateModuloDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [expedientes, setExpedientes] = useState<any[]>([])
  const [modulos, setModulos] = useState<any[]>([])
  const [formData, setFormData] = useState({
    expedienteId: "",
    moduloContenedorId: "",
    numero: "",
    titulo: "",
    descripcion: "",
    estado: "BORRADOR",
    ruta: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadExpedientes()
      loadModulos()
    }
  }, [open])

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
      setModulos(data)
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

      await modulosService.create(submitData)
      toast({
        title: "Módulo creado",
        description: "El módulo ha sido creado correctamente",
      })
      onSuccess()
      onOpenChange(false)
      setFormData({
        expedienteId: "",
        moduloContenedorId: "",
        numero: "",
        titulo: "",
        descripcion: "",
        estado: "BORRADOR",
        ruta: "",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al crear módulo",
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
          <DialogTitle>Crear Nuevo Módulo</DialogTitle>
          <DialogDescription>Ingresa los datos del nuevo módulo</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expedienteId">Expediente</Label>
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
              <Label htmlFor="moduloContenedorId">Módulo Contenedor (opcional)</Label>
              <Select
                value={formData.moduloContenedorId}
                onValueChange={(value) => setFormData({ ...formData, moduloContenedorId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin módulo contenedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin módulo contenedor</SelectItem>
                  {modulos.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id}>
                      {mod.numero} - {mod.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                placeholder="Número del módulo"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                placeholder="Título del módulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción del módulo"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ruta">Ruta</Label>
              <Input
                id="ruta"
                placeholder="Ruta del módulo"
                value={formData.ruta}
                onChange={(e) => setFormData({ ...formData, ruta: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
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
              {isLoading ? "Creando..." : "Crear Módulo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
