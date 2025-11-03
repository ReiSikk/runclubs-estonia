"use client";

import React, { useState } from "react";
// Styles
import styles from '@/app/page.module.css'
// Components
import { TodayClubsList } from "./Section-TodaysClubs/TodayClubsList";
import HomeMainAside from "./HomeMainAside";
// Hooks
import getRunClubs from "../../lib/hooks/useRunClubs";

function MainSection() {
    const [selectedCity, setSelectedCity] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
  
    // Fetch clubs data at the parent level
    const { data: clubs = [], isLoading, isError } = getRunClubs();

    // Generate unique cities and filter options at parent level
    const uniqueCities = isLoading ? [] : [...new Set(
        clubs
        .filter(club => club.city && club.city.trim())
        .map(club => club.city)
    )];

    const getCityCount = (cityValue: string) => {
        if (cityValue === 'all') {
        return clubs.length;
        }
        return clubs.filter(club => club.city === cityValue).length;
    };

    const filterOptions = [
        { value: 'all', label: 'All Cities', count: clubs.length },
        ...uniqueCities.map(city => ({ 
        value: city,
        label: city,
        count: getCityCount(city)
        }))
    ];

    // Filter clubs based on search term and selected city
    const getFilteredClubs = () => {
    if (isLoading || isError) return [];

    // Filter by city
    const cityFiltered = selectedCity === 'all' 
        ? clubs 
        : clubs.filter(club => club.city === selectedCity);

    // Filter by search term
    return searchTerm === '' 
        ? cityFiltered 
        : cityFiltered.filter((club) => (
            club.name?.toLowerCase().includes(searchTerm) ||
            club.location?.toLowerCase().includes(searchTerm) ||
            club.city?.toLowerCase().includes(searchTerm)
        ));
    };

    const filteredClubs = getFilteredClubs();


/* Check which clubs are running today */
    const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Filter clubs that run today
    const todaysClubs = filteredClubs.filter(club => 
    club.days && club.days.some(day => 
        day.toLowerCase().includes(today) ||
        day.toLowerCase().includes(today.substring(0, 3)) // Check for abbreviations too
    )
    );

  return (
    <section className={`${styles.mainSection} container`}>
        <div className={`${styles.mainSection__main} col-m-12 col-t-4 col-d-4`}>
        <h2 className={`${styles.mainSection__title} h3`}>
            {todaysClubs.length > 0 ? `${todaysClubs.length} clubs running in ${selectedCity === 'all' ? 'Estonia' : selectedCity} today` : 'No clubs matching your search running today'}
        </h2>
        <div className={styles.clubsList} id="home-clubs-list">
        <TodayClubsList
          todaysClubs={todaysClubs}
          isLoading={isLoading}
          isError={isError}
         />
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
    </section>
  )
}

export default MainSection