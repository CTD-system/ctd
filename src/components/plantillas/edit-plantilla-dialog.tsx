"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  plantillasService,
  type Plantilla,
  type Bloque,
} from "@/src/lib/plantillas";
import { useToast } from "@/src/hooks/use-toast";

interface EditPlantillaPageProps {
  plantilla: Plantilla;
  onSuccess: () => void;
}

export function EditPlantillaPage({
  plantilla,
  onSuccess,
}: EditPlantillaPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
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
    estructura: { tipo: "documento" as const, bloques: [] as Bloque[] },
  });
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      nombre: plantilla.nombre,
      descripcion: plantilla.descripcion,
      tipo_archivo: plantilla.tipo_archivo ?? "WORD",
      titulo: plantilla.titulo ?? "",
      encabezado: plantilla.encabezado ?? "",
      pie_pagina: plantilla.pie_pagina ?? "",
      fuente: plantilla.fuente ?? "Arial",
      tamano_fuente: plantilla.tamano_fuente ?? 12,
      color_texto: plantilla.color_texto ?? "#000000",
      autogenerar_indice: plantilla.autogenerar_indice ?? false,
      estructura: plantilla.estructura ?? { tipo: "documento", bloques: [] },
    });
  }, [plantilla]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await plantillasService.update(plantilla.id, formData);
      toast({
        title: "Plantilla actualizada",
        description: "La plantilla ha sido actualizada correctamente",
        variant: "success",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Error al actualizar plantilla",
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

  const eliminarFilaTabla = (
    bloque: Bloque,
    filaIndex: number,
    bloqueIndex: number
  ) => {
    if (bloque.tipo !== "tabla") return;
    const nuevasFilas = bloque.filas.filter((_, i) => i !== filaIndex);
    actualizarBloque(bloqueIndex, { ...bloque, filas: nuevasFilas });
  };

  const eliminarColumnaTabla = (
    bloque: Bloque,
    columnaIndex: number,
    bloqueIndex: number
  ) => {
    if (bloque.tipo !== "tabla") return;
    const nuevosEncabezados = bloque.encabezados.filter(
      (_, i) => i !== columnaIndex
    );
    const nuevasFilas = bloque.filas.map((fila) =>
      fila.filter((_, i) => i !== columnaIndex)
    );
    actualizarBloque(bloqueIndex, {
      ...bloque,
      encabezados: nuevosEncabezados,
      filas: nuevasFilas,
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
    const numColumnas = bloque.encabezados.length || 1;
    const nuevaFila = Array(numColumnas).fill("");
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

  const renderTablaEditable = (bloque: Bloque, index: number, nivel = 0) => {
    
  const tieneColumnas = bloque.tipo==='tabla'? bloque.encabezados.length > 0: null;
 if(bloque.tipo==='tabla') return (
    <div
      className="mb-4 overflow-x-auto"
      style={{ marginLeft: `${nivel * 20}px` }}
    >
      <div className="flex gap-2 mb-2">
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => agregarFilaTabla(index)}
          disabled={!tieneColumnas} // deshabilitado si no hay columnas
        >
          Agregar Fila
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => agregarColumnaTabla(bloque, index)}
        >
          Agregar Columna
        </Button>
      </div>

      {tieneColumnas ? (
        <table className="w-full border border-gray-300">
          <thead>
            <tr>
              {bloque.encabezados.map((enc: any, ci: number) => {
                const valorEncabezado =
                  typeof enc === "object" && enc !== null
                    ? enc.text ?? ""
                    : typeof enc === "string"
                    ? enc
                    : "";
                return (
                  <th key={ci} className="border p-2 relative">
                    <Input
                      className="w-full"
                      value={valorEncabezado}
                      onChange={(e) => {
                        const nuevosEncabezados = [...bloque.encabezados];
                        if (typeof enc === "object" && enc !== null) {
                          nuevosEncabezados[ci] = {
                            ...enc,
                            text: e.target.value,
                          };
                        } else {
                          nuevosEncabezados[ci] = e.target.value;
                        }
                        actualizarBloque(index, {
                          ...bloque,
                          encabezados: nuevosEncabezados,
                        });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => eliminarColumnaTabla(bloque, ci, index)}
                      className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                      title="Eliminar columna"
                    >
                      ✖
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {bloque.filas.length > 0 ? (
              bloque.filas.map((fila, ri) => (
                <tr key={ri}>
                  {fila.map((celda: any, ci) => {
                    const valorCelda =
                      typeof celda === "object" && celda !== null
                        ? celda.text ?? ""
                        : typeof celda === "string"
                        ? celda
                        : "";
                    return (
                      <td key={ci} className="border p-2">
                        <Input
                          className="w-full"
                          value={valorCelda}
                          onChange={(e) => {
                            let nuevoValor: any = e.target.value;
                            if (typeof celda === "object" && celda !== null) {
                              nuevoValor = { ...celda, text: e.target.value };
                            }
                            const nuevasFilas = bloque.filas.map((f, r) =>
                              r === ri
                                ? f.map((c, cIndex) =>
                                    cIndex === ci ? nuevoValor : c
                                  )
                                : f
                            );
                            actualizarBloque(index, {
                              ...bloque,
                              filas: nuevasFilas,
                            });
                          }}
                        />
                      </td>
                    );
                  })}
                  <td className="border p-2 w-10 text-center">
                    <button
                      type="button"
                      onClick={() => eliminarFilaTabla(bloque, ri, index)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar fila"
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={bloque.encabezados.length}
                  className="text-center text-gray-500 p-2"
                >
                  No hay filas en la tabla
                </td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-muted-foreground">
          La tabla no tiene columnas. Agrega al menos una columna para mostrarla.
        </p>
      )}
    </div>
  );
};


  const renderBloqueEditable = (
    bloque: Bloque,
    index: number,
    nivel = 0
  ): React.ReactNode => {
    return (
      <div
        key={index}
        className="border p-4 rounded bg-gray-50 space-y-2"
        style={{ marginLeft: `${nivel * 20}px` }}
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

        {bloque.tipo === "capitulo" || bloque.tipo === "subcapitulo" ? (
          <div className="space-y-3">
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
            {bloque.bloques?.map((subBloque, subIndex) =>
              renderBloqueEditable(subBloque, subIndex, nivel + 1)
            )}
          </div>
        ) : bloque.tipo === "parrafo" ? (
          <Textarea
            placeholder="Texto HTML"
            rows={3}
            value={bloque.texto_html}
            onChange={(e) =>
              actualizarBloque(index, {
                ...bloque,
                texto_html: e.target.value,
                texto_plano: e.target.value.replace(/<[^>]+>/g, ""),
              })
            }
            className="mb-3"
          />
        ) : bloque.tipo === "tabla" ? (
          renderTablaEditable(bloque, index, nivel)
        ) : bloque.tipo === "imagen" ? (
          <Input
            placeholder="URL de la imagen"
            value={bloque.src}
            onChange={(e) =>
              actualizarBloque(index, {
                ...bloque,
                src: e.target.value,
              } as Bloque)
            }
            className="mb-3"
          />
        ) : bloque.tipo === "placeholder" ? (
          <Input
            placeholder="Clave del placeholder"
            value={bloque.clave}
            onChange={(e) =>
              actualizarBloque(index, {
                ...bloque,
                clave: e.target.value,
              } as Bloque)
            }
            className="mb-3"
          />
        ) : null}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Editar Plantilla</h1>
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

        <div className="bg-white/80 p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold">Estructura de la Plantilla</h2>
          <div className="flex gap-2 flex-wrap mt-2 mb-4">
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
            {formData.estructura.bloques.map((bloque, index) =>
              renderBloqueEditable(bloque, index)
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => onSuccess()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
