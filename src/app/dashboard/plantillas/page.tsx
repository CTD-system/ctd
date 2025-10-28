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

export default function PlantillasPage() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
        description: error.response?.data?.message || "Error al cargar plantillas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar toda la plantilla con estructura para edición
  const loadPlantillaForEdit = async (id: string) => {
    try {
      setIsLoading(true);
      const plantilla = await plantillasService.getById(id);
      setEditingPlantilla(plantilla);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al cargar la plantilla",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlantillas();
  }, []);

  const filteredPlantillas = plantillas.filter((plantilla) =>
    plantilla.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Si estamos editando, mostrar el editor completo
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

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar plantillas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <PlantillasList
            plantillas={filteredPlantillas}
            isLoading={isLoading}
            onUpdate={loadPlantillas}
            onEdit={(id: string) => loadPlantillaForEdit(id)} // <- Aquí usamos getById
          />
        </>
      )}

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
