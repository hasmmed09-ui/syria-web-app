import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { PlusCircle } from "lucide-react";

export default function RequestJob({ user }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobName, setJobName] = useState("");
  const [description, setDescription] = useState("");
  
  const handleSubmit = async () => {
    if (!jobName.trim()) {
      toast({ title: "يرجى إدخال اسم المهنة", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await base44.entities.JobRequest.create({
        user_id: user?.id || "",
        user_name: user?.full_name || "مستخدم",
        job_name: jobName.trim(),
        description: description.trim(),
      });
      toast({ title: "تم إرسال طلبك ✅", description: "سيتم مراجعة طلبك لإضافة المهنة" });
      setJobName("");
      setDescription("");
      setOpen(false);
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
    setLoading(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
          <PlusCircle className="w-4 h-4" />
          طلب إضافة مهنة جديدة
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>طلب إضافة مهنة</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">اسم المهنة *</label>
            <Input
              placeholder="مثال: صيانة سيارات"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">وصف (اختياري)</label>
            <Textarea
              placeholder="اشرح المهنة التي تريد إضافتها..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">إلغاء</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "جاري الإرسال..." : "إرسال الطلب"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}