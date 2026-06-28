"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Company } from "@/data/companies";
import { companyIconSvg, CATEGORY_COLOR } from "@/components/companyIcons";

// Pune bounding box: [[minLng, minLat], [maxLng, maxLat]] — locks pan/zoom to the city.
const PUNE_BOUNDS: [[number, number], [number, number]] = [
  [73.74, 18.43],
  [73.99, 18.65],
];
const PUNE_CENTER: [number, number] = [73.8567, 18.5204];
const LOCATE_ZOOM = 15;

function isWithinPuneBounds(lng: number, lat: number): boolean {
  const [[minLng, minLat], [maxLng, maxLat]] = PUNE_BOUNDS;
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
}

const LOCATE_ICON_SVG = `<svg style="width:100%;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>`;

class LocateControl implements mapboxgl.IControl {
  private container: HTMLDivElement;
  private button: HTMLButtonElement;

  constructor(onClick: () => void) {
    this.container = document.createElement("div");
    this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.className = "locate-ctrl-btn";
    this.button.setAttribute("aria-label", "Find my location");
    this.button.innerHTML = LOCATE_ICON_SVG;
    this.button.addEventListener("click", onClick);

    this.container.appendChild(this.button);
  }

  onAdd() {
    return this.container;
  }

  onRemove() {
    this.container.parentNode?.removeChild(this.container);
  }

  setLoading(loading: boolean) {
    this.button.classList.toggle("is-loading", loading);
  }
}

// Permanent tilted 3D camera angle, matching the look chosen in Mapbox Studio.
const DEFAULT_PITCH = 60;
const DEFAULT_BEARING = -20;
const DEFAULT_ZOOM = 15.5;
const SELECTED_ZOOM = 16.5;

// Mirrors the "basemap" import config set in Mapbox Studio. Re-applied here so the
// look doesn't depend on the Studio style cache (CDN/browser) being fresh.
const BASEMAP_CONFIG: Record<string, unknown> = {
  theme: "default",
  lightPreset: "dawn",
  show3dFacades: true,
  showIndoor: false,
  showPlaceLabels: false,
  showPointOfInterestLabels: false,
  showTransitLabels: true,
  showAdminBoundaries: false,
  showPedestrianRoads: true,
  showRoadLabels: true,
  colorTrunks: "hsl(235, 0%, 100%)",
  colorRoads: "hsl(224, 0%, 100%)",
  colorMotorways: "hsl(214, 0%, 100%)",
};

function buildPopupContent(company: Company, color: string): HTMLElement {
  const card = document.createElement("div");
  card.className = "cp-card";

  const header = document.createElement("div");
  header.className = "cp-header";

  const icon = document.createElement("div");
  icon.className = "cp-icon";
  icon.style.background = color;
  icon.innerHTML = companyIconSvg(company.category);

  const titleBlock = document.createElement("div");
  const name = document.createElement("div");
  name.className = "cp-name";
  name.textContent = company.name;
  const category = document.createElement("div");
  category.className = "cp-category";
  category.textContent = company.category;
  category.style.background = `color-mix(in srgb, ${color} 16%, white)`;
  category.style.color = color;
  titleBlock.append(name, category);

  header.append(icon, titleBlock);

  const address = document.createElement("div");
  address.className = "cp-address";
  address.textContent = company.address;

  card.append(header, address);
  return card;
}

function buildMarkerElement(company: Company): HTMLDivElement {
  const color = CATEGORY_COLOR[company.category];
  const el = document.createElement("div");
  el.className = "company-marker";
  // Set explicit size inline so the badge can't accidentally collapse to its
  // icon's intrinsic size if the stylesheet hasn't loaded yet.
  el.style.width = "18px";
  el.style.height = "18px";
  el.style.borderRadius = "25%";
  el.style.backgroundColor = color;
  el.title = company.name; // native hover tooltip
  el.innerHTML = companyIconSvg(company.category, 12);
  return el;
}

export function PuneMap({
  companies,
  selectedId,
}: {
  companies: Company[];
  selectedId?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const openMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set — add it to .env.local");
      return;
    }
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/tanmaysarkar/cmqx5x2jd004r01se30y1bncu",
      center: PUNE_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
      minZoom: 11,
      maxZoom: 20,
      maxBounds: PUNE_BOUNDS,
    });
    mapRef.current = map;

    map.on("style.load", () => {
      for (const [key, value] of Object.entries(BASEMAP_CONFIG)) {
        map.setConfigProperty("basemap", key, value);
      }
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    function locateUser() {
      if (!("geolocation" in navigator)) return;
      locateControl.setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          locateControl.setLoading(false);
          const { longitude, latitude } = position.coords;
          if (!isWithinPuneBounds(longitude, latitude)) return; // outside the map's coverage — keep the default Pune view

          if (userMarkerRef.current) {
            userMarkerRef.current.setLngLat([longitude, latitude]);
          } else {
            const el = document.createElement("div");
            el.className = "user-location-dot";
            el.title = "Your location";
            userMarkerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([longitude, latitude]).addTo(map);
          }
          map.flyTo({ center: [longitude, latitude], zoom: LOCATE_ZOOM, essential: true });
        },
        () => locateControl.setLoading(false), // permission denied or unavailable — keep the default Pune view
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
    const locateControl = new LocateControl(locateUser);
    map.addControl(locateControl, "top-right");
    map.on("load", () => locateUser()); // best-effort: only prompts if permission hasn't already been decided

    const markers = markersRef.current;
    for (const company of companies) {
      if (company.lng == null || company.lat == null) continue;

      const color = CATEGORY_COLOR[company.category];
      const el = buildMarkerElement(company);
      const popup = new mapboxgl.Popup({ offset: 18, className: "company-popup" }).setDOMContent(
        buildPopupContent(company, color)
      );

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([company.lng, company.lat])
        .setPopup(popup)
        .addTo(map);

      markers.set(company.id, marker);
    }

    // Resize the canvas whenever the container changes size (e.g. sidebar toggling).
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markers.clear();
      userMarkerRef.current = null;
    };
  }, [companies]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const marker = markersRef.current.get(selectedId);
    if (!marker) return;

    if (openMarkerRef.current?.getPopup()?.isOpen()) {
      openMarkerRef.current.togglePopup();
    }

    const { lng, lat } = marker.getLngLat();
    map.flyTo({ center: [lng, lat], zoom: SELECTED_ZOOM, essential: true });
    marker.togglePopup();
    openMarkerRef.current = marker;
  }, [selectedId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
