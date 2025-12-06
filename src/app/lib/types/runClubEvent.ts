import { DocumentReference } from "firebase-admin/firestore";


export interface RunClubEvent {
  id: string;
  title: string;
  about: string;
  date: string;
  startTime: string;
  endTime?: string | null;
  locationAddress: string;
  locationUrl?: string | null;
  imageUrl?: string | null;
  tags?: string[];
  distance?: number | null;
  pace?: string | null;
  runclub_id: string;
  // Reference to the RunClub document
  runclub: string | DocumentReference;
  runclub_slug?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type RunClubEvents = RunClubEvent[];