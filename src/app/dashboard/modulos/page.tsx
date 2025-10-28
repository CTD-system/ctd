"use client"

import { useState, useEffect } from "react"

import { Plus, Search, Upload } from "lucide-react"
import { Modulo, modulosService } from "@/src/lib/modulos"
import { useToast } from "@/src/hooks/use-toast"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { ModulosList } from "@/src/components/modulos/modulos-list"
import { CreateModuloDialog } from "@/src/components/modulos/create-modulo-dialog"
import { ImportModuloDialog } from "@/src/components/modulos/import-modulo-dialog"


export default function ModulosPage() {
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const { toast } = useToast()

  const loadModulos = async () => {
    try {
      setIsLoading(true)
      const data = await modulosService.getAll()
      setModulos(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al cargar módulos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadModulos()
  }, [])

  const filteredModulos = modulos.filter(
    (mod) =>
      mod.titulo.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Módulos</h1>
          <p className="text-muted-foreground mt-2">Gestiona los módulos del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar ZIP
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Módulo
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar módulos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ModulosList modulos={filteredModulos} isLoading={isLoading} onUpdate={loadModulos} />

      <CreateModuloDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSuccess={loadModulos} />

      <ImportModuloDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} onSuccess={loadModulos} />
    </div>
  )
}
