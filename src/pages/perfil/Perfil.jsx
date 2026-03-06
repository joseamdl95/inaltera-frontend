import { NavLink, Outlet } from "react-router-dom"


export default function Perfil() {
  const linkStyle = ({ isActive }) => ({
    padding: "8px 12px",
    borderRadius: "6px",
    textDecoration: "none",
    backgroundColor: isActive ? "#e5e7eb" : "transparent",
    color: "black"
  })
  return (
    <div>
      <h1>Perfil</h1>

      <nav style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <NavLink to="usuario" style={linkStyle}>Usuario</NavLink>
        <NavLink to="empresa" style={linkStyle}>Empresa</NavLink>
        <NavLink to="clientes" style={linkStyle}>Clientes</NavLink>
      </nav>

      <Outlet />
    </div>
  )
}
