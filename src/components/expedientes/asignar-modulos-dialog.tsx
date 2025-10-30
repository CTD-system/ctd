"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Checkbox } from "@/src/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Loader2, Search } from "lucide-react"
import { useToast } from "@/src/hooks/use-toast"
import { modulosService } from "@/src/lib/modulos"
import { expedientesService } from "@/src/lib/expedientes"

interface AsignarModulosDialogProps {
  expedienteId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AsignarModulosDialog({
  expedienteId,
  open,
  onOpenChange,
  onSuccess,
}: AsignarModulosDialogProps) {
  const [modulosDisponibles, setModulosDisponibles] = useState<any[]>([])
  const [filteredModulos, setFilteredModulos] = useState<any[]>([])
  const [selectedModulos, setSelectedModulos] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingList, setLoadingList] = useState(false)
  const [loadingAssign, setLoadingAssign] = useState(false)
  const { toast } = useToast()

  // 🔹 Cargar módulos disponibles (excluyendo los ya asignados)
  useEffect(() => {
    if (!open || !expedienteId) return
    const load = async () => {
      try {
        setLoadingList(true)
        const [expediente, allModulos] = await Promise.all([
          expedientesService.getById(expedienteId),
          modulosService.getAll(),
        ])
        const assignedIds = expediente.modulos?.map((m: any) => m.id) || []
        const disponibles = allModulos.filter((m: any) => !assignedIds.includes(m.id))
        setModulosDisponibles(disponibles)
        setFilteredModulos(disponibles)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Error al cargar módulos disponibles",
          variant: "destructive",
        })
      } finally {
        setLoadingList(false)
      }
    }
    load()
  }, [open, expedienteId])

  // 🔎 Búsqueda en tiempo real
  useEffect(() => {
    const filtered = modulosDisponibles.filter((m) =>
      m.titulo.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredModulos(filtered)
  }, [searchQuery, modulosDisponibles])

  // 🔗 Asignar módulos seleccionados
  const handleAsignar = async () => {
    if (selectedModulos.length === 0) {
      toast({
        title: "Atención",
        description: "Selecciona al menos un módulo para asignar",
        variant: "destructive",
      })
      return
    }

    try {
      setLoadingAssign(true)
      for (const moduloId of selectedModulos) {
        await expedientesService.asignarModulo(expedienteId, moduloId)
      }

      toast({
        title: "Módulos asignados",
        description: `${selectedModulos.length} módulo(s) se asignaron correctamente.`,
      })

      setSelectedModulos([])
      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al asignar módulos",
        variant: "destructive",
      })
    } finally {
      setLoadingAssign(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Asignar módulos al expediente</DialogTitle>
        </DialogHeader>

        {/* 🔍 Buscador */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar módulos por título..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 📋 Lista con scroll */}
        <div className="border rounded-md p-2 max-h-[400px] overflow-y-auto">
          {loadingList ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredModulos.length > 0 ? (
            filteredModulos.map((m) => (
              <div key={m.id} className="flex items-center gap-3 border-b py-2 last:border-0">
                <Checkbox
                  checked={selectedModulos.includes(m.id)}
                  onCheckedChange={(checked) =>
                    setSelectedModulos((prev) =>
                      checked ? [...prev, m.id] : prev.filter((id) => id !== m.id),
                    )
                  }
                />
                <div className="flex flex-col">
                  <span className="font-medium truncate max-w-[250px]">{m.titulo}</span>
                  {m.descripcion && (
                    <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                      {m.descripcion}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground p-2 text-center">
              No hay módulos disponibles para asignar.
            </p>
          )}
        </div>

        {/* ⚙️ Acciones */}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAsignar} disabled={loadingAssign || selectedModulos.length === 0}>
            {loadingAssign && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Asignar {selectedModulos.length > 0 ? `(${selectedModulos.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
