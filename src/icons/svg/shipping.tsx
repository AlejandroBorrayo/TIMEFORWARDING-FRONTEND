export default function EnviosIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M3 7h13v10H3z" />
      <path d="M16 10h5l-1.5-3H16z" />
      <circle cx="7.5" cy="17" r="1.5" />
      <circle cx="17.5" cy="17" r="1.5" />
    </svg>
  );
}
