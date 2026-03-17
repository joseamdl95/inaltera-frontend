export default function Button({ children, variant = "primary", ...props }) {
  const base = "px-4 py-2 rounded-lg transition text-sm font-medium"

  const styles = {
    primary: "bg-primary text-white hover:bg-blue-600",
    secondary: "border border-gray-300 hover:bg-gray-100",
  }

  return (
    <button className={`${base} ${styles[variant]}`} {...props}>
      {children}
    </button>
  )
}