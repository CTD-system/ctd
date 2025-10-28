"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Badge } from "@/src/components/ui/badge"
import { DocumentoTipo, type Documento } from "@/src/lib/documentos"

interface ViewDocumentoDialogProps {
  documento: Documento
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewDocumentoDialog({ documento, open, onOpenChange }: ViewDocumentoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles del Documento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nombre</label>
            <p className="text-base">{documento.nombre}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo</label>
              <div className="mt-1">
                <Badge
                  variant={
                    documento.tipo === DocumentoTipo.PLANTILLA ? "default" : documento.tipo === DocumentoTipo.INFORME ? "secondary" : "outline"
                  }
                >
                  {documento.tipo}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Versión</label>
              <p className="text-base">{documento.version}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">MIME Type</label>
              <p className="text-base font-mono text-sm">{documento.mime_type ==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'? 'word':'otro'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ruta del Archivo</label>
              <p className="text-base font-mono text-sm truncate">{documento.ruta_archivo}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Subida</label>
              <p className="text-base">{new Date(documento.subido_en).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
              <p className="text-base">{new Date(documento.actualizado_en).toLocaleString()}</p>
            </div>
          </div>
          {documento.subido_por && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Subido Por</label>
              <p className="text-base">
                {documento.subido_por.username} ({documento.subido_por.email})
              </p>
            </div>
          )}
          {documento.modulo && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Módulo</label>
              <p className="text-base">
                {documento.modulo.titulo} (Módulo {documento.modulo.numero})
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
