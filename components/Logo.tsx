import { cn } from "@/lib/utils";
export function Logo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="url(#crbio-logo-grad)" />
        <path d="M10 21.5V10.5C10 10.2239 10.2239 10 10.5 10H16.7C19.5719 10 21.5 11.8998 21.5 14.5C21.5 16.4127 20.4408 17.8371 18.7818 18.4184L21.8 21.5H18.9L16.2 18.7857H12.6V21.5C12.6 21.7761 12.3761 22 12.1 22H10.5C10.2239 22 10 21.7761 10 21.5Z" fill="white" />
        <circle cx="16.7" cy="14.35" r="2.15" fill="url(#crbio-logo-grad)" />
        <defs><linearGradient id="crbio-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#9C8FF9" /><stop offset="1" stopColor="#7C6CF6" /></linearGradient></defs>
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight text-white">CRbio</span>
    </span>
  );
}
