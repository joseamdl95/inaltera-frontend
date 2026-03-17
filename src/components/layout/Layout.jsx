import { NavLink, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function Layout() {
  const { logout } = useAuth()
  const location = useLocation()

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-lg transition ${
      isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
    }`

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* 🔷 SIDEBAR */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-6">InAltera</h2>

        <nav className="flex flex-col gap-2">
          
          {/* Dashboard (lo añadiremos) */}
          <NavLink to="/dashboard" className={linkClass}>
            🏠 Dashboard
          </NavLink>

          {/* Facturación */}
          <div>
            <p className="text-xs text-gray-400 px-2 mt-4">FACTURACIÓN</p>
            <NavLink to="/facturacion/emitir" className={linkClass}>
              Emitir factura
            </NavLink>
            <NavLink to="/facturacion/pdf" className={linkClass}>
              Desde PDF
            </NavLink>
          </div>

          {/* Verificador */}
          <NavLink to="/verificador" className={linkClass}>
            🔍 Verificador
          </NavLink>

          {/* Registro */}
          <NavLink to="/registro" className={linkClass}>
            📊 Registro
          </NavLink>

          {/* Perfil */}
          <div>
            <p className="text-xs text-gray-400 px-2 mt-4">PERFIL</p>
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

        </nav>

        {/* Logout abajo */}
        <div className="mt-auto">
          <button
            onClick={logout}
            className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg"
          >
            Salir
          </button>
        </div>
      </aside>

      {/* 🔷 CONTENIDO */}
      <div className="flex-1 flex flex-col">

        {/* 🔹 TOPBAR */}
        <header className="h-14 bg-white border-b flex items-center px-6">
          <h1 className="text-lg font-semibold">
            {location.pathname}
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