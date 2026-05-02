import './globals.css';

export const metadata = {
  title: 'SelfGraph',
  description: 'AI-powered self profile and improvement system generator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
