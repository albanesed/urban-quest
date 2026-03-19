"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  watching: boolean;
  startWatching: () => void;
  stopWatching: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocalizzazione non supportata dal browser");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setError(null);
      },
      (err) => {
        // these error messages are more helpful than the default ones
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Permesso di geolocalizzazione negato");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Posizione non disponibile");
            break;
          case err.TIMEOUT:
            setError("Timeout nel recupero della posizione");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
    watchIdRef.current = id;
    setWatching(true);
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setWatching(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    position,
    error,
    watching,
    startWatching,
    stopWatching,
  };
}
