import { useEffect, useRef, useState } from "react";
import { Bike, Sparkles, Navigation, MapPin } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    L?: any;
    __qbInitMap?: () => void;
    gm_authFailure?: () => void;
  }
}

const RESTAURANT = { lat: 6.9271, lng: 79.8612, label: "Flame Grill Kitchen" }; // Colombo 03
const CUSTOMER = { lat: 6.9344, lng: 79.8428, label: "Your Doorstep" };

type Props = { 
  progress: number; // 0..1 along simulated route
  driverCoords?: { lat: number; lng: number };
}; 

export function DeliveryMap({ progress, driverCoords }: Props) {
  const googleContainerRef = useRef<HTMLDivElement>(null);
  const leafletContainerRef = useRef<HTMLDivElement>(null);

  const googleMapRef = useRef<any>(null);
  const googleRiderRef = useRef<any>(null);
  const googleDrivenRef = useRef<any>(null);
  const googlePathRef = useRef<any>(null);

  const leafletMapRef = useRef<any>(null);
  const leafletRiderRef = useRef<any>(null);
  const leafletDrivenRef = useRef<any>(null);

  const [useFallback, setUseFallback] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);

  // 1. Google Maps Script Loading
  useEffect(() => {
    window.gm_authFailure = () => {
      console.warn("[DeliveryMap]: Google Maps key failed authentication. Switching to OpenStreetMap.");
      setUseFallback(true);
    };

    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;

    if (!key) {
      setUseFallback(true);
      return;
    }

    if (window.google?.maps) {
      setGoogleReady(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-qb-gmaps]");
    window.__qbInitMap = () => setGoogleReady(true);

    if (!existing) {
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__qbInitMap${
        channel ? `&channel=${channel}` : ""
      }`;
      s.async = true;
      s.defer = true;
      s.dataset.qbGmaps = "1";
      s.onerror = () => setUseFallback(true);
      document.head.appendChild(s);
    }
  }, []);

  // 2. Leaflet OpenStreetMap Fallback Loader
  useEffect(() => {
    if (!useFallback) return;

    if (window.L) {
      setLeafletReady(true);
      return;
    }

    // Load Leaflet CSS
    if (!document.querySelector("link[data-qb-leaflet-css]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.dataset.qbLeafletCss = "1";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!document.querySelector("script[data-qb-leaflet-js]")) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.dataset.qbLeafletJs = "1";
      script.onload = () => setLeafletReady(true);
      script.onerror = () => console.error("Leaflet load error");
      document.head.appendChild(script);
    }
  }, [useFallback]);

  // 3. Initialize Google Maps
  useEffect(() => {
    if (!googleReady || useFallback || !googleContainerRef.current || googleMapRef.current) return;

    try {
      const g = window.google.maps;
      const map = new g.Map(googleContainerRef.current, {
        center: { lat: (RESTAURANT.lat + CUSTOMER.lat) / 2, lng: (RESTAURANT.lng + CUSTOMER.lng) / 2 },
        zoom: 14,
        disableDefaultUI: true,
        gestureHandling: "greedy",
        clickableIcons: false,
      });
      googleMapRef.current = map;

      const steps = 24;
      const path: { lat: number; lng: number }[] = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lat = RESTAURANT.lat + (CUSTOMER.lat - RESTAURANT.lat) * t;
        const lng = RESTAURANT.lng + (CUSTOMER.lng - RESTAURANT.lng) * t;
        const offset = Math.sin(t * Math.PI) * 0.004;
        path.push({ lat: lat + offset, lng: lng - offset });
      }
      googlePathRef.current = path;

      new g.Polyline({
        path,
        map,
        strokeColor: "#9CA3AF",
        strokeOpacity: 0.6,
        strokeWeight: 4,
      });

      googleDrivenRef.current = new g.Polyline({
        path: [path[0]],
        map,
        strokeColor: "#FF6B2C",
        strokeOpacity: 1,
        strokeWeight: 6,
      });

      new g.Marker({
        position: RESTAURANT,
        map,
        label: { text: "A", color: "#fff", fontWeight: "700" },
      });

      new g.Marker({
        position: CUSTOMER,
        map,
        label: { text: "B", color: "#fff", fontWeight: "700" },
      });

      googleRiderRef.current = new g.Marker({
        position: driverCoords || path[0],
        map,
        zIndex: 999,
      });

      const bounds = new g.LatLngBounds();
      bounds.extend(RESTAURANT);
      bounds.extend(CUSTOMER);
      map.fitBounds(bounds, 60);
    } catch {
      setUseFallback(true);
    }
  }, [googleReady, useFallback]);

  // 4. Initialize Leaflet Real Street Map
  useEffect(() => {
    if (!useFallback || !leafletReady || !leafletContainerRef.current || leafletMapRef.current) return;

    const L = window.L;
    if (!L) return;

    const map = L.map(leafletContainerRef.current, {
      center: [(RESTAURANT.lat + CUSTOMER.lat) / 2, (RESTAURANT.lng + CUSTOMER.lng) / 2],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });
    leafletMapRef.current = map;

    // Use CartoDB Voyager tiles (Real streets, clean dark/light food app style)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    // Calculate route line steps
    const steps = 24;
    const path: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = RESTAURANT.lat + (CUSTOMER.lat - RESTAURANT.lat) * t;
      const lng = RESTAURANT.lng + (CUSTOMER.lng - RESTAURANT.lng) * t;
      const offset = Math.sin(t * Math.PI) * 0.003;
      path.push([lat + offset, lng - offset]);
    }

    // Planned Dashed Path
    L.polyline(path, { color: "#94a3b8", weight: 4, opacity: 0.6, dashArray: "6, 8" }).addTo(map);

    // Driven Path
    leafletDrivenRef.current = L.polyline([path[0]], { color: "#FF6B2C", weight: 6 }).addTo(map);

    // Custom Icon Maker
    const createCustomIcon = (html: string) =>
      L.divIcon({
        html,
        className: "custom-leaflet-marker",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

    // Restaurant A Marker
    L.marker([RESTAURANT.lat, RESTAURANT.lng], {
      icon: createCustomIcon(
        `<div style="background:#0f172a; border:2px solid #38bdf8; color:#fff; font-weight:bold; width:32px; height:32px; border-radius:50%; display:grid; place-items:center; font-size:12px; shadow:0 4px 10px rgba(0,0,0,0.3)">A</div>`
      ),
    }).addTo(map).bindPopup("<b>Flame Grill Kitchen</b><br>Colombo 03");

    // Customer B Marker
    L.marker([CUSTOMER.lat, CUSTOMER.lng], {
      icon: createCustomIcon(
        `<div style="background:#FF6B2C; border:2px solid #fff; color:#fff; font-weight:bold; width:32px; height:32px; border-radius:50%; display:grid; place-items:center; font-size:12px; shadow:0 4px 10px rgba(0,0,0,0.3)">B</div>`
      ),
    }).addTo(map).bindPopup("<b>Your Location</b><br>Kollupitiya");

    const riderStart: [number, number] = driverCoords ? [driverCoords.lat, driverCoords.lng] : path[0];

    // Rider Moving Marker
    leafletRiderRef.current = L.marker(riderStart, {
      icon: createCustomIcon(
        `<div style="background:#FF6B2C; border:3px solid #ffffff; width:36px; height:36px; border-radius:50%; display:grid; place-items:center; color:#fff; shadow:0 4px 14px rgba(255,107,44,0.6)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 6h2a2 2 0 0 1 2 2v7h-2.5"/><path d="M9 17.5H5.5a2.5 2.5 0 0 1-2.5-2.5V9a2 2 0 0 1 2-2h4l3 3h4.5"/></svg>
        </div>`
      ),
    }).addTo(map);

    map.fitBounds(L.latLngBounds(path), { padding: [40, 40] });
  }, [useFallback, leafletReady]);

  // 5. Animate Rider Location along Route or Live Driver GPS Coordinates
  useEffect(() => {
    if (driverCoords) {
      if (!useFallback && googleRiderRef.current) {
        googleRiderRef.current.setPosition(driverCoords);
      }
      if (useFallback && leafletRiderRef.current) {
        leafletRiderRef.current.setLatLng([driverCoords.lat, driverCoords.lng]);
      }
      return;
    }

    const clampedProgress = Math.max(0, Math.min(1, progress));

    if (!useFallback && googleMapRef.current && googlePathRef.current && googleRiderRef.current) {
      const path = googlePathRef.current;
      const idx = Math.floor(clampedProgress * (path.length - 1));
      googleRiderRef.current.setPosition(path[idx]);
      if (googleDrivenRef.current) {
        googleDrivenRef.current.setPath(path.slice(0, idx + 1));
      }
    }

    if (useFallback && leafletMapRef.current && leafletRiderRef.current) {
      const steps = 24;
      const path: [number, number][] = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lat = RESTAURANT.lat + (CUSTOMER.lat - RESTAURANT.lat) * t;
        const lng = RESTAURANT.lng + (CUSTOMER.lng - RESTAURANT.lng) * t;
        const offset = Math.sin(t * Math.PI) * 0.003;
        path.push([lat + offset, lng - offset]);
      }

      const idx = Math.floor(clampedProgress * (path.length - 1));
      leafletRiderRef.current.setLatLng(path[idx]);
      if (leafletDrivenRef.current) {
        leafletDrivenRef.current.setLatLngs(path.slice(0, idx + 1));
      }
    }
  }, [progress, driverCoords, useFallback]);

  const etaMinutes = Math.max(1, Math.round((1 - progress) * 22));

  return (
    <div className="relative h-64 overflow-hidden rounded-3xl shadow-card border border-border">
      {/* Google Maps Container */}
      {!useFallback && <div ref={googleContainerRef} className="h-full w-full" />}

      {/* Leaflet Real Street Map Container */}
      {useFallback && (
        <div className="relative h-full w-full">
          <div ref={leafletContainerRef} className="h-full w-full z-0" />
          {!leafletReady && (
            <div className="absolute inset-0 grid place-items-center bg-surface-muted text-xs font-bold text-muted-foreground">
              Loading Real Street Map...
            </div>
          )}
        </div>
      )}

      {/* Top Floating ETA & Live Badge */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2">
        <div className="rounded-full bg-background/90 px-3.5 py-1.5 text-xs font-bold backdrop-blur shadow-soft border border-border/50 text-foreground">
          ETA · {etaMinutes} min
        </div>
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 text-primary-foreground px-3 py-1 text-[11px] font-bold backdrop-blur shadow-soft">
          <Bike className="h-3.5 w-3.5 animate-bounce" /> Live GPS Tracking
        </span>
      </div>
    </div>
  );
}
