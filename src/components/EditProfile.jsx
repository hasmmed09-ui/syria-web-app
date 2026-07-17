import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { SYRIAN_CITIES } from "@/lib/categories";
import { validateSyrianPhone } from "@/lib/phoneValidation";
import { Pencil, Camera } from "lucide-react";

export default function EditProfile({ profile, onUpdated }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: profile.full_name || "",
    phone: profile.phone || "",
    bio: profile.bio || "",
    service_area: profile.service_area || "",
    shop_address: profile.shop_address || "",
    offers_home_service: profile.offers_home_service || false,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(profile.photo_url || null);
  const [phoneError, setPhoneError] = useState("");
  
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };
  
  const handleSave = async () => {
    const phoneCheck = validateSyrianPhone(form.phone);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error);
      return;
    }
    setPhoneError("");
    setLoading(true);
    try {
      let photo_url = profile.photo_url;
      if (photoFile) {
        const res = await base44.integrations.Core.UploadFile({ file: photoFile });
        photo_url = res.file_url;
      }
      const updated = await base44.entities.ProviderProfile.update(profile.id, {
        ...form,
        photo_url,
      });
      await base44.auth.updateMe({ phone: form.phone });
      onUpdated(updated);
      toast({ title: "تم تحديث الملف بنجاح ✅" });
      setOpen(false);
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
    setLoading(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full rounded-xl mb-3">
          <Pencil className="w-4 h-4 ml-2" />
          تعديل المعلومات
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل الملف المهني</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center">
            <label className="relative cursor-pointer">
              <div className="w-20 h-20 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">الاسم الكامل</label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">رقم الهاتف</label>
            <Input
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
            {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">نبذة عنك</label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">منطقة الخدمة</label>
            <Select
              value={form.service_area}
              onValueChange={(v) => setForm({ ...form, service_area: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المدينة" />
              </SelectTrigger>
              <SelectContent>
                {SYRIAN_CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">عنوان المحل</label>
            <Input
              value={form.shop_address}
              onChange={(e) => setForm({ ...form, shop_address: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between bg-muted/50 rounded-xl border p-4">
            <div>
              <p className="font-medium text-sm">خدمة منزلية 🏠</p>
            </div>
            <Switch
              checked={form.offers_home_service}
              onCheckedChange={(v) => setForm({ ...form, offers_home_service: v })}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">إلغاء</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}