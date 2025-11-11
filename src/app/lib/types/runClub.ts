 export interface RunClub {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  city: string;
  location: string;
  address: string;
  description: string;
  distance: string;
  distanceDescription?: string;
  runDays: string[];
  status: "pending" | "approved" | "rejected";
  facebook?: string;
  instagram?: string;
  strava?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type RunClubs = RunClub[];