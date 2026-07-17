import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Phone, MapPin, Home, Wrench } from "lucide-react";
import { getCategoryById } from "@/lib/categories";

export default function ProviderPopup({ provider, enableOrder = false }) {
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState(provider.skills?.[0] || "");
  
  return (
    <div dir="rtl" className="min-w-[200px] max-w-[240px]">
      <div className="font-bold text-sm mb-1">{provider.full_name}</div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
        <MapPin className="w-3 h-3 shrink-0" />
        <span>{provider.service_area}</span>
      </div>

      {provider.avg_rating > 0 && (
        <div className="flex items-center gap-1 text-xs mb-2">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{provider.avg_rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({provider.total_ratings} تقييم)</span>
        </div>
      )}

      {provider.bio && (
        <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{provider.bio}</p>
      )}

      {provider.skills?.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-medium mb-1">الخدمات:</p>
          <div className="flex flex-wrap gap-1">
            {provider.skills.map((skill) => {
              const cat = getCategoryById(skill);
              return (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                    selectedSkill === skill
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {provider.offers_home_service ? (
        <div className="flex items-center gap-1 text-xs text-green-600 font-medium mb-2">
          <Home className="w-3 h-3" /> خدمة منزلية متاحة
        </div>
      ) : (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Wrench className="w-3 h-3" /> خدمة في المحل فقط
        </div>
      )}

      <div className="flex items-center gap-1 text-xs mb-2 text-muted-foreground">
        <Phone className="w-3 h-3" />
        <span dir="ltr">{provider.phone}</span>
      </div>

      {enableOrder && provider.offers_home_service && selectedSkill && (
        <button
          onClick={() => navigate(`/new-request?category=${selectedSkill}&provider_id=${provider.id}`)}
          className="w-full bg-primary text-primary-foreground text-xs font-medium py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          اطلب هذه الخدمة
        </button>
      )}
    </div>
  );
}