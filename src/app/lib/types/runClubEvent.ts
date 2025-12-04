import { DocumentReference } from "firebase-admin/firestore";


export interface RunClubEvent {
  id: string;
  title: string;
  about: string;
  date: string;
  startTime: string;
  endTime?: string | null;
  locationName: string;
  locationUrl?: string | null;
 // Reference to the RunClub document
  runclub_id: string;
  runclub: string | DocumentReference;
  createdAt?: string;
  updatedAt?: string;
};

export type RunClubEvents = RunClubEvent[];