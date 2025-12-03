import { DocumentReference } from "firebase-admin/firestore";


export interface RunClubEvent {
  id: string;
  title: string;
  about: string;
  date: string;
  time: string;
  location: string;
  locationUrl?: string;
 // Reference to the RunClub document
  runclub_id: string;
  runclub: string | DocumentReference;
  createdAt?: string;
  updatedAt?: string;
};

export type RunClubEvents = RunClubEvent[];