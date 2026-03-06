import { NavLink, Outlet } from "react-router-dom"

export default function Facturacion() {
  const linkStyle = ({ isActive }) => ({
    padding: "8px 12px",
    borderRadius: "6px",
    textDecoration: "none",
    backgroundColor: isActive ? "#e5e7eb" : "transparent",
    color: "black"
  })

  return (
    <div>
      <h1>Facturación</h1>

      <nav style={{ display: "flex", gap: "10px" }}>
        <NavLink to="emitir" style={linkStyle}>Emitir</NavLink>
        <NavLink to="pdf" style={linkStyle}>Cargar PDF</NavLink>
        <NavLink to="verificador" style={linkStyle}>Verificador</NavLink>
      </nav>

      <div style={{ marginTop: "20px" }}>
        <Outlet />
      </div>
    </div>
  )
}