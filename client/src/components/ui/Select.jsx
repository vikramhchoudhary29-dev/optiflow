export default function Select({
  label,
  children,
  ...props
}) {
  return (
    <div>
      {label && (
        <label className="block mb-1 text-sm font-medium">
          {label}
        </label>
      )}

      <select
        {...props}
        className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          focus:ring-2
          focus:ring-blue-500
        "
      >
        {children}
      </select>
    </div>
  );
}