export function Button({ children, variant = "primary", ...props }) {
  const variants = {
    primary: "bg-primary text-secondary hover:bg-yellow-400",
    accent: "bg-accent text-secondary hover:bg-green-300",
    danger: "bg-danger text-white hover:bg-red-600",
    ghost: "bg-transparent border border-gray-dark text-white hover:bg-gray-dark",
  }

  return (
    <button
      className={`px-5 py-2 rounded-xl font-heading transition-all ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  )
}
