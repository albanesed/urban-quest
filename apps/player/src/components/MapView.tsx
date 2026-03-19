"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { StageProgress } from "@/lib/game-state";

// leaflet really doesn't like being imported server-side,
// and the default marker icons break with webpack — lazy init to avoid SSR crash
const SHADOW_URL = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png";
const MARKER_BASE = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img";
const ICON_OPTS = { iconSize: [25, 41] as [number, number], iconAnchor: [12, 41] as [number, number] };

let _icons: Record<string, L.Icon> | null = null;
function getMarkerIcons() {
  if (!_icons) {
    _icons = {
      locked: new L.Icon({ ...ICON_OPTS, iconUrl: `${MARKER_BASE}/marker-icon-grey.png`, shadowUrl: SHADOW_URL }),
      unlocked: new L.Icon({ ...ICON_OPTS, iconUrl: `${MARKER_BASE}/marker-icon-blue.png`, shadowUrl: SHADOW_URL }),
      in_progress: new L.Icon({ ...ICON_OPTS, iconUrl: `${MARKER_BASE}/marker-icon-orange.png`, shadowUrl: SHADOW_URL }),
      completed: new L.Icon({ ...ICON_OPTS, iconUrl: `${MARKER_BASE}/marker-icon-green.png`, shadowUrl: SHADOW_URL }),
    };
  }
  return _icons;
}

interface PlayerPositionProps {
  lat: number;
  lng: number;
}

function PlayerPosition({ lat, lng }: PlayerPositionProps) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);

  return (
    <Circle
      center={[lat, lng]}
      radius={8}
      pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.8 }}
    />
  );
}

interface MapViewProps {
  progress: StageProgress[];
  playerLat?: number | null;
  playerLng?: number | null;
  activeStageId?: string | null;
}

export default function MapView({
  progress,
  playerLat,
  playerLng,
  activeStageId,
}: MapViewProps) {
  const stagesWithCoords = progress.filter((p) => p.stage);

  // center on first stage or player
  const center: [number, number] =
    playerLat && playerLng
      ? [playerLat, playerLng]
      : stagesWithCoords.length > 0
        ? [stagesWithCoords[0].stage!.latitude, stagesWithCoords[0].stage!.longitude]
        : [45.4485, 8.6197]; // default to Novara

  // route line through all stages in order
  const routePositions: [number, number][] = stagesWithCoords.map((p) => [
    p.stage!.latitude,
    p.stage!.longitude,
  ]);

  return (
    <MapContainer
      center={center}
      zoom={15}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* route line */}
      {routePositions.length > 1 && (
        <Polyline
          positions={routePositions}
          pathOptions={{ color: "#6366f1", weight: 3, dashArray: "10 5" }}
        />
      )}

      {/* stage markers */}
      {stagesWithCoords.map((p) => (
        <Marker
          key={p.stage_id}
          position={[p.stage!.latitude, p.stage!.longitude]}
          icon={getMarkerIcons()[p.status]}
        >
          <Popup>
            <strong>
              {p.stage!.order_index}. {p.stage!.title}
            </strong>
            <br />
            {p.status === "completed"
              ? `✓ ${p.score} punti`
              : p.status === "locked"
                ? "🔒 Bloccata"
                : "📍 Tappa attiva"}
          </Popup>
        </Marker>
      ))}

      {/* proximity circle around active stage */}
      {activeStageId &&
        stagesWithCoords
          .filter((p) => p.stage_id === activeStageId)
          .map((p) => (
            <Circle
              key={`radius-${p.stage_id}`}
              center={[p.stage!.latitude, p.stage!.longitude]}
              radius={p.stage!.radius_m}
              pathOptions={{
                color: "#f59e0b",
                fillColor: "#f59e0b",
                fillOpacity: 0.1,
              }}
            />
          ))}

      {/* player dot */}
      {playerLat && playerLng && (
        <PlayerPosition lat={playerLat} lng={playerLng} />
      )}
    </MapContainer>
  );
}
