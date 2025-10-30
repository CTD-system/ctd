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
import { documentosService } from "@/src/lib/documentos"
import { modulosService } from "@/src/lib/modulos"

interface AsignarDocumentosDialogProps {
  moduloId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AsignarDocumentosDialog({
  moduloId,
  open,
  onOpenChange,
  onSuccess,
}: AsignarDocumentosDialogProps) {
  const [documentosDisponibles, setDocumentosDisponibles] = useState<any[]>([])
  const [filteredDocs, setFilteredDocs] = useState<any[]>([])
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [loadingAssign, setLoadingAssign] = useState(false)
  const { toast } = useToast()

  // 📦 Cargar documentos cuando se abre el diálogo
  useEffect(() => {
    if (!open || !moduloId) return
    const loadDocs = async () => {
      try {
        setLoadingDocs(true)
        const [modulo, allDocs] = await Promise.all([
          modulosService.getById(moduloId),
          documentosService.getAll(),
        ])

        // Excluir documentos ya asignados
        const assignedIds = modulo.documentos?.map((d: any) => d.id) || []
        const disponibles = allDocs.filter((doc: any) => !assignedIds.includes(doc.id))
        setDocumentosDisponibles(disponibles)
        setFilteredDocs(disponibles)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Error al cargar documentos disponibles",
          variant: "destructive",
        })
      } finally {
        setLoadingDocs(false)
      }
    }
    loadDocs()
  }, [open, moduloId])

  // 🔎 Filtrado en tiempo real
  useEffect(() => {
    const filtered = documentosDisponibles.filter(
      (doc) =>
        doc.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tipo.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredDocs(filtered)
  }, [searchQuery, documentosDisponibles])

  // 🧩 Asignar documentos seleccionados al módulo
  const handleAsignarDocumentos = async () => {
    if (selectedDocs.length === 0) return
    try {
      setLoadingAssign(true)
      for (const documentoId of selectedDocs) {
        await modulosService.asignarDocumento(moduloId, documentoId)
      }

      toast({
        title: "Documentos asignados",
        description: `${selectedDocs.length} documento(s) fueron agregados al módulo correctamente.`,
      })

      setSelectedDocs([])
      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al asignar documentos",
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
          <DialogTitle>Asignar documentos al módulo</DialogTitle>
        </DialogHeader>

        {/* 🔍 Buscador */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos por nombre o tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 📜 Lista con scroll */}
        <div className="border rounded-md p-2 mt-2 max-h-[400px] overflow-y-auto">
          {loadingDocs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 border-b py-2 last:border-0">
                <Checkbox
                  checked={selectedDocs.includes(doc.id)}
                  onCheckedChange={(checked) =>
                    setSelectedDocs((prev) =>
                      checked ? [...prev, doc.id] : prev.filter((id) => id !== doc.id),
                    )
                  }
                />
                <div className="flex flex-col">
                  <span className="font-medium truncate max-w-[250px]">{doc.nombre}</span>
                  <span className="text-xs text-muted-foreground">{doc.tipo}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground p-2 text-center">
              No hay documentos disponibles para asignar.
            </p>
          )}
        </div>

        {/* 🧩 Acciones */}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAsignarDocumentos} disabled={loadingAssign || selectedDocs.length === 0}>
            {loadingAssign && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Asignar {selectedDocs.length > 0 ? `(${selectedDocs.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
