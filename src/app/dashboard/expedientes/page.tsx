"use client"

import { useState, useEffect } from "react"
import { Filter, Plus, Search, Upload } from "lucide-react"
import { useToast } from "@/src/hooks/use-toast"
import { Expediente, expedientesService } from "@/src/lib/expedientes"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

import { ExpedientesList } from "@/src/components/expedientes/expedientes-list"
import { CreateExpedienteDialog } from "@/src/components/expedientes/create-expediente-dialog"
import { ImportExpedienteDialog } from "@/src/components/expedientes/import-expediente-dialog"

export default function ExpedientesPage() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [filterValue, setFilterValue] = useState("all")

  // ⭐ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadExpedientes()
  }, [])

  // ⭐ OPCIONES ÚNICAS DE ESTADO
  const estadoOptions = [...new Set(expedientes.map((e) => e.estado))]

  // ⭐ FILTROS + BÚSQUEDA
  const filteredExpedientes = expedientes
    .filter((exp) =>
      exp.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.codigo.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((exp) => {
      if (filterValue === "all") return true
      return exp.estado === filterValue
    })

  // ⭐ RESET DE PÁGINA
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterValue, itemsPerPage])

  // ⭐ PAGINACIÓN FINAL
  const totalItems = filteredExpedientes.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedExpedientes = filteredExpedientes.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
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

      {/* FILTROS */}
      <div className="flex items-center gap-4">
        {/* Busqueda */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar expedientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filtro por estado */}
        <Select value={filterValue} onValueChange={setFilterValue}>
          <SelectTrigger className=" flex justify-start gap-2">
            <Filter className="h-4 text-muted-foreground" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>

            {estadoOptions.map((estado) => (
              <SelectItem key={estado} value={estado}>
                {estado}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* LISTA PAGINADA */}
      <ExpedientesList
        expedientes={paginatedExpedientes}
        isLoading={isLoading}
        onUpdate={loadExpedientes}
      />

      {/* CONTROLES DE PAGINACIÓN */}
      <div className="flex justify-end items-center flex-row gap-2 mt-4">

        <span className="text-sm text-muted-foreground">Mostrar:</span>

        <Select
          value={itemsPerPage.toString()}
          onValueChange={(v) => setItemsPerPage(Number(v))}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>

        {totalPages > 1 && (
          <div className="gap-4 flex flex-row items-center">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Anterior
            </Button>

            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>

            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      {/* DIALOGS */}
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
