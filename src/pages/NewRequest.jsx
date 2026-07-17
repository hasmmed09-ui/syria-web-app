import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { CATEGORIES } from "@/lib/categories";
import LocationPicker from "@/components/LocationPicker";
import ProvidersMap from "@/components/ProvidersMap";
import { ArrowRight, Camera, X, Home, Check } from "lucide-react";
import { createNotification, sendEmailSafe, getUserEmailSafe } from "@/lib/notify";

export default function NewRequest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const preselectedCategory = searchParams.get("category") || "";
  const preselectedProviderId = searchParams.get("provider_id") || "";
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: preselectedCategory,
    title: "",
    description: "",
    address: "",
  });
  const [location, setLocation] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  useEffect(() => {
    const loadProviders = async () => {
      if (!form.category) {
        setProviders([]);
        return;
      }
      try {
        const all = await base44.entities.ProviderProfile.filter({ status: "approved" });
        setProviders(all.filter((p) => p.skills?.includes(form.category) && p.latitude && p.longitude));
      } catch {
        setProviders([]);
      }
    };
    loadProviders();
  }, [form.category]);
  
  useEffect(() => {
    if (!preselectedProviderId) return;
    const loadProvider = async () => {
      try {
        const p = await base44.entities.ProviderProfile.get(preselectedProviderId);
        setSelectedProvider(p);
      } catch {}
    };
    loadProvider();
  }, [preselectedProviderId]);
  
  const handlePhotos = (e) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...files]);
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
  };
  
  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.title || !form.description || !form.address || !location) {
      toast({ title: "يرجى ملء الحقول وتحديد موقعك على الخريطة", variant: "destructive" });
      return;
    }
    if (!selectedProvider) {
      toast({ title: "يرجى اختيار مقدم الخدمة من القائمة", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const user = await base44.auth.me();
      let photo_urls = [];
      for (const file of photos) {
        const res = await base44.integrations.Core.UploadFile({ file });
        photo_urls.push(res.file_url);
      }
      const created = await base44.entities.ServiceRequest.create({
        ...form,
        customer_id: user.id,
        customer_name: user.full_name || "عميل",
        customer_phone: user.phone || "",
        latitude: location?.lat,
        longitude: location?.lng,
        photo_urls,
        provider_id: selectedProvider.id,
        provider_name: selectedProvider.full_name,
        provider_phone: selectedProvider.phone,
        status: "open",
      });
      
      // Notify provider (in-app + email)
      createNotification({
        user_id: selectedProvider.user_id,
        title: "طلب خدمة جديد",
        body: `طلب جديد من ${user.full_name || "عميل"}: ${form.title}`,
        type: "order_new",
        request_id: created.id,
      });
      const providerEmail = await getUserEmailSafe(selectedProvider.user_id);
      sendEmailSafe(
        providerEmail,
        "طلب خدمة جديد 🛎️",
        `لديك طلب خدمة جديد من ${user.full_name || "عميل"}.\n\nالعنوان: ${form.title}\nالوصف: ${form.description}\nالموقع: ${form.address}\n\nيرجى مراجعة التطبيق لقبول أو رفض الطلب.`
      );
      
      // Notify customer (in-app + email)
      createNotification({
        user_id: user.id,
        title: "تم إرسال طلبك",
        body: `تم إرسال طلبك إلى ${selectedProvider.full_name}`,
        type: "order_new",
        request_id: created.id,
      });
      sendEmailSafe(
        user.email,
        "تم استلام طلبك ✅",
        `مرحباً ${user.full_name || ""}،\n\nتم إرسال طلبك "${form.title}" إلى مقدم الخدمة ${selectedProvider.full_name}. سيتم إشعارك فور قبول الطلب.`
      );
      
      toast({ title: "تم إرسال الطلب بنجاح ✅" });
      navigate("/my-requests");
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="app-container p-4 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">طلب خدمة جديد</h1>
        </div>

        {selectedProvider && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4">
            <p className="text-sm font-medium">طلب موجه إلى: {selectedProvider.full_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{selectedProvider.service_area}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label className="text-sm font-medium mb-2 block">نوع الخدمة *</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const selected = form.category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setForm({ ...form, category: cat.id })}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <cat.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">عنوان المشكلة *</label>
            <Input
              placeholder="مثال: عطل في المكيف"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">وصف المشكلة *</label>
            <Textarea
              placeholder="اشرح المشكلة بالتفصيل..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </div>

          {/* Photos */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">صور (اختياري)</label>
            <div className="flex gap-2 flex-wrap">
              {photoPreviews.map((preview, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                <Camera className="w-6 h-6 text-muted-foreground" />
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
              </label>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">العنوان *</label>
            <Input
              placeholder="مثال: حي المزة، دمشق"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          {/* Location */}
          <LocationPicker value={location} onChange={setLocation} />

          {/* Providers on map */}
          {form.category && (
            <div>
              <label className="text-sm font-medium mb-2 block">اختر مقدم الخدمة *</label>
              <ProvidersMap providers={providers} customerLocation={location} />
              {providers.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {providers.map((p) => {
                    const isSel = selectedProvider?.id === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setSelectedProvider(p)}
                        className={`w-full flex items-center justify-between rounded-lg border-2 px-3 py-2 text-xs transition-all ${
                          isSel ? "border-primary bg-primary/5" : "border-border bg-card"
                        }`}
                      >
                        <span className="font-medium">{p.full_name}</span>
                        <span className="flex items-center gap-2">
                          {p.offers_home_service ? (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                              <Home className="w-3 h-3" /> منزلية
                            </span>
                          ) : (
                            <span className="text-muted-foreground">في المحل</span>
                          )}
                          {isSel && <Check className="w-4 h-4 text-primary" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {providers.length === 0 && form.category && (
                <p className="text-center text-xs text-muted-foreground mt-2">
                  لا يوجد مقدمو خدمات لهذا النوع بعد
                </p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={loading}>
            {loading ? "جاري الإرسال..." : "إرسال الطلب"}
          </Button>
        </form>
      </div>
    </div>
  );
}