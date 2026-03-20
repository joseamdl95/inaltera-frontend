export default function Header() {
    
    return (
        <div className="
            h-16 
            bg-white 
            border-b 
            flex items-center 
            px-6 
            shadow-sm
        ">

        {/* 🖼 LOGO */}
        <img
            src={import.meta.env.VITE_LOGO_URL}
            alt="InAltera"
            className="h-12 object-contain"
        />

        </div>
    )
}