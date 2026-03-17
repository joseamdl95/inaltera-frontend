export default function Input({ disabled, ...props }) {
  return (
    <input
      className={`
        w-full border border-gray-300 rounded-lg px-3 py-2
        focus:outline-none focus:ring-2 focus:ring-primary
        ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
      `}
      disabled={disabled}
      {...props}
    />
  )
}