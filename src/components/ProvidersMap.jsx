import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import ProviderPopup from "@/components/ProviderPopup";
import { getCategoryEmoji } from "@/lib/categories";

const providerIcon = (skill, offersHome) => {
  const emoji = getCategoryEmoji(skill);
  const homeBadge = offersHome ?
    `<div style="position:absolute;bottom:-3px;right:-3px;width:16px;height:16px;border-radius:50%;background:#22c55e;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:9px;line-height:1;">🏠</div>` :
    "";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:38px;height:38px;border-radius:50%;background:white;border:2px solid #2563eb;display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${emoji}</div>${homeBadge}`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

const customerIcon = L.divIcon({
  className: "",
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function ProvidersMap({ providers = [], customerLocation, enableOrder = false, center: centerProp }) {
  const center = centerProp ?
    [centerProp.lat, centerProp.lng] :
    customerLocation ?
    [customerLocation.lat, customerLocation.lng] :
    [33.5138, 36.2765];
  
  return (
    <div className="h-64 rounded-xl overflow-hidden border">
      <MapContainer
        center={center}
        zoom={customerLocation || centerProp ? 13 : 11}
        className="h-full w-full"
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {providers.map((p) =>
          p.latitude && p.longitude ? (
            <Marker
              key={p.id}
              position={[p.latitude, p.longitude]}
              icon={providerIcon(p.skills?.[0], p.offers_home_service)}
            >
              <Popup>
                <ProviderPopup provider={p} enableOrder={enableOrder} />
              </Popup>
            </Marker>
          ) : null
        )}
        {customerLocation && (
          <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
            <Popup>موقعك</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}