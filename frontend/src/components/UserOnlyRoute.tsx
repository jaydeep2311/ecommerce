'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

interface UserOnlyRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  showMessage?: boolean;
}

export default function UserOnlyRoute({ 
  children, 
  redirectTo = '/products',
  showMessage = true 
}: UserOnlyRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (showMessage) {
          toast.error('Please login to access this page');
        }
        router.push('/auth/login');
        return;
      }

      if (isAdmin) {
        if (showMessage) {
          toast.error('This feature is not available for admin users');
        }
        router.push(redirectTo);
        return;
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router, redirectTo, showMessage]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if user is not authenticated or is admin
  if (!isAuthenticated || isAdmin) {
    return null;
  }

  return <>{children}</>;
}
