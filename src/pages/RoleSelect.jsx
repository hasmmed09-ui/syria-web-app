import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { User, Wrench } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function RoleSelect() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const selectRole = async (role) => {
    setLoading(true);
    try {
      await base44.auth.updateMe({ user_type: role, profile_completed: role === "customer" });
      if (role === "provider") {
        navigate("/provider/setup");
      } else {
        window.location.href = "/";
      }
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-primary/5 to-background" dir="rtl">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">مرحباً بك! 👋</h1>
          <p className="text-muted-foreground mt-2">كيف تريد استخدام التطبيق؟</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => selectRole("customer")}
            disabled={loading}
            className="w-full bg-white rounded-2xl border-2 border-border hover:border-primary p-6 text-right flex items-center gap-4 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">أبحث عن خدمة</h3>
              <p className="text-sm text-muted-foreground">اطلب كهربائي، سباك، أو أي خدمة أخرى</p>
            </div>
          </button>

          <button
            onClick={() => selectRole("provider")}
            disabled={loading}
            className="w-full bg-white rounded-2xl border-2 border-border hover:border-primary p-6 text-right flex items-center gap-4 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
              <Wrench className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">أقدم خدمات</h3>
              <p className="text-sm text-muted-foreground">سجّل كمزود خدمة واستقبل طلبات العملاء</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}