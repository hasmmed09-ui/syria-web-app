import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import StarRating from "@/components/StarRating";
import { PROVIDER_STATUS } from "@/lib/categories";
import { useTheme } from "next-themes";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut, User, Phone, MapPin, Shield, Star, Trash2, Sun, Moon, Pencil } from "lucide-react";
import EditProfile from "@/components/EditProfile";
import JobLeaderboard from "@/components/JobLeaderboard";
import RequestJob from "@/components/RequestJob";

export default function Profile() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        if (u.user_type === "provider") {
          const profiles = await base44.entities.ProviderProfile.filter({ user_id: u.id });
          if (profiles.length > 0) setProfile(profiles[0]);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);
  
  const handleLogout = async () => {
    await base44.auth.logout("/login");
  };
  
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      if (profile) {
        try { await base44.entities.ProviderProfile.delete(profile.id); } catch {}
      }
      try { await base44.entities.User.delete(user.id); } catch {}
      await base44.auth.logout("/login");
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
      setDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  
  const statusInfo = profile ? PROVIDER_STATUS[profile.status] : null;
  
  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <div className="app-container p-4">
        <h1 className="text-xl font-bold mb-4">حسابي</h1>

        {/* User card */}
        <div className="bg-card rounded-2xl border p-5 mb-3">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-lg">{profile?.full_name || user?.full_name || "مستخدم"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  <Shield className="w-3 h-3" />
                  {user?.role === "admin" ? "مدير" : user?.user_type === "provider" ? "مقدم خدمة" : "عميل"}
                </span>
                {statusInfo && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        {profile && (
          <EditProfile profile={profile} onUpdated={(p) => setProfile(p)} />
        )}

        {/* Provider details */}
        {profile && (
          <div className="bg-card rounded-2xl border p-4 mb-3 space-y-3">
            {profile.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{profile.phone}</span>
              </div>
            )}
            {profile.service_area && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{profile.service_area}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-muted-foreground" />
              <StarRating value={Math.round(profile.avg_rating || 0)} readOnly size={16} />
              <span className="text-muted-foreground">({profile.total_ratings || 0} تقييم)</span>
            </div>
            {profile.bio && (
              <p className="text-sm text-muted-foreground border-t pt-3">{profile.bio}</p>
            )}
          </div>
        )}

        {/* Admin link */}
        {user?.role === "admin" && (
          <Button
            variant="outline"
            className="w-full rounded-xl mb-3"
            onClick={() => navigate("/admin")}
          >
            <Shield className="w-4 h-4 ml-2" />
            لوحة الإدارة
          </Button>
        )}

        {/* Request a new job */}
        <div className="mb-3">
          <RequestJob user={user} />
        </div>

        {/* Job Leaderboard */}
        <div className="mb-3">
          <JobLeaderboard />
        </div>

        {/* Settings */}
        <div className="bg-card rounded-2xl border p-4 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              الوضع الليلي
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={(c) => setTheme(c ? "dark" : "light")} />
          </div>
        </div>

        {/* Account deletion */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full rounded-xl mb-3 text-destructive hover:bg-destructive/5">
              <Trash2 className="w-4 h-4 ml-2" />
              حذف الحساب
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>حذف الحساب</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف حسابك وملف مقدم الخدمة نهائياً. لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? "جاري الحذف..." : "نعم، حذف الحساب"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button variant="destructive" className="w-full rounded-xl" onClick={handleLogout}>
          <LogOut className="w-4 h-4 ml-2" />
          تسجيل الخروج
        </Button>
      </div>
      <BottomNav role={user?.user_type === "provider" ? "provider" : "customer"} />
    </div>
  );
}