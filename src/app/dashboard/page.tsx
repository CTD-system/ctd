import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { FileText, Folder, File, FileStack } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Expedientes",
      value: "0",
      description: "Total de expedientes",
      icon: Folder,
      color: "text-blue-600",
    },
    {
      title: "Módulos",
      value: "0",
      description: "Módulos activos",
      icon: FileStack,
      color: "text-green-600",
    },
    {
      title: "Documentos",
      value: "0",
      description: "Documentos totales",
      icon: File,
      color: "text-purple-600",
    },
    {
      title: "Plantillas",
      value: "0",
      description: "Plantillas disponibles",
      icon: FileText,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Bienvenido al sistema de gestión CTD</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground text-center py-8">No hay actividad reciente</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>Funciones más utilizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                <Folder className="h-4 w-4 text-primary" />
                <span className="text-sm">Crear nuevo expediente</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                <File className="h-4 w-4 text-primary" />
                <span className="text-sm">Subir documento</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm">Usar plantilla</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
