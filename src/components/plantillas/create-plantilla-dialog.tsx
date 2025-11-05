"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { plantillasService } from "@/src/lib/plantillas";
import { useToast } from "@/src/hooks/use-toast";
import { DropzoneImagen } from "./dropZoneImage";

export type Bloque =
  | { tipo: "capitulo" | "subcapitulo"; titulo: string; bloques?: Bloque[] }
  | { tipo: "parrafo"; texto_html: string; texto_plano: string }
  | { tipo: "tabla"; encabezados: string[]; filas: string[][] }
  | { tipo: "imagen"; src: string; alt?: string }
  | { tipo: "placeholder"; clave: string; descripcion?: string };

interface CreatePlantillaFormData {
  nombre: string;
  descripcion: string;
  tipo_archivo: string;
  titulo: string;
  encabezado: string;
  pie_pagina: string;
  fuente: string;
  tamano_fuente: number;
  color_texto: string;
  autogenerar_indice: boolean;
  estructura: {
    tipo: "documento";
    bloques: Bloque[];
  };
}

interface CreatePlantillaPageProps {
  onSuccess: () => void;
}

export function CreatePlantillaPage({ onSuccess }: CreatePlantillaPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePlantillaFormData>({
    nombre: "",
    descripcion: "",
    tipo_archivo: "WORD",
    titulo: "",
    encabezado: "",
    pie_pagina: "",
    fuente: "Arial",
    tamano_fuente: 12,
    color_texto: "#000000",
    autogenerar_indice: false,
    estructura: { tipo: "documento", bloques: [] },
  });
  

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.estructura.bloques.length === 0) {
  toast({
    title: "Estructura incompleta",
    description: "La plantilla debe tener al menos 1 bloque.",
    variant: "destructive",
  })
  setIsLoading(false)
  return
}

    const bloquesSanitizados = formData.estructura.bloques.map((b,i) => {
  switch(b.tipo) {

    case "capitulo":
    case "subcapitulo":
      return {
        ...b,
        titulo: b.titulo.trim() || `${b.tipo} ${i+1}`
      }

    case "parrafo":
      return {
        ...b,
        texto_html: b.texto_html.trim() || `(párrafo ${i+1})`,
        texto_plano: (b.texto_html.trim() || `(párrafo ${i+1})`).replace(/<[^>]+>/g,"")
      }

    case "imagen":
      return {
        ...b,
        // esto por si src quedó vacío
        alt: b.alt?.trim() || `imagen ${i+1}`
      }

    case "placeholder":
      return {
        ...b,
        clave: b.clave.trim() || `placeholder_${i+1}`
      }

    case "tabla":
      // si una tabla está totalmente vacía → al menos 1 columna y 1 fila default
      if (b.encabezados.length === 0) {
        return {
          ...b,
          encabezados: ["Columna 1"],
          filas: [[""]]
        }
      }
      return b
  }
})


 const payload = {
    ...formData,
    estructura: {
      ...formData.estructura,
      bloques: bloquesSanitizados
    }
  }

    try {
      

      await plantillasService.create(payload);
      toast({
        title: "Plantilla creada",
        description: "La plantilla ha sido creada correctamente",
        variant: "success",
      });
      onSuccess();
      setFormData({
        nombre: "",
        descripcion: "",
        tipo_archivo: "WORD",
        titulo: "",
        encabezado: "",
        pie_pagina: "",
        fuente: "Arial",
        tamano_fuente: 12,
        color_texto: "#000000",
        autogenerar_indice: false,
        estructura: { tipo: "documento", bloques: [] },
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Error al crear plantilla",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const agregarBloque = (tipo: Bloque["tipo"]) => {
    let nuevoBloque: Bloque;
    switch (tipo) {
      case "capitulo":
      case "subcapitulo":
        nuevoBloque = { tipo, titulo: "", bloques: [] };
        break;
      case "parrafo":
        nuevoBloque = { tipo, texto_html: "", texto_plano: "" };
        break;
      case "tabla":
        nuevoBloque = { tipo, encabezados: [], filas: [] };
        break;
      case "imagen":
        nuevoBloque = { tipo, src: "" };
        break;
      case "placeholder":
        nuevoBloque = { tipo, clave: "" };
        break;
    }
    setFormData({
      ...formData,
      estructura: {
        ...formData.estructura,
        bloques: [...formData.estructura.bloques, nuevoBloque],
      },
    });
  };

  const actualizarBloque = (index: number, bloqueActualizado: Bloque) => {
    const nuevosBloques = [...formData.estructura.bloques];
    nuevosBloques[index] = bloqueActualizado;
    setFormData({
      ...formData,
      estructura: { ...formData.estructura, bloques: nuevosBloques },
    });
  };

  const eliminarBloque = (index: number) => {
    const nuevosBloques = [...formData.estructura.bloques];
    nuevosBloques.splice(index, 1);
    setFormData({
      ...formData,
      estructura: { ...formData.estructura, bloques: nuevosBloques },
    });
  };

  const agregarFilaTabla = (indexBloque: number) => {
    const bloques = [...formData.estructura.bloques];
    const bloque = bloques[indexBloque];

    if (bloque.tipo !== "tabla") return;

    const numColumnas = bloque.encabezados.length || 1; // si no hay encabezados, 1 columna
    const nuevaFila = Array(numColumnas).fill(""); // celdas vacías

    bloque.filas.push(nuevaFila);
    actualizarBloque(indexBloque, bloque);
  };

  const agregarColumnaTabla = (bloque: Bloque, index: number) => {
    if (bloque.tipo === "tabla") {
      const nuevosEncabezados = [
        ...bloque.encabezados,
        `Columna ${bloque.encabezados.length + 1}`,
      ];
      const nuevasFilas = bloque.filas.map((fila) => [...fila, ""]);
      actualizarBloque(index, {
        ...bloque,
        encabezados: nuevosEncabezados,
        filas: nuevasFilas,
      });
    }
  };

  const eliminarFilaTabla = (
    bloque: Bloque,
    filaIndex: number,
    bloqueIndex: number
  ) => {
    if (bloque.tipo === "tabla") {
      const nuevasFilas = bloque.filas.filter((_, i) => i !== filaIndex);
      actualizarBloque(bloqueIndex, { ...bloque, filas: nuevasFilas });
    }
  };

  const eliminarColumnaTabla = (
    bloque: Bloque,
    colIndex: number,
    bloqueIndex: number
  ) => {
    if (bloque.tipo === "tabla") {
      const nuevosEncabezados = bloque.encabezados.filter(
        (_, i) => i !== colIndex
      );
      const nuevasFilas = bloque.filas.map((fila) =>
        fila.filter((_, i) => i !== colIndex)
      );
      actualizarBloque(bloqueIndex, {
        ...bloque,
        encabezados: nuevosEncabezados,
        filas: nuevasFilas,
      });
    }
  };

  const actualizarCeldaTabla = (
    bloque: Bloque,
    row: number,
    col: number,
    value: string,
    index: number
  ) => {
    if (bloque.tipo === "tabla") {
      const nuevasFilas = bloque.filas.map((fila, r) =>
        r === row ? fila.map((celda, c) => (c === col ? value : celda)) : fila
      );
      actualizarBloque(index, { ...bloque, filas: nuevasFilas });
    }
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Crear Nueva Plantilla
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Paper: Datos Generales */}
        <div className="bg-white shadow rounded p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Datos Generales</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="nombre">1. Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="descripcion">2. Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Estructura */}
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-bold mb-4">Estructura de la Plantilla</h2>
          <div className="flex gap-2 flex-wrap mb-4">
            {[
              "capitulo",
              "subcapitulo",
              "parrafo",
              "tabla",
              "imagen",
              "placeholder",
            ].map((tipo, i) => (
              <Button
                key={tipo}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => agregarBloque(tipo as Bloque["tipo"])}
              >
                {i + 1}. Agregar {tipo}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {formData.estructura.bloques.map((bloque, index) => (
              <div
                key={index}
                className="border p-4 rounded bg-gray-50 space-y-2"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">
                    {index + 1}. {bloque.tipo}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => eliminarBloque(index)}
                  >
                    X
                  </Button>
                </div>

                {/* Campos por tipo */}
                {(bloque.tipo === "capitulo" ||
                  bloque.tipo === "subcapitulo") && (
                  <Input
                    placeholder="Título"
                    value={bloque.titulo}
                    onChange={(e) =>
                      actualizarBloque(index, {
                        ...bloque,
                        titulo: e.target.value,
                      } as Bloque)
                    }
                  />
                )}
                {bloque.tipo === "parrafo" && (
                  <Textarea
                    placeholder="Texto"
                    rows={3}
                    value={bloque.texto_html}
                    onChange={(e) =>
                      actualizarBloque(index, {
                        ...bloque,
                        texto_html: e.target.value,
                        texto_plano: e.target.value.replace(/<[^>]+>/g, ""),
                      })
                    }
                  />
                )}
                {bloque.tipo === "imagen" && (
                  <DropzoneImagen
                    value={bloque.src}
                    onChange={(url) =>
                      actualizarBloque(index, { ...bloque, src: url } as Bloque)
                    }
                  />
                )}

                {bloque.tipo === "placeholder" && (
                  <Input
                    placeholder="Clave del placeholder"
                    value={bloque.clave}
                    onChange={(e) =>
                      actualizarBloque(index, {
                        ...bloque,
                        clave: e.target.value,
                      } as Bloque)
                    }
                  />
                )}
                {bloque.tipo === "tabla" && (
                  <div className="overflow-x-auto">
                    <div className="flex gap-2 mb-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => agregarFilaTabla(index)}
                        disabled={bloque.encabezados.length === 0} // no agregar fila si no hay columnas
                      >
                        Agregar Fila
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => agregarColumnaTabla(bloque, index)}
                      >
                        Agregar Columna
                      </Button>
                    </div>

                    {bloque.encabezados.length > 0 ? (
                      <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                        <thead>
                          <tr>
                            {bloque.encabezados.map(
                              (enc: any, colIndex: number) => (
                                <th
                                  key={colIndex}
                                  className="border p-1 border-gray-300 relative"
                                >
                                  <Input
                                    value={enc.text}
                                    onChange={(e) => {
                                      const nuevosEncabezados =
                                        bloque.encabezados.map(
                                          (h: any, i: number) =>
                                            i === colIndex
                                              ? { ...h, text: e.target.value }
                                              : h
                                        );
                                      actualizarBloque(index, {
                                        ...bloque,
                                        encabezados: nuevosEncabezados,
                                      });
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      eliminarColumnaTabla(
                                        bloque,
                                        colIndex,
                                        index
                                      )
                                    }
                                    className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                                    title="Eliminar columna"
                                  >
                                    ✖
                                  </button>
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {bloque.filas.map((fila, rowIndex) => (
                            <tr key={rowIndex}>
                              {fila.map((celda, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="border p-1 border-gray-300 relative"
                                >
                                  <Input
                                    value={celda}
                                    onChange={(e) =>
                                      actualizarCeldaTabla(
                                        bloque,
                                        rowIndex,
                                        colIndex,
                                        e.target.value,
                                        index
                                      )
                                    }
                                  />
                                </td>
                              ))}
                              <td className="border p-2 w-10 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    eliminarFilaTabla(bloque, rowIndex, index)
                                  }
                                  className="text-red-500 hover:text-red-700"
                                  title="Eliminar fila"
                                >
                                  ✖
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        La tabla no tiene columnas. Agrega al menos una columna
                        para mostrarla.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear Plantilla"}
          </Button>
          <Button type="button" variant="outline" onClick={() => onSuccess()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
