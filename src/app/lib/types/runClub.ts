 export interface RunClub {
  id: string;
  name: string;
  logo?: string;
  city: string;
  location: string;
  address: string;
  description: string;
  distance: string;
  distanceDescription?: string;
  days: string[];
  status: "pending" | "approved" | "rejected";
  slug?: { current: string };
  facebook?: string;
  instagram?: string;
  strava?: string;
  website?: string;
}

export type RunClubs = RunClub[];