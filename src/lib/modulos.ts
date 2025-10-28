import apiClient from "./api-client"
import type { Expediente } from "./expedientes"

export enum ModuloEstado {
  BORRADOR = "borrador",
  EN_REVISION = "en_revision",
  COMPLETADO = "completado",
}

export interface Modulo {
  id: string
  expediente: Expediente
  moduloContenedor?: Modulo
  submodulos: Modulo[]
  numero: number
  titulo: string
  descripcion: string
  estado: ModuloEstado
  creado_en: string
  actualizado_en: string
  indice_word_nombre?: string
  indice_word_ruta?: string
  ruta: string
  referencias_word_nombre?: string
  referencias_word_ruta?: string
}

export interface CreateModuloData {
  expediente_id: string
  moduloContenedor_id?: string
  numero: number
  titulo: string
  descripcion: string
  estado: ModuloEstado
  ruta: string
}

export interface UpdateModuloData {
  expediente_id?: string
  moduloContenedor_id?: string
  numero?: number
  titulo?: string
  descripcion?: string
  estado?: ModuloEstado
  ruta?: string
  indice_word_nombre?: string
  indice_word_ruta?: string
  referencias_word_nombre?: string
  referencias_word_ruta?: string
}

export const modulosService = {
  async getAll(): Promise<Modulo[]> {
    const response = await apiClient.get("/modulos")
    return response.data.modulos
  },

  async getById(id: string): Promise<Modulo> {
    const response = await apiClient.get(`/modulos/${id}`)
    return response.data
  },

  async create(data: CreateModuloData): Promise<Modulo> {
    const response = await apiClient.post("/modulos", data)
    return response.data
  },

  async update(id: string, data: UpdateModuloData): Promise<Modulo> {
    const response = await apiClient.put(`/modulos/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/modulos/${id}`)
  },
}
