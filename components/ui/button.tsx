import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const styles = {
  primary: "bg-dual-purple text-white hover:opacity-90",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn("inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition", styles[variant], className)}
      {...props}
    />
  );
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: keyof typeof styles }) {
  return (
    <Link className={cn("inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition", styles[variant])} href={href}>
      {children}
    </Link>
  );
}
