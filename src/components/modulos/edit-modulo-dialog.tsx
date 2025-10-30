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
import { Trash2, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { type Modulo, ModuloEstado, modulosService } from "@/src/lib/modulos"
import { useToast } from "@/src/hooks/use-toast"

interface EditModuloDialogProps {
  modulo: Modulo
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditModuloDialog({ modulo, open, onOpenChange, onSuccess }: EditModuloDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [tabValue, setTabValue] = useState("datos")
  const [formData, setFormData] = useState({
    titulo: modulo.titulo,
    descripcion: modulo.descripcion,
    estado: modulo.estado,
  })
  const [referencias, setReferencias] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setFormData({
        titulo: modulo.titulo,
        descripcion: modulo.descripcion,
        estado: modulo.estado,
      })
      setReferencias([])
      setTabValue("datos")
    }
  }, [open, modulo])

  const handleAddReferencia = () => setReferencias([...referencias, ""])
  const handleRemoveReferencia = (index: number) => setReferencias([...referencias.slice(0, index), ...referencias.slice(index + 1)])
  const handleChangeReferencia = (index: number, value: string) => {
    const updated = [...referencias]
    updated[index] = value
    setReferencias(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const updateData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        estado: formData.estado,
      }
      await modulosService.update(modulo.id, updateData)

      const referenciasValidas = referencias.map(r => r.trim()).filter(r => r.length > 0)
      if (modulo.referencias_word_nombre && referenciasValidas.length > 0) {
        await modulosService.editarReferenciasWord(modulo.id, referenciasValidas)
      }

      toast({ title: "Módulo actualizado", description: "Los cambios se guardaron correctamente." })
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al actualizar el módulo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Editar Módulo</DialogTitle>
          <DialogDescription>Modifica los datos del módulo y sus referencias (si aplica)</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsList className="mb-4">
              <TabsTrigger value="datos">Datos del Módulo</TabsTrigger>
              {modulo.referencias_word_nombre && <TabsTrigger value="referencias">Referencias</TabsTrigger>}
            </TabsList>

            <TabsContent value="datos">
              <div className="space-y-4">
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
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => setFormData({ ...formData, estado: value as ModuloEstado })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ModuloEstado.BORRADOR}>Borrador</SelectItem>
                      <SelectItem value={ModuloEstado.EN_REVISION}>En Revisión</SelectItem>
                      <SelectItem value={ModuloEstado.COMPLETADO}>Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {modulo.referencias_word_nombre && (
  <TabsContent value="referencias">
    <div className="flex flex-col gap-3 max-h-80 overflow-y-auto p-2 border rounded-md">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mb-2"
        onClick={handleAddReferencia}
      >
        <Plus className="w-4 h-4 mr-1" /> Agregar referencia
      </Button>

      {referencias.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay referencias agregadas. Usa el botón para añadirlas.
        </p>
      )}

      {referencias.map((ref, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder={`Referencia ${index + 1}`}
            value={ref}
            onChange={(e) => handleChangeReferencia(index, e.target.value)}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => handleRemoveReferencia(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  </TabsContent>
)}

          </Tabs>

          <DialogFooter className="mt-4">
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
