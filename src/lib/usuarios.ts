import apiClient from "./api-client"

export enum UserRole {
  ADMIN = "admin",
  REVISOR = "revisor",
  EDITOR = "editor",
  USUARIO = "usuario",
}

export interface Usuario {
  id: string
  username: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface CreateUsuarioData {
  username: string
  email: string
  password: string
  role: UserRole
}

export interface UpdateUsuarioData {
  username?: string
  email?: string
  password?: string
  role?: UserRole
}

export const usuariosService = {
  async getAll(): Promise<Usuario[]> {
    const response = await apiClient.get("/users")
    return response.data
  },

  async getById(id: string): Promise<Usuario> {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  async create(data: CreateUsuarioData): Promise<Usuario> {
    const response = await apiClient.post("/users", data)
    return response.data
  },

  async update(id: string, data: UpdateUsuarioData): Promise<Usuario> {
    const response = await apiClient.put(`/users/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`)
  },
}
