"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
// Hooks and utils
import useMyRunClubs from "../../lib/hooks/useMyRunClubs";
import useClubEvents from "../../lib/hooks/useRunClubEvents";
import { formatMonthYear } from "../../lib/utils/convertTime";
import { useAuth } from "../../providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useIsMobile } from "../../lib/hooks/useIsMobile";
import { useQueryClient } from '@tanstack/react-query'; 
import { formatDividerDate } from "@/app/lib/utils/convertTime";
// Firebase
import { auth } from "@/app/lib/firebase/firebase";
// Components and styles
import EventCreationForm from "../Forms/EventCreationForm";
import RunClubCard from "./RunClubCard";
import LoaderSpinner from "../Loader/LoaderSpinner";
import Modal from "../Modals/Modal";
import SideBar from "./SideBar";
import * as Tabs from "@radix-ui/react-tabs";
import RunClubEventCard from "./RunClubEvent";
import RunClubRegistrationForm from "../Forms/RunClubRegistrationForm";
import styles from "./DashboardClient.module.css";
// Types
import { RunClub } from "../../lib/types/runClub";
import { User } from "firebase/auth";
import { RunClubEvent } from "@/app/lib/types/runClubEvent";
import DashboardEventsHeader from "./DashboardEventsHeader";

export default function DashboardClient() {
  const { user, loading } = useAuth();
  // Memoize userId to prevent re-renders
  const userId = useMemo(() => user?.uid, [user?.uid]);

  if (!user || loading) {
    return (
      <div className={`${styles.page} page--loading container`}>
        <div className="loader fp">
          <LoaderSpinner size={12} />
          <h1 className="h4">Getting your data ready...</h1>
        </div>
      </div>
    );
  }

  // Only render the data-fetching part when auth is ready
  return (
      <DashboardContent userId={userId!} user={user} />
  )
}

