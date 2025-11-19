"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ChevronLeft } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { Plantilla, plantillasService } from "@/src/lib/plantillas";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { PlantillasList } from "@/src/components/plantillas/plantillas-list";
import { CreatePlantillaPage } from "@/src/components/plantillas/create-plantilla-dialog";
import { EditPlantillaPage } from "@/src/components/plantillas/edit-plantilla-dialog";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";

export default function PlantillasPage() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  // ⭐ PAGINACIÓN (IGUAL A DOCUMENTOS)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isCreating, setIsCreating] = useState(false);
  const [editingPlantilla, setEditingPlantilla] = useState<Plantilla | null>(null);

  const { toast } = useToast();

  const loadPlantillas = async () => {
    try {
      setIsLoading(true);
      const data = await plantillasService.getAll();
      setPlantillas(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Error al cargar plantillas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlantillaForEdit = async (id: string) => {
    try {
      setIsLoading(true);
      const plantilla = await plantillasService.getById(id);
      setEditingPlantilla(plantilla);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Error al cargar plantilla",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlantillas();
  }, []);

  const filteredPlantillas = plantillas.filter((p) =>
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ⭐ RESET PAGINADO
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  // ⭐ PAGINACIÓN FINAL (IGUAL A DOCUMENTOS)
  const totalItems = filteredPlantillas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedPlantillas = filteredPlantillas.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ⭐ VISTA EDICIÓN
  if (editingPlantilla) {
    return (
      <div className="space-y-4">
        <div
          className="flex items-center gap-2 text-sm text-muted-foreground mb-4 cursor-pointer"
          onClick={() => setEditingPlantilla(null)}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver a Plantillas</span>
        </div>

        <EditPlantillaPage
          plantilla={editingPlantilla}
          onSuccess={() => {
            loadPlantillas();
            setEditingPlantilla(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isCreating && (
        <>
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Plantillas</h1>
              <p className="text-muted-foreground mt-2">
                Gestiona las plantillas de documentos
              </p>
            </div>

            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Plantilla
            </Button>
          </div>

          {/* BÚSQUEDA + ITEMS PER PAGE (IGUAL A DOCUMENTOS) */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar plantillas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* ITEMS POR PAGINA */}
            
          </div>

          {/* LISTA */}
          <PlantillasList
            plantillas={paginatedPlantillas}
            isLoading={isLoading}
            onUpdate={loadPlantillas}
            onEdit={(id) => loadPlantillaForEdit(id)}
          />

          {/* PAGINADO (IGUAL A DOCUMENTOS) */}
          <div className="flex justify-end items-center gap-3 mt-4">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(v) => setItemsPerPage(Number(v))}
            >
              <SelectTrigger className="w-24" >
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
        </>
      )}

      {/* CREAR PLANTILLA */}
      {isCreating && (
        <div className="space-y-4">
          <div
            className="flex items-center gap-2 text-sm text-muted-foreground mb-4 cursor-pointer"
            onClick={() => setIsCreating(false)}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver a Plantillas</span>
          </div>

          <CreatePlantillaPage
            onSuccess={() => {
              loadPlantillas();
              setIsCreating(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
