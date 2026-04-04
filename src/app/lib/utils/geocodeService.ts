const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default async function geocodeAddress(
  address: string,
  placeId?: string | null
): Promise<{ lat: number; lng: number } | null> {
  if (!API_KEY) return null;

  const fetchCoords = async (url: URL): Promise<{ lat: number; lng: number } | null> => {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === "OK" && Array.isArray(data.results) && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }

    return null;
  };

  // Place ID is canonical for Google Places selections; prefer it over free-text geocoding.
  if (placeId) {
    const placeUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    placeUrl.searchParams.set("place_id", placeId);
    placeUrl.searchParams.set("key", API_KEY);

    const placeResult = await fetchCoords(placeUrl);
    if (placeResult) return placeResult;
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address); // URL handles encoding
  url.searchParams.set("key", API_KEY);

  // Bias/restrict to Estonia
  url.searchParams.set("region", "ee");
  url.searchParams.set("components", "country:EE");

  return fetchCoords(url);
}