import { NavLink, Outlet } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function Layout() {
  const { logout } = useAuth()

  const linkStyle = ({ isActive }) => ({
    padding: "8px 12px",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: isActive ? "bold" : "normal",
    backgroundColor: isActive ? "#e5e7eb" : "transparent",
    color: "black"
  })

  return (
    <div>
      <nav
        style={{
          padding: 10,
          borderBottom: "1px solid #ccc",
          display: "flex",
          gap: "10px",
          alignItems: "center"
        }}
      >
        <NavLink to="/perfil" style={linkStyle}>
          Perfil
        </NavLink>

        <NavLink to="/facturacion" style={linkStyle}>
          Facturación
        </NavLink>

        <NavLink to="/registro" style={linkStyle}>
          Registro
        </NavLink>

        <div style={{ marginLeft: "auto" }}>
          <button onClick={logout}>Salir</button>
        </div>
      </nav>

      <main style={{ padding: 20 }}>
        <Outlet />
      </main>
    </div>
  )
}