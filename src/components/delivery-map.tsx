import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: any;
    __qbInitMap?: () => void;
  }
}

const RESTAURANT = { lat: 6.9271, lng: 79.8612 }; // Colombo
const CUSTOMER = { lat: 6.9344, lng: 79.8428 };

type Props = { progress: number }; // 0..1 along the route

export function DeliveryMap({ progress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const riderRef = useRef<any>(null);
  const pathRef = useRef<any>(null);
  const drivenRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load script once
  useEffect(() => {
    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
    if (!key) {
      setError("Map unavailable");
      return;
    }
    if (window.google?.maps) {
      setReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>("script[data-qb-gmaps]");
    window.__qbInitMap = () => setReady(true);
    if (existing) return;
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__qbInitMap${channel ? `&channel=${channel}` : ""}`;
    s.async = true;
    s.defer = true;
    s.dataset.qbGmaps = "1";
    s.onerror = () => setError("Failed to load map");
    document.head.appendChild(s);
  }, []);

  // Init map
  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;
    const g = window.google.maps;

    const map = new g.Map(containerRef.current, {
      center: { lat: (RESTAURANT.lat + CUSTOMER.lat) / 2, lng: (RESTAURANT.lng + CUSTOMER.lng) / 2 },
      zoom: 14,
      disableDefaultUI: true,
      gestureHandling: "greedy",
      clickableIcons: false,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });
    mapRef.current = map;

    // Build a curved-ish polyline between the two points
    const steps = 24;
    const path: { lat: number; lng: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = RESTAURANT.lat + (CUSTOMER.lat - RESTAURANT.lat) * t;
      const lng = RESTAURANT.lng + (CUSTOMER.lng - RESTAURANT.lng) * t;
      // little arc
      const offset = Math.sin(t * Math.PI) * 0.004;
      path.push({ lat: lat + offset, lng: lng - offset });
    }
    pathRef.current = path;

    new g.Polyline({
      path,
      map,
      geodesic: false,
      strokeColor: "#9CA3AF",
      strokeOpacity: 0,
      icons: [
        {
          icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3, strokeColor: "#9CA3AF" },
          offset: "0",
          repeat: "12px",
        },
      ],
    });

    drivenRef.current = new g.Polyline({
      path: [path[0]],
      map,
      geodesic: false,
      strokeColor: "#FF6B2C",
      strokeOpacity: 1,
      strokeWeight: 5,
    });

    new g.Marker({
      position: RESTAURANT,
      map,
      label: { text: "A", color: "#fff", fontWeight: "700", fontSize: "12px" },
      icon: {
        path: g.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#1f2937",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
      },
    });

    new g.Marker({
      position: CUSTOMER,
      map,
      label: { text: "B", color: "#fff", fontWeight: "700", fontSize: "12px" },
      icon: {
        path: g.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#FF6B2C",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
      },
    });

    riderRef.current = new g.Marker({
      position: path[0],
      map,
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="#FF6B2C" stroke="#fff" stroke-width="3"/>
              <g transform="translate(10 10)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="5" cy="17" r="3"/>
                <circle cx="19" cy="17" r="3"/>
                <path d="M5 17h6l4-7h3"/>
                <path d="M14 6h3l2 4"/>
                <path d="M19 17l-3-7"/>
              </g>
            </svg>`,
          ),
        scaledSize: new g.Size(44, 44),
        anchor: new g.Point(22, 22),
      },
      zIndex: 999,
    });


    const bounds = new g.LatLngBounds();
    bounds.extend(RESTAURANT);
    bounds.extend(CUSTOMER);
    map.fitBounds(bounds, 60);
  }, [ready]);

  // Animate rider along progress
  useEffect(() => {
    if (!ready || !pathRef.current || !riderRef.current) return;
    const path = pathRef.current;
    const target = Math.max(0, Math.min(1, progress));
    const targetIdx = Math.floor(target * (path.length - 1));
    let i = 0;
    const interval = setInterval(() => {
      i++;
      const idx = Math.min(targetIdx, i);
      riderRef.current.setPosition(path[idx]);
      drivenRef.current.setPath(path.slice(0, idx + 1));
      if (idx >= targetIdx) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [progress, ready]);

  if (error) {
    return (
      <div className="grid h-64 place-items-center rounded-3xl bg-surface-muted text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <div className="relative h-64 overflow-hidden rounded-3xl shadow-card">
      <div ref={containerRef} className="h-full w-full" />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-surface-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-bold backdrop-blur shadow-soft">
        ETA · {Math.max(1, Math.round((1 - progress) * 22))} min
      </div>
    </div>
  );
}
