"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Badge } from "@/src/components/ui/badge"
import { ModuloEstado, type Modulo } from "@/src/lib/modulos"

interface ViewModuloDialogProps {
  modulo: Modulo
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Espera que el backend o la llamada que obtiene el módulo incluya
 * una propiedad opcional `submodulos` (array de módulos hijos)
 * Ejemplo:
 * modulo.submodulos = [{ id, titulo }, { id, titulo }]
 */

export function ViewModuloDialog({ modulo, open, onOpenChange }: ViewModuloDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{modulo.titulo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Estado</label>
            <div className="mt-1">
              <Badge
                variant={
                  modulo.estado === ModuloEstado.BORRADOR
                    ? "default"
                    : modulo.estado === ModuloEstado.EN_REVISION
                      ? "secondary"
                      : "outline"
                }
              >
                {modulo.estado}
              </Badge>
            </div>
          </div>

          {/* Descripción */}
          {modulo.descripcion && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Descripción</label>
              <p className="text-base mt-1">{modulo.descripcion}</p>
            </div>
          )}

          {/* Ruta */}
          {modulo.ruta && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ruta</label>
              <p className="text-sm font-mono mt-1">{modulo.ruta}</p>
            </div>
          )}

          {/* Archivos relacionados */}
          {(modulo.indice_word_nombre || modulo.referencias_word_nombre) && (
            <div className="grid grid-cols-2 gap-4">
              {modulo.indice_word_nombre && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Índice Word</label>
                  <p className="text-base mt-1">{modulo.indice_word_nombre}</p>
                </div>
              )}
              {modulo.referencias_word_nombre && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Referencias Word</label>
                  <p className="text-base mt-1">{modulo.referencias_word_nombre}</p>
                </div>
              )}
            </div>
          )}

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de creación</label>
              <p className="text-base mt-1">{new Date(modulo.creado_en).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Última actualización</label>
              <p className="text-base mt-1">{new Date(modulo.actualizado_en).toLocaleString()}</p>
            </div>
          </div>

          {/* Expediente */}
          {modulo.expediente && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expediente</label>
              <p className="text-base mt-1">
                {modulo.expediente.nombre} ({modulo.expediente.codigo})
              </p>
            </div>
          )}

          {/* Módulo contenedor */}
          {modulo.moduloContenedor && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Módulo Contenedor</label>
              <p className="text-base mt-1">{modulo.moduloContenedor.titulo}</p>
            </div>
          )}

          {/* Submódulos */}
          {modulo.submodulos && modulo.submodulos.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Submódulos</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {modulo.submodulos.map((sub) => (
                  <Badge key={sub.id} variant="outline" className="px-3 py-1 text-sm">
                    {sub.titulo}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
