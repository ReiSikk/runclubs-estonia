"use client";

import React, { useState } from "react";
// Styles
import styles from "./MainSection.module.css";
// Components
import { TodayClubsList } from "./Section-TodaysClubs/TodayClubsList";
import HomeMainAside from "./Section-AllClubs/HomeMainAside";
// Hooks
import getRunClubs from "../../lib/hooks/useRunClubs";

function MainSection() {
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Use server prefetched data to avoid showing loading state on UI
  const { data: clubs = [], isLoading, isError } = getRunClubs();

  // Generate unique cities and filter options at parent level
  const uniqueCities = isLoading
    ? []
    : [...new Set(clubs.filter((club) => club.city && club.city.trim()).map((club) => club.city))];

  const getCityCount = (cityValue: string) => {
    if (cityValue === "all") {
      return clubs.length;
    }
    return clubs.filter((club) => club.city === cityValue).length;
  };

  const filterOptions = [
    { value: "all", label: "All Cities", count: clubs.length },
    ...uniqueCities.map((city) => ({
      value: city,
      label: city,
      count: getCityCount(city),
    })),
  ];

  // Filter clubs based on search term and selected city
  const getFilteredClubs = () => {
    if (isLoading || isError) return [];

    // Filter by city
    const cityFiltered = selectedCity === "all" ? clubs : clubs.filter((club) => club.city === selectedCity);

    // Filter by search term
    return searchTerm === ""
      ? cityFiltered
      : cityFiltered.filter(
          (club) =>
            club.name?.toLowerCase().includes(searchTerm) ||
            club.area?.toLowerCase().includes(searchTerm) ||
            club.city?.toLowerCase().includes(searchTerm)
        );
  };

  const filteredClubs = getFilteredClubs();

  // Check which clubs are running today
  const today = new Date().toLocaleString("en-US", { weekday: "long" }).toLowerCase();

  // Filter clubs that run today
  const todaysClubs = filteredClubs.filter(
    (club) =>
      club.runDays &&
      club.runDays.some(
        (day: string) => day.toLowerCase().includes(today) || day.toLowerCase().includes(today.substring(0, 3)) // Check for abbreviations
      )
  );

  return (
    <section className={`${styles.mainSection}`}>
      <div className={`${styles.mainSection__wrapper} container`}>
        <div className={`${styles.mainSection__main} col-m-12 col-t-4 col-d-4`}>
          <h2 className={`${styles.mainSection__title} h3`}>
            {todaysClubs.length > 0
              ? `${todaysClubs.length} clubs running in ${selectedCity === "all" ? "Estonia" : selectedCity} today`
              : "No clubs matching your search running today"}
          </h2>
          <div className={styles.mainSection__clubsList} id="home-clubs-list">
            <TodayClubsList todaysClubs={todaysClubs} isLoading={isLoading} isError={isError} />
          </div>
        </div>
        <HomeMainAside
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          filterOptions={filterOptions}
          isLoading={isLoading}
          isError={isError}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filteredClubs={filteredClubs}
        />
      </div>
    </section>
  );
}

export default MainSection;
