"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Badge } from "@/src/components/ui/badge"
import { ExpedienteEstado, type Expediente } from "@/src/lib/expedientes"

interface ViewExpedienteDialogProps {
  expediente: Expediente
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewExpedienteDialog({ expediente, open, onOpenChange }: ViewExpedienteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles del Expediente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Código</label>
              <p className="text-base">{expediente.codigo}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <div className="mt-1">
                <Badge
                  variant={
                    expediente.estado === ExpedienteEstado.APROBADO
                      ? "default"
                      : expediente.estado === ExpedienteEstado.EN_REVISION
                        ? "secondary"
                        : "outline"
                  }
                >
                  {expediente.estado}
                </Badge>
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nombre</label>
            <p className="text-base">{expediente.nombre}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Descripción</label>
            <p className="text-base">{expediente.descripcion}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
              <p className="text-base">{new Date(expediente.creado_en).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
              <p className="text-base">{new Date(expediente.actualizado_en).toLocaleString()}</p>
            </div>
          </div>
          {expediente.creado_por && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Creado Por</label>
              <p className="text-base">
                {expediente.creado_por.username} ({expediente.creado_por.email})
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
