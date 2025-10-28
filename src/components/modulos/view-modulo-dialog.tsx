"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Badge } from "@/src/components/ui/badge"
import { ModuloEstado, type Modulo } from "@/src/lib/modulos"

interface ViewModuloDialogProps {
  modulo: Modulo
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewModuloDialog({ modulo, open, onOpenChange }: ViewModuloDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles del Módulo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Número</label>
              <p className="text-base">{modulo.numero}</p>
            </div>
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
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Título</label>
            <p className="text-base">{modulo.titulo}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Descripción</label>
            <p className="text-base">{modulo.descripcion}</p>
          </div>
          {modulo.ruta && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ruta</label>
              <p className="text-base font-mono text-sm">{modulo.ruta}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {modulo.indice_word_nombre && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Índice Word</label>
                <p className="text-base">{modulo.indice_word_nombre}</p>
              </div>
            )}
            {modulo.referencias_word_nombre && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Referencias Word</label>
                <p className="text-base">{modulo.referencias_word_nombre}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
              <p className="text-base">{new Date(modulo.creado_en).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
              <p className="text-base">{new Date(modulo.actualizado_en).toLocaleString()}</p>
            </div>
          </div>
          {modulo.expediente && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expediente</label>
              <p className="text-base">
                {modulo.expediente.nombre} ({modulo.expediente.codigo})
              </p>
            </div>
          )}
          {modulo.moduloContenedor && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Módulo Contenedor</label>
              <p className="text-base">{modulo.moduloContenedor.titulo}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
