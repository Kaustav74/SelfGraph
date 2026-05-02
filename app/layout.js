import './globals.css';

export const metadata = {
  title: 'SelfGraph',
  description: 'Premium personal intelligence analysis from your chat history',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