function DashboardContent({ userId, user }: { userId: string; user: User }) {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const [editingClub, setEditingClub] = useState<RunClub | null>(null);
  // Handle create/edit event modal
  const [eventModalToShow, setEventModalToShow] = useState<"create" | "update" | null>(null);
  const [editingEvent, setEditingEvent] = useState<RunClubEvent | null>(null);
  // toast states for both modals
  const [eventToast, setEventToast] = useState<{ message: string; type: 'success' | 'error'; countdown?: number | null } | null>(null);
  const [eventToastOpen, setEventToastOpen] = useState(false);
  const [clubToast, setClubToast] = useState<{ message: string; type: 'success' | 'error'; countdown?: number | null } | null>(null);
  const [clubToastOpen, setClubToastOpen] = useState(false);
  const queryClient = useQueryClient();

  // Now these hooks only run once with stable userId
  const { data: clubs = [], isLoading, isError, refetch: refetchClubs } = useMyRunClubs(userId);

  // Memoize clubIds to prevent useClubEvents from re-running
  const clubIds = useMemo(() => {
    const ids = clubs.map((c) => c.id);
    ids.sort();
    return ids;
  }, [clubs]);

  const {
    data: events = [],
    isLoading: eventsLoading,
    isError: eventsError,
  } = useClubEvents(clubIds);

  // Check for mobile
  const isMobile = useIsMobile();

  // Handle modal states
  const openEditEventModal = (event: RunClubEvent) => {
  const latestEvent = events.find(e => e.id === event.id) || event;
  setEditingEvent(latestEvent);
  setEventModalToShow("update");
};

  const closeModal = () => {
    setEventModalToShow(null);
    setEditingEvent(null);
    setEditingClub(null);
  };

const isAnyModalOpen = eventModalToShow || !!editingClub;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.documentElement.style.overflowY = "hidden";
    } else {
      document.documentElement.style.overflowY = "";
    }
  }, [isAnyModalOpen]);

  const handleLogOut = useCallback(async () => {
    await auth.signOut();
    router.replace("/login");
  }, [router]);

  /* Events CRUD and modal states  */
  const handleEventCreated = async () => {
    await queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  const handleEventUpdated = async () => {
  await queryClient.invalidateQueries({ queryKey: ['events'] });
  setEditingEvent(null);
  setEventModalToShow(null);
};

  const handleEventDeleted = async () => {
    await queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  /* Clubs CRUD states  */

  const handleClubDeleted = async (clubId: string) => {
     try {
    // 1. Immediately remove the club from the cache (no refetch needed yet)
    queryClient.setQueryData(['runclubs', userId], (oldClubs: RunClub[] | undefined) => {
      if (!oldClubs) return [];
      return oldClubs.filter(club => club.id !== clubId);
    });

    // 2. Immediately remove events for this club from the cache
    queryClient.setQueryData(['events', clubIds], (oldEvents: RunClubEvent[] | undefined) => {
      if (!oldEvents) return [];
      return oldEvents.filter(event => event.runclub_id !== clubId);
    });

    // 3. Optionally refetch in background to sync with server (no await needed)
    refetchClubs();
    
  } catch (error) {
    console.error("Failed to update cache after club deletion:", error);
  }
  };

   const handleClubEdit = (club: RunClub) => {
    setEditingClub(club);
  };

  /* Handle filter */
  const [selectedClubId, setSelectedClubId] = useState<string | "all">("all");

  const handleFilterChange = useCallback((clubId: string | "all") => {
    setSelectedClubId(clubId);
  }, []);

  // Apply filter before grouping
  const filteredEvents = useMemo(() => {
    if (selectedClubId === "all") return events;
    return events.filter(ev => ev.runclub_id === selectedClubId);
  }, [events, selectedClubId]);


  // Memoize runclubs to prevent unnecessary re-renders of EventCreationForm
  const runclubs = useMemo(() => clubs.map((c) => ({ id: c.id, name: c.name })), [clubs]);


    useEffect(() => {
    document.body.classList.add("page-dashboard");
    return () => {
      document.body.classList.remove("page-dashboard");
    };
  }, []);

  return (
    <>
      <main
        className={`${styles.dashboard} ${isMobile ? styles.mobile : ""}`}
        id="page-top"
        data-testid="dashboard-page"
      >
        <SideBar handleLogOut={handleLogOut} isMobile={isMobile} onEventClicked={() => setEventModalToShow("create")} />
        <div className={`${styles.dashboard__main}`}>
          <div className={`${styles.header}`}>
            <h1 className="h1">{`Welcome to your dashboard ${user.displayName ? ", " + user.displayName.split(" ")[0] : ""} 👋`}</h1>
            <p>
              Here you can manage your clubs and activities.
              Delete or edit existing clubs & events, or create new events and clubs to keep your community active.
            </p>
          </div>
          <Tabs.Root
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="tabs__root tabs__root--fullW"
          >
            <Tabs.List
              className={`tabs__list tabs__list--dark ${activeTab === "overview" ? "slide-left" : "slide-right"}`}
              aria-label="Dashboard Tab Options"
            >
              <Tabs.Trigger className="tabs__trigger" value="overview">
                Overview
              </Tabs.Trigger>
              <Tabs.Trigger className="tabs__trigger" value="events">
                Events ({events.length})
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content className={styles.dashboardStats__content + " tabs__content"} value="overview">
              <div className={styles.dashboardStats}>
                <div className={styles.dashboardStats__header + " fp-col"}>
                  <h6 className="h2">Overview</h6>
                  <p className="txt-body">All your run clubs and events at a glance.</p>
                </div>
                <ul className={`${styles.dashboardStats__list} fp-col`}>
                  <li className={`${styles.dashboardStats__item} ${styles.card_dashboard} fp-col`}>
                    <div className={`${styles.dashboardStats__initials} fp`}>
                      <span className="h3">
                        {user.displayName
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className={`${styles.nameMember} fp`}>
                      <h2 className={`${styles.name} h4`}>{user.displayName}</h2>
                      {user.metadata.creationTime && (
                        <div className={`${styles.since} fp-col`}>
                          <span className="txt-small">Member since</span>
                          <span className="txt-label">{formatMonthYear(user.metadata.creationTime)}</span>
                        </div>
                      )}
                    </div>
                  </li>
                  <li
                    className={`${styles.dashboardStats__item} ${styles.card_dashboard} ${styles.accent} ${styles.simple}`}
                  >
                    <div className={`${styles.inner} fp-col`}>
                      <span className={`${styles.dashboardStats__label} txt-label`}>My events</span>
                      <h3 className="h1">{events.length}</h3>
                    </div>
                  </li>
                  <li className={`${styles.dashboardStats__item} ${styles.card_dashboard} ${styles.simple}`}>
                    <div className={`${styles.inner} fp-col`}>
                      <span className={`${styles.dashboardStats__label} txt-label`}>Active clubs</span>
                      <h4 className="h1">{clubs.length}</h4>
                    </div>
                  </li>
                </ul>
                <div className={`${styles.clubsNevents} list-grid`}>
                  <div className={`${styles.card_dashboard}`}>
                    <div className={`${styles.titlecount} fp`}>
                      <h5 className="h3">Your run clubs</h5>
                      <div className="txt-label card-label card-label--small">{clubs.length}</div>
                    </div>
                    <ul className={`${styles.clubsNevents__list} fp-col`}>
                      {isLoading && <p>Loading your clubs...</p>}
                      {isError && <p>Error loading your clubs. Please try again later.</p>}
                      {clubs.length === 0 && !isLoading && <p>You are not organizing any clubs yet.</p>}
                      {clubs.map((club) => (
                        <RunClubCard key={club.id} club={club} onDeleted={handleClubDeleted} onEdit={handleClubEdit} user={user} />
                      ))}
                    </ul>
                  </div>
                  <div className={`${styles.card_dashboard} ${styles.createEvent} ${styles.dark} fp-col`}>
                    <div className={`${styles.createEvent__title}`}>
                      <h5 className={`${styles.createEvent__title} h3`}>Create an event</h5>
                      <p className="txt-body">Schedule a new run for one of your clubs.</p>
                    </div>
                    <button
                      className={`${styles.createEvent__btn} btn_main accent`}
                      onClick={() => setEventModalToShow("create")}
                    >
                      Create Event
                    </button>
                  </div>
                </div>
              </div>
            </Tabs.Content>
            <Tabs.Content className="tabs__content" value="events">
              <div className={styles.dashboardEvents}>
                <DashboardEventsHeader
                  events={events}
                  clubs={clubs}
                  setEventModalToShow={setEventModalToShow}
                  onFilterChange={handleFilterChange}
                />
                <div className={styles.dashboardEvents__content}>
                  {eventsLoading && (
                    <div className="loader fp">
                      <LoaderSpinner size={8} /> <span className="txt-body">Hang tight. Loading your events...</span>
                    </div>
                  )}
                  {/* Group by date and render a divider per date */}
                  {!eventsError && !eventsLoading && (
                    <ul className={styles.list + " list-grid list-grid--1"}>
                      {(() => {
                        const grouped: Record<string, typeof filteredEvents> = {};
                        for (const ev of filteredEvents) {
                          const key = ev.date ?? "No date";
                          if (!grouped[key]) grouped[key] = [];
                          grouped[key].push(ev);
                        }

                        // Sort date keys ascending (closest to today first). Date string have to be in ISO format
                        const sortedDates = Object.keys(grouped).sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));

                        return sortedDates.map((dateKey) => (
                          <li key={dateKey} className={styles.list__item}>
                            <div className={`${styles.list__divider} fp`}>
                              <span className="h4">{formatDividerDate(dateKey)}</span>
                            </div>

                            <div className={styles.list__item_wrap + " fp-col"}>
                              {grouped[dateKey].map((ev) => {
                                // Find the club for this event
                                const club = clubs.find(c => c.id === ev.runclub_id);

                                return (
                                  <div key={ev.id} className={styles.list__item}>
                                    <RunClubEventCard
                                      event={{
                                        id: ev.id,
                                        title: ev.title,
                                        description: ev.description,
                                        date: ev.date,
                                        startTime: ev.startTime,
                                        endTime: ev.endTime,
                                        locationAddress: ev.locationAddress,
                                        locationUrl: ev.locationUrl,
                                        runclub_id: ev.runclub_id,
                                        runclub: ev.runclub,
                                      }}
                                      onDeleted={handleEventDeleted}
                                      onUpdate={openEditEventModal}
                                      showActions={true}
                                      slug={club?.slug || ''}
                                      club={club}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </li>
                        ));
                      })()}
                    </ul>
                  )}
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </main>
      <Modal
        open={!!eventModalToShow}
        onClose={closeModal}
        ariaLabel={eventModalToShow === "update" ? "Edit event" : "Create event"}
        title={eventModalToShow === "update" ? "Edit event" : "Create an event"}
        noClubsModal={clubs.length === 0}
        toast={eventToast}
        toastOpen={eventToastOpen}
        onToastOpenChange={setEventToastOpen}
      >
        {clubs.length > 0 && eventModalToShow ? (
          <EventCreationForm
            mode={eventModalToShow}
            eventId={editingEvent?.id}
            initialValues={editingEvent}
            runclubs={runclubs}
            onClose={closeModal}
            onEventCreated={handleEventCreated}
            onEventUpdated={handleEventUpdated}
            onToastUpdate={setEventToast}
            onToastOpenChange={setEventToastOpen}
          />
        ) : (
          <div className="center fp-col">
            <h2 className="h3">No clubs available</h2>
            <p className="txt-body">You need to create a run club before you can create events.</p>
            <Link href="/submit" className="btn_main accent"  onClick={closeModal}>
              Register a new club
            </Link>
          </div>
        )}
      </Modal>
      {/* Edit club modal */}
      <Modal 
        open={!!editingClub} 
        onClose={closeModal}
        ariaLabel="Edit run club" 
        isClubsModal={true}
        toast={clubToast}
        toastOpen={clubToastOpen}
        onToastOpenChange={setClubToastOpen}
        title="Edit run club"
        >
        {editingClub && (
          <RunClubRegistrationForm
            mode="update"
            clubId={editingClub.id}
            initialValues={editingClub}
            onEditSuccess={async () => {
              setEditingClub(null); // Close modal
              await refetchClubs(); // get fresh data
            }}
            onToastUpdate={setClubToast}
            onToastOpenChange={setClubToastOpen}
          />
        )}
      </Modal>
    </>
  );
}
