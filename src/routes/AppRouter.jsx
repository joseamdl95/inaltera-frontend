import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "../components/layout/Layout"
import PrivateRoute from "./PrivateRoute"

import Login from "../pages/auth/Login"
import Register from "../pages/auth/Register"
import ForgotPassword from "../pages/auth/ForgotPassword"
import ResetPassword from "../pages/auth/ResetPassword"

import Facturacion from "../pages/facturacion/Facturacion"
import EmitirFactura from "../pages/facturacion/EmitirFactura"
import CargarPDF from "../pages/facturacion/CargarPDF"
import Verificador from "../pages/facturacion/Verificador"

import Perfil from "../pages/perfil/Perfil"
import Usuario from "../pages/perfil/Usuario"
import Empresa from "../pages/perfil/Empresa"
import Clientes from "../pages/perfil/Clientes" 

import RegistroFacturas from "../pages/registro/RegistroFacturas"



import { useAuth } from "../context/AuthContext"

function LoadingScreen() {
  return (
    <div className="flex justify-center items-center h-screen">
      <p>Cargando...</p>
    </div>
  )
}

// 🔹 raíz inteligente
function RootRedirect() {
  const { user, hasCompany, loading } = useAuth()
  const hasToken = !!localStorage.getItem("token")

  if (loading) return <LoadingScreen />

  // Si no hay usuario o no hay token, al login
  if (!user || !hasToken) return <Navigate to="/login" replace />
  
  if (!hasCompany) return <Navigate to="/perfil" replace />

  return <Navigate to="/facturacion" replace />
}

// 🔹 bloquear login/register si ya está logueado
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  // 🔍 Solo si hay usuario logueado Y además hay token físico en el PC
  // consideramos que debe ser redirigido fuera del login.
  const hasToken = !!localStorage.getItem("token")

  if (loading) return <LoadingScreen />

  if (user && hasToken) {
    return <Navigate to="/" replace />
  }

  return children
}

// 🔹 exigir empresa
function RequireCompany({ children }) {
  const { hasCompany, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (!hasCompany) {
    return <Navigate to="/perfil/empresa" replace />
  }

  return children
}

function PerfilRedirect() {
  const { hasCompany, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (!hasCompany) {
    return <Navigate to="empresa" replace />
  }

  return <Navigate to="usuario" replace />
}

function FacturacionRedirect() {
  const { hasCompany, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (hasCompany) {
    return <Navigate to="emitir" replace />
  }

  return <Navigate to="verificador" replace />
}

export default function AppRouter() {
  return (
    <Routes>
      {/* raíz */}
      <Route path="/" element={<RootRedirect />} />

      
      <Route path="/login" element={<Login />} />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* privadas */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>

          {/* perfil SIEMPRE accesible */}
          <Route path="/perfil" element={<Perfil />}>
            <Route index element={<PerfilRedirect />} />
            <Route path="usuario" element={<Usuario />} />
            <Route path="empresa" element={<Empresa />} />
            <Route path="clientes" element={<RequireCompany><Clientes /></RequireCompany>} />
          </Route>

          <Route path="/facturacion" element={<Facturacion />}>

            {/* verificador SIEMPRE accesible */}
            <Route path="verificador" element={<Verificador />} />

            {/* protegidas */}
            <Route
              path="emitir"
              element={
                <RequireCompany>
                  <EmitirFactura />
                </RequireCompany>
              }
            />

            <Route
              path="pdf"
              element={
                <RequireCompany>
                  <CargarPDF />
                </RequireCompany>
              }
            />

            {/* default */}
            <Route
              index
               element={<FacturacionRedirect />}
            />

          </Route>

          <Route
            path="/registro"
            element={
              <RequireCompany>
                <RegistroFacturas />
              </RequireCompany>
            }
          />

        </Route>
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}