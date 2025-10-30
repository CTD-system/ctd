"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { ChevronDown } from "lucide-react"
import { type Expediente } from "@/src/lib/expedientes"
import { type Modulo } from "@/src/lib/modulos"
import { useId, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ViewExpedienteDialogProps {
  expediente: Expediente & { modulos?: Modulo[] }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewExpedienteDialog({ expediente, open, onOpenChange }: ViewExpedienteDialogProps) {
  // 🔹 Primero identificamos qué módulos son contenedores
  const containerIds = new Set(
    (expediente.modulos ?? [])
      .map((m) => m.moduloContenedor?.id)
      .filter((id): id is string => Boolean(id))
  )

  // 🔹 Agrupamos, excluyendo los módulos que son contenedores de otros
  const grouped = (() => {
    const map = new Map<string, Modulo[]>()
    const noContainerKey = "__no_container__"

    ;(expediente.modulos ?? []).forEach((m: Modulo) => {
      // Si este módulo es un contenedor, no lo agregamos como elemento de grupo
      if (containerIds.has(m.id)) return

      const container = m.moduloContenedor
      const key = container ? `${container.id}::${container.titulo}` : noContainerKey
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    })

    return { map, noContainerKey }
  })()

  const id = useId()
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())
  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) newSet.delete(key)
      else newSet.add(key)
      return newSet
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-6 space-y-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">📁 Detalles del Expediente</DialogTitle>
        </DialogHeader>

        {/* Información general */}
        <Card className="border-none shadow-sm">
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Código" value={expediente.codigo} />
              <Info label="Nombre" value={expediente.nombre} />
              <Info label="Descripción" value={expediente.descripcion ?? "—"} />
              <Info
                label="Estado"
                value={
                  <Badge
                    variant={
                      expediente.estado === "aprobado"
                        ? "default"
                        : expediente.estado === "en_revision"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {expediente.estado}
                  </Badge>
                }
              />
              <Info
                label="Creado Por"
                value={
                  <>
                    {expediente.creado_por?.username ?? "—"}{" "}
                    <span className="text-muted-foreground">
                      ({expediente.creado_por?.email ?? "—"})
                    </span>
                  </>
                }
              />
              <Info
                label="Fecha Creación"
                value={new Date(expediente.creado_en).toLocaleString()}
              />
              <Info
                label="Última Actualización"
                value={new Date(expediente.actualizado_en).toLocaleString()}
              />
            </div>
          </CardContent>
        </Card>

        {/* 🔹 Sección de módulos */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Módulos asignados</h3>

          {Array.isArray(expediente.modulos) && expediente.modulos.length > 0 ? (
            <div className="space-y-3">
              {/* Módulos sin contenedor */}
              {grouped.map.has(grouped.noContainerKey) && (
                <div className="flex flex-wrap gap-2">
                  {(grouped.map.get(grouped.noContainerKey) ?? []).map((m) => (
                    <Chip key={m.id} label={m.titulo} tooltip={m.descripcion} color="primary" />
                  ))}
                </div>
              )}

              {/* Contenedores agrupadores */}
              {[...grouped.map.entries()]
                .filter(([key]) => key !== grouped.noContainerKey)
                .map(([key, mods]) => {
                  const [, containerTitle] = key.split("::")
                  const isOpen = openGroups.has(key)

                  return (
                    <div
                      key={key}
                      className="border border-muted rounded-lg p-3 bg-muted/10 transition hover:bg-muted/20"
                    >
                      <button
                        onClick={() => toggleGroup(key)}
                        className="flex items-center justify-between w-full cursor-pointer select-none"
                        aria-expanded={isOpen}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Chip label={containerTitle} color="secondary" />
                          <span className="text-xs text-muted-foreground">({mods.length})</span>
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden mt-3"
                          >
                            <div className="flex flex-wrap gap-2">
                              {mods.map((m) => (
                                <Chip key={m.id} label={m.titulo} tooltip={m.descripcion} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No tiene módulos asignados</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <div className="text-sm text-foreground font-medium">{value}</div>
    </div>
  )
}

function Chip({
  label,
  tooltip,
  color = "gray",
}: {
  label: string
  tooltip?: string
  color?: "primary" | "secondary" | "gray"
}) {
  const colors = {
    primary:
      "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20",
    secondary:
      "bg-secondary/10 text-secondary-foreground border border-secondary/20 hover:bg-secondary/20",
    gray: "bg-muted text-foreground border border-muted-foreground/10 hover:bg-muted/80",
  }

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition ${colors[color]}`}
    >
      {label}
    </span>
  )
}
