export default function FinanzasIcon(props: React.SVGProps<SVGSVGElement>) {
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
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12m-3-3h6" />
      </svg>
    );
  }
  