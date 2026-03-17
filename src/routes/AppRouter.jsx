import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "../components/layout/Layout"
import PrivateRoute from "./PrivateRoute"

import Login from "../pages/auth/Login"
import Register from "../pages/auth/Register"
import ForgotPassword from "../pages/auth/ForgotPassword"
import ResetPassword from "../pages/auth/ResetPassword"

import Dashboard from "../pages/Dashboard"

import EmitirFactura from "../pages/facturacion/EmitirFactura"
import DetalleFactura from "../pages/facturacion/DetalleFactura"
import CargarPDF from "../pages/facturacion/CargarPDF"
import Verificador from "../pages/facturacion/Verificador"

import Perfil from "../pages/perfil/Perfil"
import Usuario from "../pages/perfil/Usuario"
import Empresa from "../pages/perfil/Empresa"
import Clientes from "../pages/perfil/Clientes"

import RegistroFacturas from "../pages/registro/RegistroFacturas"
import VerificarFactura from "../pages/public/VerificarFactura"

import { useAuth } from "../context/AuthContext"

function LoadingScreen() {
  return (
    <div className="flex justify-center items-center h-screen">
      <p>Cargando...</p>
    </div>
  )
}

// 🔹 ROOT → siempre dashboard si está logueado
function RootRedirect() {
  const { user, loading } = useAuth()
  const hasToken = !!localStorage.getItem("token")

  if (loading) return <LoadingScreen />

  if (!user || !hasToken) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to="/dashboard" replace />
}

// 🔹 PUBLIC ROUTE
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  const hasToken = !!localStorage.getItem("token")

  if (loading) return <LoadingScreen />

  if (user && hasToken) {
    return <Navigate to="/" replace />
  }

  return children
}

// 🔹 REQUIRE COMPANY
function RequireCompany({ children }) {
  const { hasCompany, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (!hasCompany) {
    return <Navigate to="/perfil/empresa" replace />
  }

  return children
}

// 🔹 PERFIL REDIRECT
function PerfilRedirect() {
  const { hasCompany, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (!hasCompany) return <Navigate to="empresa" replace />

  return <Navigate to="usuario" replace />
}

export default function AppRouter() {
  return (
    <Routes>

      {/* raíz */}
      <Route path="/" element={<RootRedirect />} />

      {/* públicas */}
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
      <Route path="/verificar" element={<VerificarFactura />} />

      {/* privadas */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>

          {/* 🏠 DASHBOARD */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 👤 PERFIL */}
          <Route path="/perfil" element={<Perfil />}>
            <Route index element={<PerfilRedirect />} />
            <Route path="usuario" element={<Usuario />} />
            <Route path="empresa" element={<Empresa />} />
            <Route
              path="clientes"
              element={<RequireCompany><Clientes /></RequireCompany>}
            />
          </Route>

          {/* 📄 FACTURACIÓN */}
          <Route
            path="/facturacion/emitir"
            element={<RequireCompany><EmitirFactura /></RequireCompany>}
          />
          <Route
            path="/facturacion/pdf"
            element={<RequireCompany><CargarPDF /></RequireCompany>}
          />
          <Route
            path="/facturacion/editar/:id"
            element={<RequireCompany><EmitirFactura /></RequireCompany>}
          />

          {/* 🔍 VERIFICADOR */}
          <Route path="/verificador" element={<Verificador />} />

          {/* 📊 REGISTRO */}
          <Route
            path="/registro"
            element={<RequireCompany><RegistroFacturas /></RequireCompany>}
          />
          <Route
            path="/registro/:id"
            element={<RequireCompany><DetalleFactura /></RequireCompany>}
          />

        </Route>
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}