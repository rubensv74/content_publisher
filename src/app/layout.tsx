import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Content Publisher",
    template: "%s · Content Publisher",
  },
  description:
    "Espacio personal para convertir ideas y proyectos en contenido profesional para LinkedIn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
