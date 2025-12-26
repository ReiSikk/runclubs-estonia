import { DocumentReference } from "firebase-admin/firestore";


export interface RunClubEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime?: string | null;
  locationAddress: string;
  // Reference to the RunClub document
  runclub: string | DocumentReference;
  runclub_slug?: string;
  runclub_id: string;
  image?: string | null;
  tags?: string[];
  distance?: number | undefined;
  pace?: string | undefined;
  createdAt?: string;
  updatedAt?: string;
};

export type RunClubEvents = RunClubEvent[];