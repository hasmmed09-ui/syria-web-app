import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { SYRIAN_CITIES, CITY_AREAS, CITY_COORDS, CATEGORIES } from "@/lib/categories";
import ProvidersMap from "@/components/ProvidersMap";
import { ChevronDown, Loader2, MapPin } from "lucide-react";

export default function FindServices() {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedTown, setSelectedTown] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!selectedCategory) {
      setProviders([]);
      return;
    }
    setLoading(true);
    const load = async () => {
      try {
        const all = await base44.entities.ProviderProfile.filter({ status: "approved" });
        const filtered = all.filter(
          (p) => p.latitude && p.longitude && p.skills?.includes(selectedCategory)
        );
        setProviders(filtered);
      } catch {
        setProviders([]);
      }
      setLoading(false);
    };
    load();
  }, [selectedCategory]);
  
  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedTown("");
  };
  
  const mapCenter =
    selectedCity && CITY_COORDS[selectedCity] ?
    { lat: CITY_COORDS[selectedCity][0], lng: CITY_COORDS[selectedCity][1] } :
    null;
  
  return (
    <div className="px-4">
      <h2 className="font-semibold text-lg mb-3">ابحث عن خدمة</h2>

      {/* Service category selector */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-1.5 block">نوع الخدمة</label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => {
            const selected = selectedCategory === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCategory(selected ? "" : cat.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                  selected ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <cat.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* City selector (optional, for map centering) */}
      <div className="mb-3">
        <label className="text-sm font-medium mb-1.5 block">المدينة (اختياري)</label>
        <div className="relative">
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full appearance-none bg-card border border-border rounded-xl px-4 py-3 pr-4 pl-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">كل سوريا</option>
            {SYRIAN_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Town selector */}
      {selectedCity && CITY_AREAS[selectedCity] && (
        <div className="mb-3">
          <label className="text-sm font-medium mb-1.5 block">المنطقة</label>
          <div className="relative">
            <select
              value={selectedTown}
              onChange={(e) => setSelectedTown(e.target.value)}
              className="w-full appearance-none bg-card border border-border rounded-xl px-4 py-3 pr-4 pl-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">كل المناطق</option>
              {CITY_AREAS[selectedCity].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      )}

      {/* Map */}
      {selectedCategory && (
        <div>
          {loading ? (
            <div className="h-64 rounded-xl border flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <ProvidersMap providers={providers} center={mapCenter} enableOrder={true} />
              {providers.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground mt-3">
                  لا يوجد مقدمو خدمات من هذا النوع بعد
                </p>
              ) : (
                <p className="text-center text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3" />
                  اضغط على علامة 🏠 لعرض التفاصيل والطلب
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}