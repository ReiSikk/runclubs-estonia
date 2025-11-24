export interface RunClubEvent {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  date: string;
  time: string;
  location: string;
  runclub_id?: string;
  status?: "approved" | "in_review" | "draft";
};

export type RunClubEvents = RunClubEvent[];