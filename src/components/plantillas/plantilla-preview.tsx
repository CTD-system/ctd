"use client";

import { Bloque, Plantilla } from "@/src/lib/plantillas";
import type React from "react";
import { Card, CardContent } from "../ui/card";

interface PlantillaPreviewProps {
  estructura?: {
    tipo: "documento";
    titulo?: string;
    bloques: Bloque[];
  };

  fuente?: string;
  tamanoFuente?: number;
  colorTexto?: string;
  encabezado?: string;
  piePagina?: string;
}

export function PlantillaPreview({
  estructura,
  fuente = "Arial",
  tamanoFuente = 12,
  colorTexto = "#000000",
  encabezado,
  piePagina,
}: PlantillaPreviewProps) {
  console.log(estructura);

  const renderBloque = (
    bloque: Bloque,
    index: number,
    nivel = 0
  ): React.ReactNode => {
    // Guard para bloques nulos o sin tipo
    if (!bloque || !bloque.tipo) {
      console.warn("Bloque nulo o sin tipo detectado en preview, índice:", index, bloque);
      return (
        <div key={index} className="p-3 border border-red-300 rounded bg-red-50">
          <p className="text-red-700 font-semibold">⚠️ Error: Bloque corrupto</p>
        </div>
      );
    }

    switch (bloque.tipo) {
      case "capitulo":
        return (
          <div
            key={index}
            className="mb-6"
            style={{ marginLeft: `${nivel * 20}px` }}
          >
            {bloque.titulo && (
              <h2
                className="text-2xl font-bold mb-3"
                style={{ color: colorTexto }}
              >
                {bloque.titulo}
              </h2>
            )}
            {bloque.bloques?.map((subBloque, subIndex) =>
              renderBloque(subBloque, subIndex, nivel + 1)
            )}
          </div>
        );

      case "subcapitulo":
        return (
          <div
            key={index}
            className="mb-4"
            style={{ marginLeft: `${nivel * 20}px` }}
          >
            {bloque.titulo && (
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: colorTexto }}
              >
                {bloque.titulo}
              </h3>
            )}
            {bloque.bloques?.map((subBloque, subIndex) =>
              renderBloque(subBloque, subIndex, nivel + 1)
            )}
          </div>
        );

      case "parrafo":
        return (
          <div
            key={index}
            className="mb-3 leading-relaxed"
            style={{
              fontFamily: fuente,
              fontSize: `${tamanoFuente}px`,
              color: colorTexto,
              marginLeft: `${nivel * 20}px`,
            }}
          >
            {/* Si existe texto HTML, se muestra con formato */}
            {bloque.texto_html ? (
              <div
                className="whitespace-pre-wrap wrap-break-word"
                dangerouslySetInnerHTML={{ __html: bloque.texto_html }}
              />
            ) : (
              <p>{bloque.texto_plano || ""}</p>
            )}
          </div>
        );

      case "tabla":
        return (
          <div
            key={index}
            className="mb-4 overflow-x-auto"
            style={{ marginLeft: `${nivel * 20}px` }}
          >
            <table className="min-w-full border border-gray-300">
              {/* ENCABEZADOS */}
              {Array.isArray(bloque.encabezados) &&
                bloque.encabezados.length > 0 && (
                  <thead className="bg-gray-100">
                    {(() => {
                      // Detectar si hay algún encabezado con colSpan > 1
                      const tieneColSpan = bloque.encabezados.some(
                        (encabezado: any) => encabezado?.colSpan > 1
                      );

                      if (tieneColSpan) {
                        // Separar el encabezado con colSpan > 1 (superior)
                        const filaSuperior = bloque.encabezados.filter(
                          (encabezado: any) => encabezado?.colSpan > 1
                        );
                        // Los demás encabezados van en la fila inferior
                        const filaInferior = bloque.encabezados.filter(
                          (encabezado: any) =>
                            !encabezado?.colSpan || encabezado.colSpan === 1
                        );

                        return (
                          <>
                            {/* Fila superior */}
                            <tr>
                              {filaSuperior.map(
                                (encabezado: any, i: number) => (
                                  <th
                                    key={`top-${i}`}
                                    colSpan={encabezado.colSpan || 1}
                                    rowSpan={encabezado.rowSpan || 1}
                                    className="border border-gray-300 px-4 py-2 text-center font-bold bg-gray-200"
                                    style={{ color: colorTexto }}
                                  >
                                    {encabezado.text}
                                  </th>
                                )
                              )}
                            </tr>
                            {/* Fila inferior */}
                            <tr>
                              {filaInferior.map(
                                (encabezado: any, i: number) => (
                                  <th
                                    key={`bottom-${i}`}
                                    colSpan={encabezado.colSpan || 1}
                                    rowSpan={encabezado.rowSpan || 1}
                                    className="border border-gray-300 px-4 py-2 text-left font-semibold"
                                    style={{ color: colorTexto }}
                                  >
                                    {encabezado.text}
                                  </th>
                                )
                              )}
                            </tr>
                          </>
                        );
                      }

                      // Caso normal: todos los encabezados en una sola fila
                      return (
                        <tr>
                          {bloque.encabezados.map(
                            (encabezado: any, i: number) => (
                              <th
                                key={i}
                                colSpan={encabezado.colSpan || 1}
                                rowSpan={encabezado.rowSpan || 1}
                                className="border border-gray-300 px-4 py-2 text-left font-semibold"
                                style={{ color: colorTexto }}
                              >
                                {encabezado.text}
                              </th>
                            )
                          )}
                        </tr>
                      );
                    })()}
                  </thead>
                )}

              {/* FILAS */}
              <tbody>
                {Array.isArray(bloque.filas) &&
                  bloque.filas.map((fila: any[], i: number) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {fila.map((celda: any, j: number) => {
                        // Si la celda contiene una subtabla
                        if (celda?.tipo === "tabla_anidada" && celda.tabla) {
                          return (
                            <td
                              key={j}
                              colSpan={celda.colSpan || 1}
                              rowSpan={celda.rowSpan || 1}
                              className="border border-gray-300 px-4 py-2"
                            >
                              {/* Renderizado recursivo de la subtabla */}
                              {renderBloque(
                                celda.tabla as Bloque,
                                j,
                                nivel + 1
                              )}
                            </td>
                          );
                        }

                        // Si la celda es un objeto normal con texto
                        if (typeof celda === "object" && celda !== null) {
                          const { text, colSpan, rowSpan } = celda;
                          return (
                            <td
                              key={j}
                              colSpan={colSpan || 1}
                              rowSpan={rowSpan || 1}
                              className="border border-gray-300 px-4 py-2 "
                              style={{
                                fontFamily: fuente,
                                fontSize: `${tamanoFuente}px`,
                                color: colorTexto,
                              }}
                            >
                              {typeof text === "string" ||
                              typeof text === "number"
                                ? text
                                : JSON.stringify(text)}
                            </td>
                          );
                        }

                        // Si la celda es texto plano
                        return (
                          <td
                            key={j}
                            className="border border-gray-300 px-4 py-2"
                            style={{
                              fontFamily: fuente,
                              fontSize: `${tamanoFuente}px`,
                              color: colorTexto,
                            }}
                          >
                            {typeof celda === "string" ||
                            typeof celda === "number"
                              ? celda
                              : JSON.stringify(celda)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        );

      case "imagen":
        // Detectar si la imagen es EMF
        const isEMF =
          bloque.src?.startsWith("data:image/x-emf") ||
          bloque.src?.endsWith(".emf");

        if (isEMF) {
          return (
            <div
              key={index}
              className="mb-4 p-3 border border-red-300 rounded bg-red-50"
              style={{ marginLeft: `${nivel * 20}px` }}
            >
              <p className="text-red-700 font-semibold">
                ⚠️ Imagen EMF no soportada en el navegador
              </p>
              <p className="text-sm text-red-600">
                La imagen "{bloque.alt || "sin nombre"}" no se muestra porque es
                un archivo EMF, formato vectorial de Windows que no se puede
                renderizar en web.
              </p>
            </div>
          );
        }

        // Renderizar normalmente si no es EMF
        const imgSrc = bloque.src?.startsWith("data:")
          ? base64ToUrl(bloque.src)
          : bloque.src || "/placeholder.svg";

        return (
          <div
            key={index}
            className="mb-4 overflow-x-auto"
            style={{ marginLeft: `${nivel * 20}px` }}
          >
            <div className="inline-block border border-gray-300 rounded p-1 bg-white">
              <img
                src={imgSrc}
                alt={bloque.alt || "Imagen"}
                className="max-w-full max-h-[500px] object-contain rounded"
              />
            </div>
            {bloque.alt && (
              <p className="text-sm text-gray-600 mt-1 italic">{bloque.alt}</p>
            )}
          </div>
        );

      case "placeholder":
        return (
          <div
            key={index}
            className="mb-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded"
            style={{ marginLeft: `${nivel * 20}px` }}
          >
            <p className="font-mono text-sm text-yellow-800">
              {"{{" + bloque.clave + "}}"}
            </p>
            {bloque.descripcion && (
              <p className="text-xs text-yellow-600 mt-1">
                {bloque.descripcion}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!estructura || !estructura.bloques || estructura.bloques.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">
            No hay estructura definida para previsualizar
          </p>
        </CardContent>
      </Card>
    );
  }

  const base64ToUrl = (base64: string) => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    const blob = new Blob([u8arr], { type: mime });
    return URL.createObjectURL(blob);
  };

  return (
    <Card className="w-xl">
      <CardContent className="p-6">
        {/* Título del documento */}
        {estructura.titulo && (
          <h1
            className="text-3xl font-bold mb-6 text-center"
            style={{ color: colorTexto }}
          >
            {estructura.titulo}
          </h1>
        )}

        {/* Bloques del documento */}
        <div className="space-y-2 ">
          {estructura.bloques.map((bloque, index) =>
            renderBloque(bloque, index)
          )}
        </div>
      </CardContent>
    </Card>
  );
}
