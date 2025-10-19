import "./globals.css";

export const metadata = {
  title: "Blank App",
  description: "A clean slate for building new applications",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
