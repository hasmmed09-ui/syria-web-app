import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const route = async () => {
      try {
        const user = await base44.auth.me();
        if (!user.user_type || !user.profile_completed) {
          navigate("/role-select", { replace: true });
        } else if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (user.user_type === "provider") {
          navigate("/provider", { replace: true });
        } else {
          navigate("/customer", { replace: true });
        }
      } catch {
        navigate("/role-select", { replace: true });
      }
      setLoading(false);
    };
    route();
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }
  
  return null;
}