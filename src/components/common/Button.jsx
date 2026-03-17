export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {

  const base = "px-4 py-2 rounded-lg text-sm font-medium transition"

  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
  }

  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}