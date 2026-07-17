import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Navigation, ExternalLink } from "lucide-react";

const providerIcon = L.divIcon({
  html: '<div style="font-size: 28px;">🔧</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const customerIcon = L.divIcon({
  html: '<div style="font-size: 28px;">📍</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions]);
  return null;
}

export default function RouteMap({ providerLocation, customerLocation }) {
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(true);
  
  useEffect(() => {
    if (!providerLocation || !customerLocation) {
      setRouteLoading(false);
      return;
    }
    let cancelled = false;
    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${providerLocation.lng},${providerLocation.lat};${customerLocation.lng},${customerLocation.lat}?overview=full&geometries=geojson`
        );
        const data = await res.json();
        if (!cancelled && data.routes?.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRoute({
            coords,
            distance: data.routes[0].distance,
            duration: data.routes[0].duration,
          });
        }
      } catch {}
      if (!cancelled) setRouteLoading(false);
    };
    fetchRoute();
    return () => {
      cancelled = true;
    };
  }, [providerLocation, customerLocation]);
  
  const hasBoth = providerLocation && customerLocation;
  const center = providerLocation || customerLocation;
  if (!center) return null;
  
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${customerLocation.lat},${customerLocation.lng}&travelmode=driving`;
  
  return (
    <div className="bg-card rounded-2xl border p-4 mb-3">
      <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
        <Navigation className="w-4 h-4" /> الطريق إلى موقع العميل
      </h3>
      <div className="rounded-xl overflow-hidden border" style={{ height: 280 }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {providerLocation && (
            <Marker position={[providerLocation.lat, providerLocation.lng]} icon={providerIcon}>
              <Popup>موقعك (المحل)</Popup>
            </Marker>
          )}
          {customerLocation && (
            <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
              <Popup>موقع العميل</Popup>
            </Marker>
          )}
          {route && <Polyline positions={route.coords} color="#2563eb" weight={5} opacity={0.8} />}
          {hasBoth && (
            <FitBounds
              positions={[
                [providerLocation.lat, providerLocation.lng],
                [customerLocation.lat, customerLocation.lng],
              ]}
            />
          )}
        </MapContainer>
      </div>
      {route && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          المسافة: {(route.distance / 1000).toFixed(1)} كم • المدة التقديرية:{" "}
          {Math.round(route.duration / 60)} دقيقة
        </p>
      )}
      {routeLoading && hasBoth && (
        <p className="text-xs text-muted-foreground mt-2 text-center">جاري حساب الطريق...</p>
      )}
      {customerLocation && (
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
          <Button className="w-full rounded-xl" variant="outline">
            <ExternalLink className="w-4 h-4 ml-2" />
            فتح في خرائط Google للملاحة
          </Button>
        </a>
      )}
    </div>
  );
}