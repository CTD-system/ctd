import apiClient from "./api-client"

export interface User {
  id: number
  email: string
  username: string
  rol: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  nombre: string
  rol?: string
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post("/auth/login", credentials)
    const { access_token, user } = response.data
    localStorage.setItem("token", access_token)
    localStorage.setItem("user", JSON.stringify(user))
    return { token: access_token, user }
  },

  async register(data: RegisterData) {
    const response = await apiClient.post("/auth/register", data)
    return response.data
  },

  async getProfile() {
    const response = await apiClient.get("/auth/profile")
    return response.data
  },

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  },

  getUser(): User | null {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token")
  },
}
