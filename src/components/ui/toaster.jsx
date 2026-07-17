import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function ToastItem({ id, title, description, action, variant, dismiss }) {
  const [swipeX, setSwipeX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;

  useEffect(() => {
    const timer = setTimeout(() => dismissRef.current(id), 5000);
    return () => clearTimeout(timer);
  }, [id]);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    setDragging(true);
  };

  const onTouchMove = (e) => {
    if (!dragging) return;
    currentX.current = e.touches[0].clientX;
    setSwipeX(currentX.current - startX.current);
  };

  const onTouchEnd = () => {
    setDragging(false);
    const delta = currentX.current - startX.current;
    if (Math.abs(delta) > 100) {
      dismissRef.current(id);
    } else {
      setSwipeX(0);
    }
  };

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg",
        !dragging && "transition-transform duration-200",
        variant === "destructive"
          ? "border-destructive bg-destructive text-destructive-foreground"
          : "border bg-background text-foreground"
      )}
      style={{ transform: `translateX(${swipeX}px)`, touchAction: "pan-y" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {action}
      <button
        onClick={() => dismissRef.current(id)}
        className="absolute right-2 top-2 z-10 rounded-full p-1.5 bg-muted text-foreground/80 hover:bg-muted/70 hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts
        .filter((t) => t.open !== false)
        .map(({ id, title, description, action, variant }) => (
          <ToastItem
            key={id}
            id={id}
            title={title}
            description={description}
            action={action}
            variant={variant}
            dismiss={dismiss}
          />
        ))}
    </div>
  );
}