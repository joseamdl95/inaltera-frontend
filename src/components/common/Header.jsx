export default function Header() {
    
    return (
        <div className="flex items-center justify-between mb-6">

        {/* 🖼 LOGO */}
        <div className="flex items-center gap-2">
            <img
            src={import.meta.env.VITE_LOGO_URL}
            alt="InAltera"
            className="h-8 object-contain"
            />
        </div>

        {/* 👉 opcional futuro (usuario, notificaciones, etc) */}
        <div />

        </div>
    )
}