import apiClient from "./api-client"
import type { Usuario } from "./usuarios"

export type Bloque =
  | {
      tipo: "capitulo" | "subcapitulo"
      titulo: string
      bloques?: Bloque[]
    }
  | {
      tipo: "parrafo"
      texto_html: string
      texto_plano:string
    }
  | {
      tipo: "tabla"
      encabezados: string[]
      filas: string[][]
    }
  | {
      tipo: "imagen"
      src: string
      alt?: string
    }
  | {
      tipo: "placeholder"
      clave: string
      descripcion?: string
    }

export interface EstiloPersonalizado {
  nombre: string
  fuente?: string
  tamano_fuente?: number
  color?: string
  negrita?: boolean
  cursiva?: boolean
}

export interface Plantilla {
  id: string
  nombre: string
  descripcion: string
  tipo_archivo?: string
  creado_por: Usuario
  creado_en: string
  titulo?: string
  encabezado?: string
  pie_pagina?: string
  fuente: string
  tamano_fuente: number
  color_texto: string
  autogenerar_indice: boolean
  estructura?: {
    tipo: "documento"
    titulo?: string
    bloques: Bloque[]
  }
  estilos_detectados?: {
    nombres_estilos?: string[]
    estilos_personalizados?: EstiloPersonalizado[]
  }
}

export interface CreatePlantillaData {
  nombre: string
  descripcion: string
  tipo_archivo?: string
  titulo?: string
  encabezado?: string
  pie_pagina?: string
  fuente?: string
  tamano_fuente?: number
  color_texto?: string
  autogenerar_indice?: boolean
  estructura?: {
    tipo: "documento"
    titulo?: string
    bloques: Bloque[]
  }
}

export interface UpdatePlantillaData {
  nombre?: string
  descripcion?: string
  tipo_archivo?: string
  titulo?: string
  encabezado?: string
  pie_pagina?: string
  fuente?: string
  tamano_fuente?: number
  color_texto?: string
  autogenerar_indice?: boolean
  estructura?: {
    tipo: "documento"
    titulo?: string
    bloques: Bloque[]
  }
}

export const plantillasService = {
  async getAll(): Promise<Plantilla[]> {
    const response = await apiClient.get("/plantillas")
    return response.data
  },

  async getById(id: string): Promise<Plantilla> {
    const response = await apiClient.get(`/plantillas/${id}`)
    return response.data
  },

  async create(data: CreatePlantillaData): Promise<Plantilla> {
    const response = await apiClient.post("/plantillas", data)
    return response.data
  },

  async update(id: string, data: UpdatePlantillaData): Promise<Plantilla> {
    const response = await apiClient.patch(`/plantillas/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/plantillas/${id}`)
  },

  async duplicate(id: string): Promise<Plantilla> {
    const response = await apiClient.post(`/plantillas/${id}/duplicate`)
    return response.data
  },
}
