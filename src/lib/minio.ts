import apiClient from "./api-client"

export interface MinioUploadResponse {
  message: string
  data: any
}

export const minioService = {
  // Subir expediente ZIP
  async uploadExpediente(file: File): Promise<MinioUploadResponse> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.post("/minio-upload/expediente", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Subir módulo ZIP
  async uploadModulo(file: File, expedienteId?: string): Promise<MinioUploadResponse> {
    const formData = new FormData()
    formData.append("file", file)
    if (expedienteId) {
      formData.append("expedienteId", expedienteId)
    }

    const response = await apiClient.post("/minio-upload/modulo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Subir documentos (múltiples archivos con tipos)
  async uploadDocumentos(files: File[], tipos?: string[]): Promise<MinioUploadResponse> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })

    if (tipos && tipos.length > 0) {
      tipos.forEach((tipo) => {
        formData.append("tipos", tipo)
      })
    }

    const response = await apiClient.post("/minio-upload/documento", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Descargar expediente ZIP
  async downloadExpediente(filename: string): Promise<void> {
    const response = await apiClient.get(`/minio-download/expediente/${filename}`, {
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

  // Descargar módulo ZIP
  async downloadModulo(filename: string): Promise<void> {
    const response = await apiClient.get(`/minio-download/modulo/${filename}`, {
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

  // Descargar documento individual
  async downloadDocumento(filename: string): Promise<void> {
    const response = await apiClient.get(`/minio-download/documento/${filename}`, {
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

  // Descargar expediente completo como ZIP
  async downloadExpedienteCompleto(expedienteId: string): Promise<void> {
    const response = await apiClient.get(`/minio-download/expediente-zip/${expedienteId}`, {
      responseType: "blob",
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `expediente_${expedienteId}.zip`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
