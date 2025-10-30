"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Plus, Search, Upload } from "lucide-react"
import { DocumentosList } from "@/src/components/documentos/documentos-list"
import { UploadDocumentoDialog } from "@/src/components/documentos/upload-documento-dialog"

import { documentosService, type Documento } from "@/src/lib/documentos"
import { useToast } from "@/src/hooks/use-toast"
import { CreateDocumentoFromPlantillaDialog } from "@/src/components/documentos/create-doc-from-plantilla"

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  const loadDocumentos = async () => {
    try {
      setIsLoading(true)
      const data = await documentosService.getAll()
      setDocumentos(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al cargar documentos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDocumentos()
  }, [])

  const filteredDocumentos = documentos.filter(
    (doc) =>
      doc.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tipo.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground mt-2">Gestiona los documentos del sistema</p>
        </div>

        <div className="flex gap-2">
          {/* Botón: Subir Documento */}
          <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Subir Documento
          </Button>

          {/* Botón: Crear Documento */}
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Documento
          </Button>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Lista de documentos */}
      <DocumentosList documentos={filteredDocumentos} isLoading={isLoading} onUpdate={loadDocumentos} />

      {/* Dialogs */}
      <UploadDocumentoDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onSuccess={loadDocumentos}
      />

      <CreateDocumentoFromPlantillaDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={loadDocumentos}
      />
    </div>
  )
}
