import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getCompany } from "../api/company"
import { login as apiLogin } from "../api/auth"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [hasCompany, setHasCompany] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    setUser({ logged: true })
    getCompany()
      .then((company) => {
        setHasCompany(!!company?.id)
      })
      .catch(() => {
        setHasCompany(false)
      })
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await apiLogin(email, password)
      const resData = data?.data ? data.data : data;

      if (resData?.requires_2fa) {
        console.log("LOGIN: Detectado 2FA, NO logueamos todavía");
        return resData; 
      }

      const token = resData?.token;
      if (token) {
        localStorage.setItem("token", token)
        setUser({ logged: true })
        const company = await getCompany()
        setHasCompany(!!company?.id)
        return { success: true }
      }
      return resData;
    } finally {
      setLoading(false)
    }
  }

  // 🟢 NUEVA FUNCIÓN: Para verificar el código de 6 dígitos
  const verify2FALogin = async (email, code) => {
    setLoading(true)
    try {
      // Llamamos a la nueva ruta que pusimos en index.php
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/verify-2fa`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Código inválido");

      localStorage.setItem("token", data.token)
      setUser({ logged: true })

      const company = await getCompany()
      setHasCompany(!!company?.id)
      return true;
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    setHasCompany(null)
    navigate("/login", { replace: true })
  }

  // 🔑 No olvides añadir verify2FALogin al Provider
  return (
    <AuthContext.Provider value={{ user, hasCompany, login, logout, verify2FALogin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
