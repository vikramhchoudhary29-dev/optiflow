export default function Card({
  title,
  value,
}) {
  return (
    <div className="rounded-xl bg-white shadow-md p-6 hover:shadow-lg transition">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h2 className="mt-3 text-3xl font-bold text-slate-800">
        {value}
      </h2>

    </div>
  );
}