const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  if (!API_KEY) return null;
  console.log("Geocoding address:", address);

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address); // URL handles encoding
  url.searchParams.set("key", API_KEY);

  // Bias/restrict to Estonia
  url.searchParams.set("region", "ee");
  url.searchParams.set("components", "country:EE");

  const response = await fetch(url.toString());
  const data = await response.json();
  console.log("Geocode response data:", data);
  console.log("Geocode response status:", data.status);

  if (data.status === "OK" && Array.isArray(data.results) && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return { lat: location.lat, lng: location.lng };
  }

  return null;
}