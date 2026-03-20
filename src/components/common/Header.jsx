export default function Header() {
    
    return (
        <div className="
            h-20 
            bg-white 
            border-b 
            flex items-center 
            px-10 
            shadow-sm
        ">

        {/* 🖼 LOGO */}
        <img
            src={import.meta.env.VITE_LOGO_URL}
            alt="InAltera"
            className="h-14 object-contain"
        />

        </div>
    )
}