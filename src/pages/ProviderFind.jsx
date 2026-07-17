import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import FindServices from "@/components/FindServices";
import BottomNav from "@/components/BottomNav";

export default function ProviderFind() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.ProviderProfile.filter({ user_id: user.id });
        if (profiles.length > 0) setProfile(profiles[0]);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <div className="app-container pt-6">
        <h1 className="text-xl font-bold mb-4 px-4">ابحث عن خدمة</h1>
        <FindServices />
      </div>
      <BottomNav role="provider" />
    </div>
  );
}