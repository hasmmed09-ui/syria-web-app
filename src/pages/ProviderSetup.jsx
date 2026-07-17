import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { CATEGORIES, SYRIAN_CITIES } from "@/lib/categories";
import LocationPicker from "@/components/LocationPicker";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, Camera, X } from "lucide-react";
import { validateSyrianPhone } from "@/lib/phoneValidation";

export default function ProviderSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    bio: "",
    service_area: "",
    shop_address: "",
    skills: [],
    custom_skills: [],
    offers_home_service: false,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");
  
  const addCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !form.custom_skills.includes(trimmed)) {
      setForm({ ...form, custom_skills: [...form.custom_skills, trimmed] });
      setCustomSkillInput("");
    }
  };
  
  const removeCustomSkill = (idx) => {
    setForm({ ...form, custom_skills: form.custom_skills.filter((_, i) => i !== idx) });
  };
  
  const toggleSkill = (skillId) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId) ?
        prev.skills.filter((s) => s !== skillId) :
        [...prev.skills, skillId],
    }));
  };
  
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || form.skills.length === 0 || !form.service_area) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    const phoneCheck = validateSyrianPhone(form.phone);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error);
      toast({ title: phoneCheck.error, variant: "destructive" });
      return;
    }
    setPhoneError("");
    if (form.skills.includes("other") && form.custom_skills.length === 0) {
      toast({ title: "يرجى كتابة مهنتك الخاصة", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const user = await base44.auth.me();
      let photo_url = "";
      if (photoFile) {
        const res = await base44.integrations.Core.UploadFile({ file: photoFile });
        photo_url = res.file_url;
      }
      await base44.entities.ProviderProfile.create({
        ...form,
        user_id: user.id,
        photo_url,
        latitude: location?.lat,
        longitude: location?.lng,
        status: "approved",
      });
      await base44.auth.updateMe({ profile_completed: true, phone: form.phone });
      toast({ title: "تم إنشاء ملفك بنجاح! ✅", description: "يمكنك البدء باستقبال الطلبات الآن" });
      window.location.href = "/provider";
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
          <h1 className="text-xl font-bold">إنشاء ملفك المهني</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo */}
          <div className="flex justify-center">
            <label className="relative cursor-pointer">
              <div className="w-24 h-24 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">الاسم الكامل *</label>
            <Input
              placeholder="أحمد محمد"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">رقم الهاتف *</label>
            <Input
              placeholder="09xxxxxxxx"
              value={form.phone}
              onChange={(e) => {
                setForm({ ...form, phone: e.target.value });
                setPhoneError("");
              }}
              onBlur={() => {
                if (form.phone) {
                  const check = validateSyrianPhone(form.phone);
                  setPhoneError(check.valid ? "" : check.error);
                }
              }}
              dir="ltr"
              className={`text-left ${phoneError ? "border-destructive" : ""}`}
            />
            {phoneError && (
              <p className="text-xs text-destructive mt-1">{phoneError}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">نبذة عنك</label>
            <Textarea
              placeholder="اكتب نبذة قصيرة عن خبرتك..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
            />
          </div>

          {/* Service Area */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">منطقة الخدمة *</label>
            <Select value={form.service_area} onValueChange={(v) => setForm({ ...form, service_area: v })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المدينة" />
              </SelectTrigger>
              <SelectContent>
                {SYRIAN_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills */}
          <div>
            <label className="text-sm font-medium mb-2 block">المهارات والخدمات *</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const selected = form.skills.includes(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleSkill(cat.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-white hover:border-muted-foreground/30"
                    }`}
                  >
                    <cat.icon className="w-4 h-4" />
                    <span className="font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom skills (when "other" is selected) */}
          {form.skills.includes("other") && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">اكتب مهنتك الخاصة</label>
              <div className="flex gap-2">
                <Input
                  placeholder="مثال: صيانة سيارات"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                />
                <Button type="button" onClick={addCustomSkill}>
                  إضافة
                </Button>
              </div>
              {form.custom_skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.custom_skills.map((skill, i) => (
                    <span key={i} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      {skill}
                      <button type="button" onClick={() => removeCustomSkill(i)} className="text-primary/60 hover:text-primary">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shop address */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">عنوان المحل / الورشة</label>
            <Input
              placeholder="مثال: شارع الثورة، دمشق"
              value={form.shop_address}
              onChange={(e) => setForm({ ...form, shop_address: e.target.value })}
            />
          </div>

          {/* Location on map */}
          <LocationPicker value={location} onChange={setLocation} />

          {/* Home service toggle */}
          <div className="flex items-center justify-between bg-white rounded-xl border p-4">
            <div>
              <p className="font-medium text-sm">خدمة منزلية 🏠</p>
              <p className="text-xs text-muted-foreground">هل تقدم الخدمة في منزل العميل؟</p>
            </div>
            <Switch
              checked={form.offers_home_service}
              onCheckedChange={(v) => setForm({ ...form, offers_home_service: v })}
            />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={loading}>
            {loading ? "جاري الحفظ..." : "إنشاء الملف المهني"}
          </Button>
        </form>
      </div>
    </div>
  );
}