"use client";

import React, { useEffect, useRef, useState } from "react";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";

type LatLng = { lat: number; lng: number };

type Props = {
  apiKey?: string;
  initialLatLng?: LatLng | null;
  initialAddress?: string | null;
  initialPlaceId?: string | null;
  onChange?: (value: { latLng: LatLng | null; address: string | null; placeId: string | null }) => void;
  className?: string;
  label?: string;
};

const ESTONIA_BOUNDS = {
  north: 59.676224,
  south: 57.509319,
  east: 28.210026,
  west: 21.832199,
};

function normalizeLatLng(maybe: any): LatLng | null {
  if (!maybe) return null;

  if (typeof maybe.lat === "function" && typeof maybe.lng === "function") {
    return { lat: maybe.lat(), lng: maybe.lng() };
  }
  if (typeof maybe.lat === "number" && typeof maybe.lng === "number") {
    return { lat: maybe.lat, lng: maybe.lng };
  }
  if (typeof maybe.latitude === "number" && typeof maybe.longitude === "number") {
    return { lat: maybe.latitude, lng: maybe.longitude };
  }
  return null;
}

function isWithinEstonia({ lat, lng }: LatLng): boolean {
  return (
    lat >= ESTONIA_BOUNDS.south &&
    lat <= ESTONIA_BOUNDS.north &&
    lng >= ESTONIA_BOUNDS.west &&
    lng <= ESTONIA_BOUNDS.east
  );
}

function PlaceAutocompleteElementField({
  initialAddress,
  initialLatLng,
  initialPlaceId,
  onChange,
}: {
  initialLatLng: LatLng | null;
  initialAddress: string | null;
  initialPlaceId: string | null;
  onChange?: Props["onChange"];
}) {
  // This becomes truthy when "places" is available (loaded by APIProvider)
  const places = useMapsLibrary("places");
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [latLng, setLatLng] = useState<LatLng | null>(initialLatLng);
  const [address, setAddress] = useState<string | null>(initialAddress);
  const [placeId, setPlaceId] = useState<string | null>(initialPlaceId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onChange?.({ latLng, address, placeId });
  }, [latLng, address, placeId, onChange]);

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    async function init() {
      if (!places) return; // wait until loaded
      if (!mountRef.current) return;

      setError(null);

      // Clear container (hot reload safety)
      mountRef.current.innerHTML = "";

      const g = (window as any).google;
      const PlaceAutocompleteElementCtor = g?.maps?.places?.PlaceAutocompleteElement;
      if (!PlaceAutocompleteElementCtor) {
        setError("PlaceAutocompleteElement is not available. Ensure Places API is enabled.");
        return;
      }

      const el: any = new PlaceAutocompleteElementCtor({
        componentRestrictions: { country: "ee" },
        locationRestriction: ESTONIA_BOUNDS,
      });

      el.placeholder = "Search a location in Estonia…";
      el.style.width = "100%";
      el.style.background = "#faf3e0";
      el.style.borderRadius = "8px";
      el.style.setProperty("color-scheme", "light");
      el.colorScheme = "light";

      mountRef.current.appendChild(el);

      const handler = async (evt: any) => {
        try {
          // Depending on event name, payload differs; support both
          const placePrediction = evt?.placePrediction ?? evt?.detail?.placePrediction;
          const directPlace = evt?.place ?? evt?.detail?.place;

          const place = placePrediction ? placePrediction.toPlace() : directPlace;
          if (!place) {
            setError("No place returned from selection.");
            return;
          }

          if (typeof place.fetchFields === "function") {
            await place.fetchFields({ fields: ["displayName", "formattedAddress", "location", "id"] });
          }

          const next = normalizeLatLng(place.location);
          if (!next) {
            setError("Selected place has no coordinates.");
            return;
          }

          if (!isWithinEstonia(next)) {
            setError("Please select a location within Estonia.");
            return;
          }

          setError(null);
          setLatLng(next);
          setAddress(place.formattedAddress ?? place.displayName ?? null);
          setPlaceId(place.id ?? null);
        } catch {
          setError("Failed to process selected place.");
        }
      };

      el.addEventListener("gmp-select", handler);
      el.addEventListener("gmp-placeselect", handler);

      cleanup = () => {
        el.removeEventListener("gmp-select", handler);
        el.removeEventListener("gmp-placeselect", handler);
      };
    }

    init();
    return () => cleanup?.();
  }, [places]);

  return (
    <>
      <div ref={mountRef} />

      {error && (
        <div style={{ color: "#b42318", fontSize: 13, marginTop: 8 }} role="alert">
          {error}
        </div>
      )}

      {/* Hidden fields for saveEvent(formData) */}
      <input type="hidden" name="locationAddress" value={address ?? ""} />
    </>
  );
}

export default function EventLocationPicker({
  apiKey,
  initialLatLng = null,
  initialAddress = null,
  initialPlaceId = null,
  onChange,
  className,
  label = "Event location",
}: Props) {
  const key = apiKey ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    return (
      <div className={className} role="alert" style={{ color: "#b42318" }}>
        Missing <code>API Key</code>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="rcForm__label">
        <span>{label}</span> <span className="rcForm__required" aria-hidden="true">*</span>
      </label>

      <APIProvider apiKey={key} libraries={["places"]}>
        <PlaceAutocompleteElementField
          initialLatLng={initialLatLng}
          initialAddress={initialAddress}
          initialPlaceId={initialPlaceId}
          onChange={onChange}
        />
      </APIProvider>
    </div>
  );
}