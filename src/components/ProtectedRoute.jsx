import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthenticated(!!user);
      setLoading(false);
    };
    
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthenticated(!!session?.user);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f4ee]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d4d35]"></div>
      </div>
    );
  }

  if (!authenticated) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
