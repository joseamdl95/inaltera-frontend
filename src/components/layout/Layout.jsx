import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../../context/AuthContext"

export default function Layout() {
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

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
    <div className="flex h-screen bg-background">
      
      {/* 🔷 SIDEBAR */}
      <aside className={`bg-white border-r shadow-sm flex flex-col transition-all
        ${collapsed ? "w-16" : "w-64"}
      `}>
        <div className="flex items-center justify-between p-4">
          {!collapsed && <h2 className="text-xl font-bold">InAltera</h2>}

          <button onClick={() => setCollapsed(!collapsed)}>
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
                  navigate("/facturacion/emitir") // 👈 directo
                } else {
                  setOpenMenus({
                    ...openMenus,
                    facturacion: !openMenus.facturacion
                  })
                }
              }}
              className={linkClass}
            >
              <span>📄</span>
              {!collapsed && <span className={linkClass}>Facturación</span>}
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
                  navigate("/perfil/usuario") // 👈 directo
                } else {
                  setOpenMenus({
                    ...openMenus,
                    perfil: !openMenus.perfil
                  })
                }
              }}
              className={linkClass}
            >
              <span>👤</span>
              {!collapsed && <span className={linkClass}>Perfil</span>}
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

      {/* 🔷 CONTENIDO */}
      <div className="flex-1 flex flex-col">

        {/* 🔹 MAIN */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>

      </div>
    </div>
  )
}