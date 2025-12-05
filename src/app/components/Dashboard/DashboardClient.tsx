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
// Firebase
import { auth } from "@/app/lib/firebase/firebase";
// Components and styles
import EventCreationForm from "../Forms/EventCreationForm";
import RunClubCard from "./RunClubCard";
import LoaderSpinner from "../Loader/LoaderSpinner";
import Modal from "../Modals/Modal";
import SideBar from "./SideBar";
import * as Tabs from "@radix-ui/react-tabs";
import { LucidePlus } from "lucide-react";
import RunClubEventCard from "./RunClubEvent";
import RunClubRegistrationForm from "../Forms/RunClubRegistrationForm";
import styles from "./DashboardClient.module.css";
// Types
import { RunClub } from "../../lib/types/runClub";
import { User } from "firebase/auth";

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
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [editingClub, setEditingClub] = useState<RunClub | null>(null);

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
    refetch: refetchEvents,
  } = useClubEvents(clubIds);

  // Check for mobile
  const isMobile = useIsMobile();
  // Check if any modal is active
  const isAnyModalOpen = showCreateEvent || !!editingClub;

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

  const handleEventDeleted = async () => {
    await refetchEvents();
  };

  const handleEventCreated = async () => {
    await refetchEvents();
  };

  const handleClubDeleted = async () => {
    await refetchClubs();
    await refetchEvents();
  };

  const handleClubEdit = (club: RunClub) => {
    setEditingClub(club);
  };

  const openEventModal = () => {
    setShowCreateEvent(true);
  };

  return (
    <>
      <main
        className={`${styles.dashboard} ${isMobile ? styles.mobile : ""}`}
        id="page-top"
        data-testid="dashboard-page"
      >
        <SideBar handleLogOut={handleLogOut} isMobile={isMobile} onEventClicked={openEventModal} />
        <div className={`${styles.dashboard__main}`}>
          <div className={`${styles.header}`}>
            <h1 className="h1">Welcome to your dashboard, {user.displayName?.split(" ")[0] || ""}! 👋</h1>
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
                <ul className={`${styles.dashboardStats__list} list-grid list-grid--3`}>
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
                      <div className="txt-label card-label--small">{clubs.length}</div>
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
                      onClick={() => setShowCreateEvent(true)}
                    >
                      Create Event
                    </button>
                  </div>
                </div>
              </div>
            </Tabs.Content>
            <Tabs.Content className="tabs__content" value="events">
              <div className={styles.dashboardEvents}>
                <div className={`${styles.dashboardEvents__header} ${events.length < 1 ? styles.noEvents : ""} fp`}>
                  <div className={`${styles.main}`}>
                    <h6 className="h2">My events</h6>
                    <p className="txt-body">
                      {events.length < 1
                        ? "You have no upcoming events. Create one to get started!"
                        : `You have published ${events.length} event${events.length > 1 ? "s" : ""}.`}
                    </p>
                  </div>
                  <button
                    className={`${styles.dashboardEvents__btn} btn_main accent`}
                    onClick={() => setShowCreateEvent(true)}
                  >
                    <LucidePlus size={16} />
                    Create Event
                  </button>
                </div>
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
                        const grouped: Record<string, typeof events> = {};
                        for (const ev of events) {
                          const key = ev.date ?? "No date";
                          if (!grouped[key]) grouped[key] = [];
                          grouped[key].push(ev);
                        }

                        // Sort date keys ascending (closest to today first). Date string have to be in ISO format
                        const sortedDates = Object.keys(grouped).sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));

                        const formatDividerDate = (d: string) => {
                          try {
                            const dt = new Date(d);
                            if (isNaN(dt.getTime())) return d;
                            return dt.toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            });
                          } catch {
                            return d;
                          }
                        };

                        return sortedDates.map((dateKey) => (
                          <li key={dateKey} className={styles.list__item}>
                            <div className={`${styles.list__divider} fp`}>
                              <span className="h4">{formatDividerDate(dateKey)}</span>
                            </div>

                            <div className={styles.list__item_wrap + " fp-col"}>
                              {grouped[dateKey].map((ev) => (
                                <div key={ev.id} className={styles.list__item}>
                                  <RunClubEventCard
                                    event={{
                                      id: ev.id,
                                      title: ev.title,
                                      about: ev.about,
                                      date: ev.date,
                                      startTime: ev.startTime,
                                      endTime: ev.endTime,
                                      locationName: ev.locationName,
                                      locationUrl: ev.locationUrl,
                                      runclub_id: ev.runclub_id,
                                      runclub: ev.runclub,
                                    }}
                                    onDeleted={handleEventDeleted}
                                  />
                                </div>
                              ))}
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
        open={showCreateEvent}
        onClose={() => setShowCreateEvent(false)}
        ariaLabel="Create event"
        noClubsModal={clubs.length === 0}
      >
        {clubs.length > 0 ? (
          <EventCreationForm
            runclubs={clubs.map((c) => ({ id: c.id, name: c.name }))}
            onClose={() => setShowCreateEvent(false)}
            onEventCreated={handleEventCreated}
          />
        ) : (
          <div className="center fp-col">
            <h2 className="h3">No clubs available</h2>
            <p className="txt-body">You need to create a run club before you can create events.</p>
            <Link href="/submit" className="btn_main accent"  onClick={() => setShowCreateEvent(false)}>
              Register a new club
            </Link>
          </div>
        )}
      </Modal>
      {/* Edit club modal */}
      <Modal open={!!editingClub} onClose={() => setEditingClub(null)} ariaLabel="Edit run club">
        {editingClub && (
          <RunClubRegistrationForm
            mode="update"
            clubId={editingClub.id}
            initialValues={editingClub}
            onEditSuccess={async () => {
              setEditingClub(null); // Close modal
              await refetchClubs(); // get fresh data
            }}
          />
        )}
      </Modal>
    </>
  );
}
