export default function LoadingSpinner({ size = "md", label = "Loading..." }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-[3px]",
  };

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-block animate-spin rounded-full border-white/20 border-t-white ${sizes[size]}`}
      />
      {label ? <span>{label}</span> : null}
    </span>
  );
}
