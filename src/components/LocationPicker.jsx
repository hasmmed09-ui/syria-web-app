import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { MapPin, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(
    value ? { lat: value.lat, lng: value.lng } : null
  );
  const [mapCenter] = useState([33.5138, 36.2765]); // Damascus default
  
  const handleLocationSelect = (pos) => {
    setPosition(pos);
    onChange?.(pos);
  };
  
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          handleLocationSelect(loc);
        },
        () => {}
      );
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />
          الموقع
        </label>
        <Button type="button" variant="ghost" size="sm" onClick={getCurrentLocation} className="text-xs gap-1">
          <Crosshair className="w-3.5 h-3.5" />
          موقعي الحالي
        </Button>
      </div>
      <div className="h-48 rounded-xl overflow-hidden border">
        <MapContainer
          center={position ? [position.lat, position.lng] : mapCenter}
          zoom={13}
          className="h-full w-full"
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          {position && <Marker position={[position.lat, position.lng]} />}
        </MapContainer>
      </div>
      {position && (
        <p className="text-xs text-muted-foreground">
          {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
        </p>
      )}
    </div>
  );
}