"use client"

import type React from "react"

import { useState } from "react"

import { Upload, FileArchive } from "lucide-react"
import { useToast } from "@/src/hooks/use-toast"
import { minioService } from "@/src/lib/minio"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog"
import { DialogHeader } from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"


interface ImportModuloDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ImportModuloDialog({ open, onOpenChange, onSuccess }: ImportModuloDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".zip")) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos ZIP",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    try {
      await minioService.uploadModulo(file)
      toast({
        title: "Módulo importado",
        description: "El módulo ha sido importado correctamente",
      })
      onSuccess()
      onOpenChange(false)
      setFile(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al importar módulo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Módulo</DialogTitle>
          <DialogDescription>Sube un archivo ZIP con el módulo completo</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Archivo ZIP</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                disabled={isLoading}
                className="flex-1"
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileArchive className="h-4 w-4" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!file || isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
