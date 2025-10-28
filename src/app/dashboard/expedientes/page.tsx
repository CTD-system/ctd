"use client"

import { useState, useEffect } from "react"

import { Plus, Search, Upload } from "lucide-react"
import { useToast } from "@/src/hooks/use-toast"
import { Expediente, expedientesService } from "@/src/lib/expedientes"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { ExpedientesList } from "@/src/components/expedientes/expedientes-list"
import { CreateExpedienteDialog } from "@/src/components/expedientes/create-expediente-dialog"
import { ImportExpedienteDialog } from "@/src/components/expedientes/import-expediente-dialog"

export default function ExpedientesPage() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const { toast } = useToast()

  const loadExpedientes = async () => {
    try {
      setIsLoading(true)
      const data = await expedientesService.getAll()
      setExpedientes(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al cargar expedientes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadExpedientes()
  }, [])

  const filteredExpedientes = expedientes.filter(
    (exp) =>
      exp.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.codigo.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expedientes</h1>
          <p className="text-muted-foreground mt-2">Gestiona los expedientes del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar ZIP
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Expediente
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar expedientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ExpedientesList expedientes={filteredExpedientes} isLoading={isLoading} onUpdate={loadExpedientes} />

      <CreateExpedienteDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={loadExpedientes}
      />

      <ImportExpedienteDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onSuccess={loadExpedientes}
      />
    </div>
  )
}
