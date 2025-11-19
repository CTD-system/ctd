"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Plus, Search, Upload, Filter, CircleAlert } from "lucide-react"
import { DocumentosList } from "@/src/components/documentos/documentos-list"
import { UploadDocumentoDialog } from "@/src/components/documentos/upload-documento-dialog"

import { documentosService, type Documento } from "@/src/lib/documentos"
import { useToast } from "@/src/hooks/use-toast"
import { CreateDocumentoFromPlantillaDialog } from "@/src/components/documentos/create-doc-from-plantilla"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { mimeToExt } from "@/src/utils/mimeTypeTranslator"
import { Card, CardContent } from "@/src/components/ui/card"
import { modulosService } from "@/src/lib/modulos"
import { plantillasService } from "@/src/lib/plantillas"

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"tipo" | "modulo" | "mime" | "">("")
  const [filterValue, setFilterValue] = useState("all")
  const [moduloList,setModuloList] = useState(0)
  const [plantillaList,setPlantillaList] = useState(0)
  // ⭐ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { toast } = useToast()

 

  const loadDocumentos = async () => {
    try {
      setIsLoading(true)
      const data = await documentosService.getAll()
       const mod = await modulosService.getAll()
       const plant = await plantillasService.getAll()
       setModuloList(mod.length)
       setPlantillaList(plant.length)
      setDocumentos(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Error al cargar documentos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDocumentos()
  }, [])

  // ⭐ OPCIONES ÚNICAS
  const tipoOptions = [...new Set(documentos.map((d) => d.tipo))]
  const moduloOptions = [
    ...new Map(
      documentos
        .filter((d) => d.modulo)
        .map((d) => [d.modulo?.id, d.modulo])
    ).values(),
  ]
  const mimeOptions = [...new Set(documentos.map((d) => d.mime_type))]

  // ⭐ FILTRO + BÚSQUEDA
  const filteredDocumentos = documentos
    .filter((doc) =>
      doc.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tipo.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((doc) => {
      if (!filterType || filterValue === "all") return true

      if (filterType === "tipo") return doc.tipo === filterValue
      if (filterType === "mime") return doc.mime_type === filterValue
      if (filterType === "modulo") return doc.modulo?.id === filterValue

      return true
    })

  // ⭐ RESET PAGINADO AL FILTRAR
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterType, filterValue, itemsPerPage])

  // ⭐ PAGINACIÓN FINAL
  const totalItems = filteredDocumentos.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDocs = filteredDocumentos.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground mt-2 mb-3">Gestiona los documentos del sistema</p>
         {moduloList === 0 &&( <Card className="border border-yellow-500 w-md pt-1 pb-0 ">
            <CardContent className="flex flex-row items-center gap-4">
              <CircleAlert size={'80'} className="text-yellow-500 "/> No hay modulos  en el sistema, importe o crea
              al menos uno para crear o importar documentos. {''} 
              {plantillaList ===0 ? "No hay plantillas en el sistema cree una para crear un documento" :""}
            </CardContent>
          </Card>)}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Subir Documento
          </Button>

          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Documento
          </Button>
        </div>
      </div>

      {/* BÚSQUEDA + FILTROS */}
      <div className="flex items-center gap-4">

        {/* BÚSQUEDA */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* FILTRO TIPO */}
        <Select
          onValueChange={(v) => {
            setFilterType(v as any)
            setFilterValue("all")
          }}
        >
          <SelectTrigger className=" flex gap-2">
            <Filter className="h-4 text-muted-foreground" />
            <SelectValue placeholder="Filtrar por..." />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="tipo">Tipo</SelectItem>
            <SelectItem value="modulo">Módulo</SelectItem>
            <SelectItem value="mime">MIME Type</SelectItem>
          </SelectContent>
        </Select>

        {/* FILTRO VALOR */}
        {filterType !== "" && (
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className="">
              <SelectValue placeholder="Seleccionar valor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>

              {filterType === "tipo" &&
                tipoOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}

              {filterType === "mime" &&
               mimeOptions.map((m) => (
  <SelectItem key={m} value={m}>
    {mimeToExt(m)}
  </SelectItem>
))}

              {filterType === "modulo" &&
                moduloOptions.map((mod) => (
                  <SelectItem key={mod?.id} value={mod?.id || ""}>
                    {mod?.titulo}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* LISTA CON PAGINACIÓN */}
      <DocumentosList
        documentos={paginatedDocs}
        isLoading={isLoading}
        onUpdate={loadDocumentos}
      />

      {/* PAGINADO */}
      <div className="flex justify-end items-center gap-3 mt-4">

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
          <div className="flex gap-4 items-center">
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
