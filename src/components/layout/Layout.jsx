import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import Header from "../../components/common/Header"

export default function Layout() {
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const menuButtonClass = `
  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
  bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer
  `
  const isFacturacionActive = location.pathname.startsWith("/facturacion")
  const isPerfilActive = location.pathname.startsWith("/perfil")

  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState({facturacion: true, perfil: false})

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition
    ${
      isActive
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`

  return (
    <div className="h-screen flex flex-col bg-background">

      <Header />

      <div className="flex flex-1">
        
        {/* 🔷 SIDEBAR */}
        <aside className={`
          bg-white border-r shadow-sm flex flex-col transition-all
          h-screen sticky top-0
          ${collapsed ? "w-16" : "w-64"}
        `}>
          <div
            className={`
              p-4 border-b flex items-center
              ${collapsed ? "justify-center" : "justify-between"}
            `}
          >

            {!collapsed && (
              <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
                InAltera
              </h2>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`
                p-1.5 rounded-lg 
                bg-gray-100 text-gray-600 
                hover:bg-gray-200 
                transition
                ${collapsed ? "mx-auto" : "w-fit"}
              `}
            >
              {collapsed ? "➡️" : "⬅️"}
            </button>

          </div>

          <nav className="flex flex-col gap-1 px-2">

            {/* DASHBOARD */}
            <NavLink to="/dashboard" className={linkClass}>
              <span>🏠</span>
              {!collapsed && <span>Dashboard</span>}
            </NavLink>

            {/* VERIFICADOR */}
            <NavLink to="/verificador" className={linkClass}>
              <span>🔍</span>
              {!collapsed && <span>Verificador</span>}
            </NavLink>

            {/* REGISTRO */}
            <NavLink to="/registro" className={linkClass}>
              <span>📊</span>
              {!collapsed && <span>Registro</span>}
            </NavLink>

            {/* FACTURACIÓN */}
            <div>
              <div
                onClick={() => {
                  if (collapsed) {
                    navigate("/facturacion/emitir")
                  } else {
                    setOpenMenus({
                      ...openMenus,
                      facturacion: !openMenus.facturacion
                    })
                  }
                }}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer
                  ${
                    isFacturacionActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                <span>📄</span>
                {!collapsed && <span className="flex-1">Facturación</span>}
                {!collapsed && <span>{openMenus.facturacion ? "▲" : "▼"}</span>}
              </div>

              {openMenus.facturacion && !collapsed && (
                <div className="ml-6 flex flex-col">
                  <NavLink to="/facturacion/emitir" className={linkClass}>
                    Emitir factura
                  </NavLink>
                  <NavLink to="/facturacion/pdf" className={linkClass}>
                    Desde PDF
                  </NavLink>
                </div>
              )}
            </div>

          </nav>

          {/*Abajo */}
          <div className="mt-auto flex flex-col gap-1 px-2">

            {/* PERFIL */}
            <div>
              <div
                onClick={() => {
                  if (collapsed) {
                    navigate("/perfil/usuario")
                  } else {
                    setOpenMenus({
                      ...openMenus,
                      perfil: !openMenus.perfil
                    })
                  }
                }}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer
                  ${
                    isPerfilActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                <span>👤</span>
                {!collapsed && <span className="flex-1">Perfil</span>}
                {!collapsed && <span>{openMenus.perfil ? "▲" : "▼"}</span>}
              </div>

              {openMenus.perfil && !collapsed && (
                <div className="ml-6 flex flex-col">
                  <NavLink to="/perfil/usuario" className={linkClass}>
                    Usuario
                  </NavLink>
                  <NavLink to="/perfil/empresa" className={linkClass}>
                    Empresa
                  </NavLink>
                  <NavLink to="/perfil/clientes" className={linkClass}>
                    Clientes
                  </NavLink>
                </div>
              )}
            </div>

            {/* LOGOUT */}
            <button
              onClick={logout}
              className="w-full bg-red-500 text-white py-2 rounded-lg"
            >
              {!collapsed ? "Salir" : "🚪"}
            </button>

          </div>
          
        </aside>
        

        {/* 🔹 MAIN */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
               
      </div>

    </div>
  )
}