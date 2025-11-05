'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Folder, FileStack, File, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { expedientesService } from "@/src/lib/expedientes"
import { modulosService } from "@/src/lib/modulos"
import { documentosService } from "@/src/lib/documentos"
import { plantillasService } from "@/src/lib/plantillas"

export default function DashboardPage() {
  const [expedientes, setExpedientes] = useState<any[]>([])
  const [modulos, setModulos] = useState<any[]>([])
  const [documentos, setDocumentos] = useState<any[]>([])
  const [plantillas, setPlantillas] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const exp = await expedientesService.getAll()
      setExpedientes(exp)
      const mods = await modulosService.getAll()
      setModulos(mods)
      const docs = await documentosService.getAll()
      setDocumentos(docs)
      const plats = await plantillasService.getAll()
      setPlantillas(plats)
    }
    fetchData()
  }, [])

  // Totales
  const totalExpedientes = expedientes.length
  const totalModulos = modulos.length
  const totalDocumentos = documentos.length
  const totalPlantillas = plantillas.length

  // Expedientes por estado
  const expedientesPorEstado: Record<string, number> = expedientes.reduce((acc, e) => {
    acc[e.estado] = (acc[e.estado] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Módulos por estado
  const modulosPorEstado: Record<string, number> = modulos.reduce((acc, m) => {
    acc[m.estado] = (acc[m.estado] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Documentos por tipo
  const documentosPorTipo: Record<string, number> = documentos.reduce((acc, d) => {
    acc[d.tipo] = (acc[d.tipo] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const stats = [
    { title: "Expedientes", value: totalExpedientes, icon: Folder, color: "text-blue-600", description: "Total de expedientes" },
    { title: "Módulos", value: totalModulos, icon: FileStack, color: "text-green-600", description: "Total de módulos" },
    { title: "Documentos", value: totalDocumentos, icon: File, color: "text-purple-600", description: "Total de documentos" },
    { title: "Plantillas", value: totalPlantillas, icon: FileText, color: "text-orange-600", description: "Total de plantillas" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Bienvenido al sistema de gestión CTD</p>
      </div>

      {/* Totales */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Cards por estado o tipo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Expedientes por Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {Object.entries(expedientesPorEstado).map(([estado, count]) => (
              <div key={estado} className="flex justify-between">
                <span>{estado}</span>
                <span>{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Módulos por Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {Object.entries(modulosPorEstado).map(([estado, count]) => (
              <div key={estado} className="flex justify-between">
                <span>{estado}</span>
                <span>{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentos por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {Object.entries(documentosPorTipo).map(([tipo, count]) => (
              <div key={tipo} className="flex justify-between">
                <span>{tipo}</span>
                <span>{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
