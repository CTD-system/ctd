"use client";

import { useState, type DragEvent, type ChangeEvent, useEffect } from "react"
import { ImageIcon, X } from "lucide-react"
import { Button } from "../ui/button"

interface Props {
  value?: string // URL/base64 final guardada en el bloque
  onChange: (url: string) => void
}

export function DropzoneImagen({ value, onChange }: Props) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [emfWarning, setEmfWarning] = useState<string | null>(null)
  const [fileIsEMF, setFileIsEMF] = useState<boolean>(false)
  const inputId = `img-input-${crypto.randomUUID()}`
  useEffect(() => {
  if (!value) return

  // detectar si el base64 es EMF
  if (value.startsWith("data:image/emf") || value.startsWith("data:image/x-emf")) {
    setFileIsEMF(true)
    setEmfWarning("⚠️ Este archivo es EMF y no se puede previsualizar en el navegador.")
    setPreview(null)
  } else {
    setFileIsEMF(false)
    setEmfWarning(null)
    setPreview(value)
  }
}, [])


  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })
  }

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    console.log(file.type);
    console.log(value);

    // ⚠️ Validar tipo EMF
    if (file.type === "image/x-emf" || file.name.toLowerCase().endsWith(".emf")) {
      setEmfWarning("⚠️ Este archivo es un EMF y no se puede previsualizar en el navegador.")
      setFileIsEMF(true)
      setPreview(null)
      onChange("") // opcional: limpiar valor
      return
    } else {
      setEmfWarning(null)
      setFileIsEMF(false)
    }

    if (!file.type.startsWith("image/")) {
      alert("Archivo no válido (solo imágenes)")
      return
    }

    const maxSizeMB = 1
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`La imagen no puede superar ${maxSizeMB} MB`)
      return
    }

    setPreview(URL.createObjectURL(file))

    try {
      const base64 = await fileToBase64(file)
      setPreview(base64)
      onChange(base64)
    } catch (err) {
      console.error("Error al convertir la imagen a base64:", err)
      alert("No se pudo procesar la imagen")
    }
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
      onDragLeave={() => setDragActive(false)}
      className={`border-2 p-4 rounded-lg flex flex-col items-center justify-center text-center gap-3 min-h-[200px] cursor-pointer
        ${dragActive ? "border-blue-500 bg-blue-50" : "border-dashed border-gray-300 bg-white"}
      `}
        onClick={() => document.getElementById(inputId)?.click()}
    >
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {(preview || fileIsEMF) ? (
        <div className="relative w-full flex flex-col items-center gap-2">
          {!fileIsEMF && <img src={preview!} className="max-h-48 object-contain rounded-md" />}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setPreview(null)
              setEmfWarning(fileIsEMF ? emfWarning : null)
              setFileIsEMF(fileIsEMF ? true : false)
              onChange("")
            }}
          >
            <X className="w-4 h-4" /> Quitar
          </Button>

          {/* Mostrar aviso EMF debajo del botón */}
          {fileIsEMF && emfWarning && (
            <p className="text-sm text-red-600 mt-1 font-semibold">{"⚠️ Este archivo es un EMF y no se puede previsualizar en el navegador."}</p>
          )}
        </div>
      ) : (
        <>
          <ImageIcon className="w-8 h-8 text-gray-400" />
          <p className="text-sm text-gray-600">Arrastra una imagen aquí o haz click</p>
          <p className="text-sm text-gray-600">El tamaño de la imagen no puede superar los 1 MB</p>
        </>
      )}
    </div>
  )
}
