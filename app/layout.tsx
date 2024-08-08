import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./components/Header";
import "./styles/globals.css";
import styles from "./styles/Layout.module.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AssignMate",
  description: "Manage your team projects and deadlines",
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<LayoutProps>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className={styles.container}>
          <Header />
          <main className={styles.main}>{children}</main>
          <footer className={styles.footer}>
            © 2024 AssignMate. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  );
}