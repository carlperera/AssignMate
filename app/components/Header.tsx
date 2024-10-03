'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../styles/Header.module.css';
import { Button } from '@/components/ui/button';
import supabase from '@/supabase/supabaseClient';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string): string => {
    return pathname === path ? styles.active : '';
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return;
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
    router.push('/');
  };

  return (
    <header className={styles.header}>
      <div className="bg-white w-full">
        <div className="max-w-7xl mx-auto lg:px-1 flex justify-between items-center py-4">
          <Link href="/projects-page" className="text-purple-600 hover:text-purple-800">
            <h1 className="text-2xl font-bold">AssignMate</h1>
          </Link>
          <Button 
            onClick={handleLogout}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Log Out
          </Button>
        </div>
      </div>
    </header>
  );
}