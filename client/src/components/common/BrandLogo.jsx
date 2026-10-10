export default function BrandLogo({ className = "h-10 w-40", dark = false }) {
  return (
    <div className={`relative shrink-0 overflow-hidden ${dark ? "rounded-md bg-white" : ""} ${className}`} aria-label="OptiFlow Optical Shop ERP">
      <img
        src="/optiflow-logo.png"
        alt="OptiFlow Optical Shop ERP"
        className="absolute left-1/2 top-1/2 w-[145%] max-w-none -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}
