import { SanityImageSource } from "@sanity/image-url/lib/types/types";
  
export interface RunClub {
  _id: string;
  name: string;
  logo?: SanityImageSource | '';
  city: string;
  location: string;
  address: string;
  description: string;
  distance: string;
  distanceDescription?: string;
  days: string[];
  slug?: { current: string };
  facebook?: string;
  instagram?: string;
  strava?: string;
  website?: string;
}

export type RunClubs = RunClub[];