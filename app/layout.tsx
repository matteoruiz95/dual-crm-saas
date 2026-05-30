import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dual Taskia CRM",
  description: "CRM SaaS para gestión comercial, leads, tareas y pipeline.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
