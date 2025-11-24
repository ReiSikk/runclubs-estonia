export interface RunClubEvent {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  date: string;
  time: string;
  location: string;
  runclub_id?: string;
};

export type RunClubEvents = RunClubEvent[];