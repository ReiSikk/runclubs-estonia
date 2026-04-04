"use client";

import React, { useEffect, useState } from "react";
import { AdvancedMarker, APIProvider, Map, useAdvancedMarkerRef, InfoWindow } from "@vis.gl/react-google-maps";
import geocodeAddress from "../../lib/utils/geocodeService";

type LatLng = { lat: number; lng: number };

type Props = {
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  placeId?: string | null;
  className?: string;
  height?: number;
  zoom?: number;
};

const ESTONIA_CENTER: LatLng = { lat: 58.5953, lng: 25.0136 };

export default function EventLocationMap({ address, lat, lng, placeId, className, zoom = 15 }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  const [coords, setCoords] = useState<LatLng | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [infoWindowOpen, setInfoWindowOpen] = useState(true);
  const [markerRef, marker] = useAdvancedMarkerRef();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Use persisted event coordinates first; this avoids ambiguity from text geocoding.
      if (typeof lat === "number" && typeof lng === "number") {
        setCoords({ lat, lng });
        setError(null);
        setLoading(false);
        return;
      }

      const trimmed = address?.trim();
      if (!trimmed) {
        setCoords(undefined);
        setError("Missing location address.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await geocodeAddress(trimmed, placeId ?? null);
        if (cancelled) return;

        if (!result) {
          setCoords(undefined);
          setError("Could not find coordinates for this address.");
          return;
        }

        setCoords(result);
      } catch {
        if (!cancelled) {
          setCoords(undefined);
          setError("Failed to geocode address.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [address, lat, lng, placeId]);

  // Ensure InfoWindow is open once we actually have coordinates (and after the marker mounts)
  useEffect(() => {
    if (coords && marker) setInfoWindowOpen(true);
  }, [coords, marker]);

  const handleMarkerClick = () => setInfoWindowOpen(true);
  const handleMarkerClose = () => setInfoWindowOpen(false);

  if (!apiKey) {
    return (
      <div className={className} role="alert" style={{ color: "#ff0000" }}>
        Missing Google Maps API key.
      </div>
    );
  }

  const center = coords || ESTONIA_CENTER;

  return (
    <div className="eventMap">
      <APIProvider apiKey={apiKey}>
        <Map mapId={mapId} defaultZoom={zoom} center={center} gestureHandling={"greedy"} disableDefaultUI>
          {coords && (
            <>
              <AdvancedMarker ref={markerRef} position={coords} onClick={handleMarkerClick}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#e2572c",
                    border: "2px solid #100f0e",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.28)",
                  }}
                />
              </AdvancedMarker>
                {infoWindowOpen && (
                <InfoWindow
                  anchor={marker}
                  onCloseClick={handleMarkerClose}
                  maxWidth={350}
                  ariaLabel={`Event location description pop-up, the event address is: ${address}`}
                  className="eventMap__infoWindow"
                >
                  <h4>Event address</h4>
                  <p>{address}</p>
                </InfoWindow>
              )}
            </>
          )}
        </Map>
      </APIProvider>

      {loading && <div style={{ marginTop: 8, fontSize: 13 }}>Loading map…</div>}
      {error && (
        <div style={{ marginTop: 8, fontSize: 13, color: "#ff0000" }} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
