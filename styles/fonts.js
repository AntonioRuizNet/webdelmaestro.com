import localFont from "next/font/local";

// Carga dos pesos (puedes añadir más)
export const brand = localFont({
  src: [
    { path: "../public/fonts/poppins/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/poppins/Poppins-Bold.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-brand",
});
