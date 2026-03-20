import { NavLink, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function Layout() {
  const { logout } = useAuth()
  const location = useLocation()

  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState({facturacion: true, perfil: false})

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-lg transition ${
      isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
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
          
          {/* Dashboard */}
          <NavLink to="/dashboard" className={linkClass}>
            <span>🏠</span>
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          {/* FACTURACIÓN */}
          <div>
            {!collapsed && (
              <p className="text-xs text-gray-400 px-2 mt-4">FACTURACIÓN</p>
            )}

            <div
              onClick={() =>
                setOpenMenus({
                  ...openMenus,
                  facturacion: !openMenus.facturacion
                })
              }
              className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded"
            >
              <span>📄</span>
              {!collapsed && <span className="flex-1">Facturación</span>}
              {!collapsed && <span>{openMenus.facturacion ? "▲" : "▼"}</span>}
            </div>

            {/* SUBMENU */}
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

          {/* Verificador */}
          <NavLink to="/verificador" className={linkClass}>
            <span>🔍</span>
            {!collapsed && <span>Verificador</span>}
          </NavLink>

          {/* Registro */}
          <NavLink to="/registro" className={linkClass}>
            <span>📊</span>
            {!collapsed && <span>Registro</span>}
          </NavLink>

          {/* PERFIL */}
          <div>
            {!collapsed && (
              <p className="text-xs text-gray-400 px-2 mt-4">PERFIL</p>
            )}

            <div
              onClick={() =>
                setOpenMenus({
                  ...openMenus,
                  perfil: !openMenus.perfil
                })
              }
              className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded"
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

        </nav>

        {/* Logout abajo */}
        <div className="mt-auto p-2">
          <button
            onClick={logout}
            className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg"
          >
            {!collapsed ? "Salir" : "🚪"}
          </button>
        </div>
      </aside>

      {/* 🔷 CONTENIDO */}
      <div className="flex-1 flex flex-col">

        {/* 🔹 TOPBAR */}
        <header className="h-14 bg-white border-b px-6 flex items-center">
          <h1 className="text-lg font-semibold">
            {location.pathname.split("/").filter(Boolean).join(" / ") || "Dashboard"}
          </h1>
        </header>

        {/* 🔹 MAIN */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>

      </div>
    </div>
  )
}