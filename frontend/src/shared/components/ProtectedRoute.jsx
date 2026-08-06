import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors } from 'lucide-react';

export default function ProtectedRoute({ children, redirectTo = '/customer/login' }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Scissors className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs font-bold text-slate-400">Verifying session...</p>
      </div>
    );
  }

  if (!currentUser) return <Navigate to={redirectTo} replace />;
  return children;
}

