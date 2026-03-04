// Root layout required by Next.js App Router.
// This minimal layout wraps all pages in <html> and <body> tags.

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}