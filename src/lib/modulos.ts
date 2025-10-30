import apiClient from "./api-client"
import { Documento } from "./documentos"
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
  documentos?: Documento[]
}

export interface CreateModuloData {
  expediente_id: string
  modulo_contenedor_id?: string
  titulo: string
  descripcion: string
  estado: ModuloEstado
  ruta: string
  crearIndiceWord: boolean,
    crearReferenciasWord: boolean,
}

export interface UpdateModuloData {
  titulo?: string
  descripcion?: string
  estado?: ModuloEstado
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
    const response = await apiClient.patch(`/modulos/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/modulos/${id}`)
  },

   async editarReferenciasWord(moduloId: string, referencias: string[]): Promise<{ message: string }> {
    const response = await apiClient.patch(`/modulos/${moduloId}/referencias`, { referencias })
    return response.data
  },

    async asignarDocumento(moduloId: string, documentoId: string): Promise<{ message: string; nuevaRuta: string }> {
    const response = await apiClient.post(`/modulos/${moduloId}/documentos/${documentoId}`)
    return response.data
  },

}
