 export interface RunClub {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  startTime?: string;
  city: string;
  area: string;
  address: string;
  description: string;
  distance: string;
  distanceDescription?: string;
  runDays: string[];
  approvedForPublication: boolean;
  facebook?: string;
  instagram?: string;
  strava?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
  creator_id?: string;
  email: string;
}

export type RunClubs = RunClub[];