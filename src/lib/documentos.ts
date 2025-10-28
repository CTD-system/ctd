import apiClient from "./api-client"
import type { Modulo } from "./modulos"
import type { Usuario } from "./usuarios"

export enum DocumentoTipo {
  PLANTILLA = "plantilla",
  ANEXO = "anexo",
  INFORME = "informe",
  OTRO = "otro",
}

export interface Documento {
  id: string
  modulo: Modulo
  nombre: string
  tipo: DocumentoTipo
  version: number
  ruta_archivo: string
  mime_type: string
  subido_por: Usuario
  subido_en: string
  actualizado_en: string
  anexos?: Documento[]
}

export interface CreateDocumentoData {
  modulo_id: string
  nombre: string
  tipo: DocumentoTipo
}

export interface UpdateDocumentoData {
  modulo_id?: string
  nombre?: string
  tipo?: DocumentoTipo
}

export const documentosService = {
  async getAll(): Promise<Documento[]> {
    const response = await apiClient.get("/documentos")
    return response.data
  },

  async getById(id: string): Promise<Documento> {
    const response = await apiClient.get(`/documentos/${id}`)
    return response.data
  },

  async upload(file: File, data: CreateDocumentoData): Promise<Documento> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("modulo_id", data.modulo_id)
    formData.append("nombre", data.nombre)
    formData.append("tipo", data.tipo)

    const response = await apiClient.post("/documentos/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  async update(id: string, data: UpdateDocumentoData): Promise<Documento> {
    const response = await apiClient.put(`/documentos/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/documentos/${id}`)
  },

  async download(id: string, filename: string): Promise<void> {
    const response = await apiClient.get(`/documentos/${id}/download`, {
      responseType: "blob",
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
