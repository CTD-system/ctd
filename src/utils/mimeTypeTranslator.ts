export const mimeToExt = (mime: string): string => {
  const map: Record<string, string> = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/rtf": "rtf",
    "text/rtf": "rtf",
    "text/plain": "txt",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  }

  // Si está en el mapa → devolver
  if (map[mime]) return map[mime]

  // Si es imagen → devolver última parte del MIME (jpg, png…)
  if (mime.startsWith("image/")) {
    return mime.split("/")[1]
  }

  // Fallback: tomar última parte del MIME
  return mime.split("/").pop() || mime
}