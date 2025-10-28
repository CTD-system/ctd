import apiClient from "./api-client"
import type { Usuario } from "./usuarios"

export enum ExpedienteEstado {
  BORRADOR = "borrador",
  EN_REVISION = "en_revision",
  APROBADO = "aprobado",
  ENVIADO = "enviado",
}

export interface Expediente {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  estado: ExpedienteEstado
  creado_por: Usuario
  creado_en: string
  actualizado_en: string
}

export interface CreateExpedienteData {
  codigo: string
  nombre: string
  descripcion: string
  estado: ExpedienteEstado
}

export interface UpdateExpedienteData {
  codigo?: string
  nombre?: string
  descripcion?: string
  estado?: ExpedienteEstado
}

export const expedientesService = {
  async getAll(): Promise<Expediente[]> {
    const response = await apiClient.get("/expedientes")
    return response.data
  },

  async getById(id: string): Promise<Expediente> {
    const response = await apiClient.get(`/expedientes/${id}`)
    return response.data
  },

  async create(data: CreateExpedienteData): Promise<Expediente> {
    const response = await apiClient.post("/expedientes", data)
    return response.data
  },

  async update(id: string, data: UpdateExpedienteData): Promise<Expediente> {
    const response = await apiClient.put(`/expedientes/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/expedientes/${id}`)
  },
}
