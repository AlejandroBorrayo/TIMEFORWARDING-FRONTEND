export default function CotizadorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 mr-2 inline-block"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <rect x="4" y="3" width="16" height="18" rx="2" ry="2" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="8" y2="11" />
      <line x1="12" y1="11" x2="12" y2="11" />
      <line x1="16" y1="11" x2="16" y2="11" />
      <line x1="8" y1="15" x2="8" y2="15" />
      <line x1="12" y1="15" x2="12" y2="15" />
      <line x1="16" y1="15" x2="16" y2="15" />
    </svg>
  );
}
