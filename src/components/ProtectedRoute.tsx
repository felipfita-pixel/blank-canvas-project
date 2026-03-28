import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false }: { children: ReactNode; requireAdmin?: boolean }) => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingSession, setCheckingSession] = useState(true);

  const shouldRedirectToLogin = !loading && !checkingSession && !user;
  const shouldRedirectToHome = !loading && !checkingSession && !!user && requireAdmin && !isAdmin;

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      if (loading) {
        if (mounted) setCheckingSession(true);
        return;
      }

      if (user) {
        if (mounted) setCheckingSession(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setCheckingSession(Boolean(data.session));
    };

    void verifySession();

    return () => {
      mounted = false;
    };
  }, [loading, user]);

  useEffect(() => {
    if (shouldRedirectToLogin) {
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }

    if (shouldRedirectToHome) {
      navigate("/", { replace: true });
    }
  }, [location, navigate, shouldRedirectToHome, shouldRedirectToLogin]);

  if (loading || checkingSession || shouldRedirectToLogin || shouldRedirectToHome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
