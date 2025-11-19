"use client";

import { useState, useEffect } from "react";
import { Filter, Plus, Search, Upload } from "lucide-react";
import { Modulo, modulosService } from "@/src/lib/modulos";
import { useToast } from "@/src/hooks/use-toast";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ModulosList } from "@/src/components/modulos/modulos-list";
import { CreateModuloDialog } from "@/src/components/modulos/create-modulo-dialog";
import { ImportModuloDialog } from "@/src/components/modulos/import-modulo-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";

export default function ModulosPage() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const [filterType, setFilterType] = useState<"expediente" | "estado" | "contenedor" | "">("");
;
  const [filterValue, setFilterValue] = useState("");

  // ⭐ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);


  const { toast } = useToast();

  const loadModulos = async () => {
    try {
      setIsLoading(true);
      const data = await modulosService.getAll();
      setModulos(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al cargar módulos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadModulos();
  }, []);

  // 🔍 Filtros + búsqueda
  const filteredModulos = modulos
    .filter((mod) =>
      mod.titulo.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((mod) => {
      if (!filterType || filterValue === "" || filterValue === "all") return true;

      if (filterType === "expediente")
        return mod.expediente.id === filterValue;

      if (filterType === "estado")
        return mod.estado === filterValue;

      if (filterType === "contenedor")
  return mod.moduloContenedor?.id === filterValue;


      return true;
    });

  // ⭐ RESET de página al filtrar/buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterValue]);

  useEffect(() => {
  setCurrentPage(1);
}, [itemsPerPage]);


  // Opciones dinámicas
  const expedienteOptions = [
    ...new Map(modulos.map((m) => [m.expediente?.id, m.expediente])).values(),
  ];

  const estadoOptions = [...new Set(modulos.map((m) => m.estado))];

  const contenedorOptions = [
  ...new Map(
    modulos
      .filter((m) => m.moduloContenedor) // evitar nulls
      .map((m) => [m.moduloContenedor?.id, m.moduloContenedor])
  ).values(),
];

  // ⭐ PAGINACIÓN (se aplica al final)
  const totalItems = filteredModulos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedModulos = filteredModulos.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

      <div className="flex items-center flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar módulos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* FILTROS */}
        <div className="flex flex-row items-center gap-2  p-2 rounded-md">
         

          {/* Tipo de filtro */}
          <Select
            onValueChange={(v) => {
              setFilterType(v as any);
              setFilterValue("");
            }}
          >
            
            <SelectTrigger className=" hover:cursor-pointer flex justify-start">
               <Filter className="text-muted-foreground h-4  left-3"/>
              <SelectValue  placeholder="Tipo de filtro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expediente">Expediente</SelectItem>
              <SelectItem value="estado">Estado</SelectItem>
              <SelectItem value="contenedor">Modulo-Contenedor</SelectItem>

            </SelectContent>
          </Select>

          {/* Valor del filtro */}
          {filterType && (
            <Select value={filterValue} onValueChange={setFilterValue}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Seleccionar valor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>

                {filterType === "expediente" &&
                  expedienteOptions.map((exp) => (
                    <SelectItem key={exp.id} value={exp.id}>
                      {exp.nombre}
                    </SelectItem>
                  ))}

                {filterType === "estado" &&
                  estadoOptions.map((est) => (
                    <SelectItem key={est} value={est}>
                      {est}
                    </SelectItem>
                  ))}

                  {filterType === "contenedor" &&
  contenedorOptions.map((c) => (
    <SelectItem key={c?.id} value={c?.id? c?.id:''}>
      {c?.titulo}
    </SelectItem>
  ))}

              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* ⭐ LISTA CON PAGINACIÓN */}
      <ModulosList 
        modulos={paginatedModulos} 
        isLoading={isLoading} 
        onUpdate={loadModulos} 
      />

      <div className="flex justify-end items-center flex-row gap-2 mt-2">
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


      {/* ⭐ CONTROLES DE PAGINACIÓN */}
      

      {/* Dialogs */}
      <CreateModuloDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={loadModulos}
      />

      <ImportModuloDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onSuccess={loadModulos}
      />
    </div>
  );
}
