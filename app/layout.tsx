import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "./components/Footer";
import "./styles/globals.css";
import styles from "./styles/Layout.module.css";
import React from 'react';

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
        <div className={styles.pageWrapper}>
          <div className={styles.container}>
            {children}
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}