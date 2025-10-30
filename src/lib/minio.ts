import apiClient from "./api-client";

export interface MinioUploadResponse {
  message: string;
  data: any;
}

export const minioService = {
  // Subir expediente ZIP
  async importarCTD(file: File): Promise<MinioUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      "/minio-upload/import-ctd",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Subir módulo ZIP
  // Subir módulo ZIP
  async uploadModulo(
    file: File,
    expedienteId: string
  ): Promise<MinioUploadResponse> {
    if (!expedienteId)
      throw new Error("expedienteId es obligatorio para subir un módulo.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("expedienteId", expedienteId);

    const response = await apiClient.post("/minio-upload/modulo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Subir documentos (múltiples archivos con tipos y módulo asociado)
  async uploadDocumentos(
    files: File[],
    tipos: string[] = [],
    moduloId: string
  ): Promise<MinioUploadResponse> {
    if (!moduloId)
      throw new Error("moduloId es obligatorio para subir documentos.");

    const formData = new FormData();

    // Archivos
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Tipos de documentos
    if (tipos && tipos.length > 0) {
      tipos.forEach((tipo) => {
        formData.append("tipos", tipo);
      });
    }

    // ID del módulo al que se asocian
    formData.append("moduloId", moduloId);

    const response = await apiClient.post("/minio-upload/documento", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Descargar expediente ZIP
  async downloadExpediente(filename: string): Promise<void> {
    const response = await apiClient.get(
      `/minio-download/expediente/${filename}`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Descargar módulo ZIP
  async downloadModulo(filename: string): Promise<void> {
    const response = await apiClient.get(`/minio-download/modulo/${filename}`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Descargar documento individual
  async downloadDocumento(
    documentoId: string,
    filename?: string
  ): Promise<void> {
    // 1️⃣ Llamar al endpoint que genera el ZIP
    const response = await apiClient.get(
      `/minio-download/documento-zip/${documentoId}`,
      {
        responseType: "blob", // importante para archivos binarios
      }
    );

    // 2️⃣ Crear URL temporal para descarga
    const blob = new Blob([response.data], { type: "application/zip" });
    const url = window.URL.createObjectURL(blob);

    // 3️⃣ Nombre del archivo: si no se pasa, se usa el ID como fallback
    const zipName = filename ? `${filename}.zip` : `${documentoId}.zip`;

    // 4️⃣ Crear link y disparar descarga
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", zipName);
    document.body.appendChild(link);
    link.click();
    link.remove();

    // 5️⃣ Liberar URL temporal
    window.URL.revokeObjectURL(url);
  },

  // Descargar expediente completo como ZIP
  async downloadExpedienteCompleto(
    expedienteId: string,
    expedienteTitulo: string
  ): Promise<void> {
    const response = await apiClient.get(
      `/minio-download/expediente-zip/${expedienteId}`,
      {
        responseType: "blob",
      }
    );
    const cleanTitulo = expedienteTitulo
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "_"); // Limpia caracteres raros

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `expediente_${cleanTitulo}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  //Descargar módulo completo (nuevo)
  async downloadModuloCompleto(
    moduloId: string,
    moduloTitulo: string
  ): Promise<void> {
    const response = await apiClient.get(
      `/minio-download/modulo-zip/${moduloId}`,
      {
        responseType: "blob",
      }
    );

    const cleanTitulo = moduloTitulo
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "_"); // Limpia caracteres raros
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `modulo_${cleanTitulo}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
