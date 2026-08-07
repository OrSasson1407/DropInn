import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole = null, redirectTo = '/customer/login' }) {
  const { currentUser, userRole, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Scissors className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs font-bold text-slate-400">Verifying session...</p>
      </div>
    );
  }

  if (!currentUser) return <Navigate to={redirectTo} replace />;

  if (requiredRole === 'admin' && !isAdmin) {
    return (
      <div className="p-8 max-w-md mx-auto my-12 bg-slate-900 border border-rose-500/30 rounded-3xl text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Admin Access Restricted</h3>
        <p className="text-xs text-slate-400">You must have administrator privileges to access this console.</p>
      </div>
    );
  }

  if (requiredRole === 'provider' && userRole !== 'provider' && !isAdmin) {
    return <Navigate to="/provider/login" replace />;
  }

  return children;
}


