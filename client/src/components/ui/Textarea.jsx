export default function Textarea({
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

      <textarea
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
      />
    </div>
  );
}