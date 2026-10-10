export default function Input({
  label,
  ...props
}) {
  return (
    <div>
      {label && (
        <label className="block mb-1 text-sm font-medium">
          {label}
        </label>
      )}

      <input
        {...props}
        className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />
    </div>
  );
}