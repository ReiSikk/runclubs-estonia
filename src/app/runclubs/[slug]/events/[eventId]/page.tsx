import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getEventById } from "@/app/lib/queries/currentEvent";
import { getCurrentClub } from "@/app/lib/queries/currentClub";
import EventDetail from "../../../../components/Page-SingleEvent/EventDetail";
import NavBar from "@/app/components/Navbar/NavBar";

type Props = {
  params: Promise<{ slug: string; eventId: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug, eventId } = await params;
    
    const [club, event] = await Promise.all([
      getCurrentClub(slug),
      getEventById(eventId),
    ]);

    if (!club || !event || !club.name || !event.title) {
      return { title: "Event Not Found" };
    }

    if (event.runclub_id !== club.id) {
      return { title: "Event Not Found" };
    }

    return {
      title: `${event.title} | ${club.name}`,
      description: event.description?.slice(0, 160) || `Join ${club.name} for ${event.title}`,
    };
  } catch {
    return { title: "Event Not Found" };
  }
}

export default async function EventPage({ params }: Props) {
  try {
    const { slug, eventId } = await params;

    const [club, event] = await Promise.all([
      getCurrentClub(slug),
      getEventById(eventId),
    ]);

    if (!club || !event) {
      notFound();
    }

    if (event.runclub_id !== club.id) {
      notFound();
    }

    return (
      <div className="page-single-event" id="page-top">
        <NavBar backTo={`/runclubs/${club.slug}`} isBackToClubPage={true}/>
        <EventDetail club={club} event={event} />
      </div>
    )
  } catch (error) {
    console.error("❌ EventPage error:", error);
    notFound();
  }
}