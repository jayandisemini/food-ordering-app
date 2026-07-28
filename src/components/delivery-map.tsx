import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Bike, Compass, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    __qbInitMap?: () => void;
    gm_authFailure?: () => void;
  }
}

const RESTAURANT = { lat: 6.9271, lng: 79.8612, label: "Flame Grill Kitchen" }; // Colombo 03
const CUSTOMER = { lat: 6.9344, lng: 79.8428, label: "Your Location" };

type Props = { progress: number }; // 0..1 along the route

export function DeliveryMap({ progress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const riderRef = useRef<any>(null);
  const drivenRef = useRef<any>(null);
  const pathRef = useRef<any>(null);

  const [useFallback, setUseFallback] = useState(false);
  const [ready, setReady] = useState(false);

  // Catch Google Maps auth failures (e.g. invalid/restricted API keys)
  useEffect(() => {
    window.gm_authFailure = () => {
      console.warn("[DeliveryMap]: Google Maps key auth failed. Switching to Interactive Vector Map.");
      setUseFallback(true);
    };

    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;

    if (!key) {
      setUseFallback(true);
      return;
    }

    if (window.google?.maps) {
      setReady(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-qb-gmaps]");
    window.__qbInitMap = () => setReady(true);

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

  // Initialize Google Maps if valid
  useEffect(() => {
    if (!ready || useFallback || !containerRef.current || mapRef.current) return;

    try {
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

      // Curved route calculation
      const steps = 24;
      const path: { lat: number; lng: number }[] = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lat = RESTAURANT.lat + (CUSTOMER.lat - RESTAURANT.lat) * t;
        const lng = RESTAURANT.lng + (CUSTOMER.lng - RESTAURANT.lng) * t;
        const offset = Math.sin(t * Math.PI) * 0.004;
        path.push({ lat: lat + offset, lng: lng - offset });
      }
      pathRef.current = path;

      new g.Polyline({
        path,
        map,
        strokeColor: "#9CA3AF",
        strokeOpacity: 0.6,
        strokeWeight: 4,
      });

      drivenRef.current = new g.Polyline({
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
        label: { text: "B", color: "#fff", fontWeight: "700" },
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
                <circle cx="22" cy="22" r="8" fill="#fff"/>
              </svg>`
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
    } catch {
      setUseFallback(true);
    }
  }, [ready, useFallback]);

  // Animate Google Map rider position
  useEffect(() => {
    if (!ready || useFallback || !pathRef.current || !riderRef.current) return;
    const path = pathRef.current;
    const target = Math.max(0, Math.min(1, progress));
    const targetIdx = Math.floor(target * (path.length - 1));

    riderRef.current.setPosition(path[targetIdx]);
    if (drivenRef.current) {
      drivenRef.current.setPath(path.slice(0, targetIdx + 1));
    }
  }, [progress, ready, useFallback]);

  const etaMinutes = Math.max(1, Math.round((1 - progress) * 22));

  // Render Fallback Interactive Vector Radar Map if Google Maps fails
  if (useFallback) {
    const clampedProgress = Math.max(0.05, Math.min(0.95, progress));
    // Calculate rider SVG position along curved path
    const riderX = 20 + clampedProgress * 60;
    const riderY = 70 - Math.sin(clampedProgress * Math.PI) * 35;

    return (
      <div className="relative h-64 overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-4 shadow-card text-white">
        {/* Animated Radar Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        {/* Floating Top Status Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3.5 py-1.5 text-xs font-bold backdrop-blur border border-slate-700/60 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
            </span>
            ETA · {etaMinutes} mins
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-[11px] font-bold text-orange-400">
            <Bike className="h-3.5 w-3.5 animate-bounce" /> Live GPS Active
          </span>
        </div>

        {/* Vector SVG Live Route Map */}
        <div className="relative h-44 w-full mt-2">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Dashed Route Path */}
            <path
              d="M 20 70 Q 50 35 80 70"
              fill="none"
              stroke="#475569"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />

            {/* Completed Progress Trajectory Line */}
            <path
              d="M 20 70 Q 50 35 80 70"
              fill="none"
              stroke="#FF6B2C"
              strokeWidth="3.5"
              strokeDasharray="100"
              strokeDashoffset={100 - clampedProgress * 100}
              className="transition-all duration-500"
            />

            {/* Restaurant Marker (A) */}
            <g transform="translate(20, 70)">
              <circle r="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              <text y="3" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold">
                A
              </text>
            </g>

            {/* Customer Location Marker (B) */}
            <g transform="translate(80, 70)">
              <circle r="6" fill="#FF6B2C" stroke="#fff" strokeWidth="2" />
              <text y="3" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold">
                B
              </text>
            </g>

            {/* Live Moving Courier Bike Marker */}
            <g transform={`translate(${riderX}, ${riderY})`} className="transition-all duration-300">
              <circle r="7" fill="#FF6B2C" className="animate-ping opacity-75" />
              <circle r="6" fill="#FF6B2C" stroke="#ffffff" strokeWidth="2" />
              <circle r="2" fill="#ffffff" />
            </g>
          </svg>
        </div>

        {/* Map Bottom Labels */}
        <div className="absolute inset-x-4 bottom-3 z-10 flex items-center justify-between text-[11px] font-bold text-slate-300">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            <span className="truncate max-w-[120px]">Kitchen (A)</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="truncate max-w-[120px]">Your Door (B)</span>
          </div>
        </div>
      </div>
    );
  }

  // Google Maps Component View
  return (
    <div className="relative h-64 overflow-hidden rounded-3xl shadow-card border border-border">
      <div ref={containerRef} className="h-full w-full" />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-surface-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-surface/90 px-3.5 py-1.5 text-xs font-bold backdrop-blur shadow-soft border border-border/50">
        ETA · {etaMinutes} min
      </div>
    </div>
  );
}
