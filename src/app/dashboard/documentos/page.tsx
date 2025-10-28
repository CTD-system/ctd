"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Plus, Search } from "lucide-react"
import { DocumentosList } from "@/src/components/documentos/documentos-list"
import { UploadDocumentoDialog } from "@/src/components/documentos/upload-documento-dialog"
import { documentosService, type Documento } from "@/src/lib/documentos"
import { useToast } from "@/src/hooks/use-toast"

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground mt-2">Gestiona los documentos del sistema</p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Subir Documento
        </Button>
      </div>

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

      <DocumentosList documentos={filteredDocumentos} isLoading={isLoading} onUpdate={loadDocumentos} />

      <UploadDocumentoDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onSuccess={loadDocumentos}
      />
    </div>
  )
}
