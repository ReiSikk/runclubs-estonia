"use client";

import React, { useState, useCallback } from "react";
import styles from "./page.module.css";
import { auth } from "@/app/lib/firebase";
import RunClubCard from "../components/Dashboard/RunClubCard";
import getUserRunClubs from "../lib/hooks/useMyRunClubs";
import { formatMonthYear } from "../lib/utils/convertTime";
import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
import SideBar from "../components/Dashboard/SideBar";
import { useRouter } from "next/navigation";
import { LucidePlus } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import RunClubEvent from "./RunClubEvent";
import EventCreationForm from "../components/Forms/EventCreationForm";
import Modal from "../components/Modals/Modal";
import useEventsForRunclubs from "../lib/hooks/useEvents";

function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const { user, loading } = useAuth();
  // State for create event modal
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  // Log out button handler
  const handleLogOut = useCallback(async () => {
    await auth.signOut();
    router.replace("/login");
  }, [router]);

  // Find users clubs
  const { data: clubs = [], isLoading, isError } = getUserRunClubs(user?.uid);
  // Get clubs ids and fetch events
  const clubIds = clubs.map((c) => c.id);
  const { data: events = [], isLoading: eventsLoading, isError: eventsError } = useEventsForRunclubs(clubIds);
  console.log("Events:", events);

  if (!user || loading) {
    return (
      <div className={`${styles.page} container`}>
        <div className={styles.page__main}>
          <main className={`${styles.dashboard} ${styles.loading} container`}>
            <h1 className="h4">Getting your data ready...</h1>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} container`}>
      <SideBar handleLogOut={handleLogOut} />
      <div className={styles.page__main}>
        <div className={`${styles.page__header}`}>
          <h1 className="h1">Welcome to your dashboard, {user.displayName?.split(" ")[0] || ""}! 👋</h1>
          <p>
            Here you can manage your account and view your clubs and activities.
            <br />
            Keep building the running community of Estonia!
          </p>
        </div>
        <main className={`${styles.dashboard} fp-col`}>
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
                Events
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content className="tabs__content" value="overview">
              <div className={styles.dashboardEvents__header + " fp-col"}>
                <h6 className="h2">Overview</h6>
                <p className="txt-body">All your run clubs and events at a glance.</p>
              </div>
              <div className={styles.dashboardStats}>
                <ul className={`${styles.dashboardStats__list} list-grid list-grid--3`}>
                  <li className={`${styles.dashboardStats__item} ${styles.card_dashboard} fp-col`}>
                    <div className={`${styles.dashboardStats__initials} fp`}>
                      <span className="h3">
                        {user.displayName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className={`${styles.nameMember} fp`}>
                      <h2 className={`${styles.name} h3`}>{user.displayName}</h2>
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
                      <span className={`${styles.dashboardStats__label} txt-label`}>Total members</span>
                      <h3 className="h1">79</h3>
                      {/* //TODO: Remove or add dynamic stats */}
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
                        <RunClubCard key={club.id} {...club} />
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
                <div className={`${styles.dashboardEvents__header} fp`}>
                  <div className={`${styles.main}`}>
                    <h6 className="h2">My events</h6>
                    <p className="txt-body">You have no upcoming events. Create one to get started!</p>
                  </div>
                  <Link href={"/create-event"} className={`${styles.dashboardEvents__btn} btn_main accent`}>
                    <LucidePlus size={16} />
                    Create Event
                  </Link>
                </div>
                <div className={styles.dashboardEvents__content}>
                  {/* Group events by date and render a divider per date */}
                  <ul className={styles.list + " list-grid list-grid--1"}>
                    {(() => {
                      // Group by date string
                      const grouped: Record<string, typeof events> = {};
                      for (const ev of events) {
                        const key = ev.date ?? "No date";
                        if (!grouped[key]) grouped[key] = [];
                        grouped[key].push(ev);
                      }

                      // Sort date keys descending (newest first). If date strings are ISO (yyyy-mm-dd) this will work correctly.
                      const sortedDates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));

                      const formatDividerDate = (d: string) => {
                        try {
                          const dt = new Date(d);
                          if (isNaN(dt.getTime())) return d;
                          return dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
                        } catch {
                          return d;
                        }
                      };

                      return sortedDates.map((dateKey) => (
                        <li key={dateKey} className={styles.list__item}>
                          <div className={`${styles.list__divider} fp`}>
                            <span className="h4">{formatDividerDate(dateKey)}</span>
                          </div>

                          {grouped[dateKey].map((ev) => (
                            <div key={ev.id} className={styles.list__item}>
                              <RunClubEvent
                                event={{
                                  id: ev.id,
                                  title: ev.title,
                                  about: ev.about,
                                  date: ev.date,
                                  time: ev.time,
                                  location: ev.location,
                                  locationUrl: ev.locationUrl,
                                  runclub_id: (ev as any).runclub_id,
                                  runclub: (ev as any).runclub,
                                }}
                              />
                            </div>
                          ))}
                        </li>
                      ));
                    })()}
                  </ul>
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </main>
      </div>
      <Modal open={showCreateEvent} onClose={() => setShowCreateEvent(false)} ariaLabel="Create event">
        <EventCreationForm
          runclubs={clubs.map((c) => ({ id: c.id, name: c.name }))}
          onClose={() => setShowCreateEvent(false)}
        />
      </Modal>
    </div>
  );
}

export default DashboardPage;
