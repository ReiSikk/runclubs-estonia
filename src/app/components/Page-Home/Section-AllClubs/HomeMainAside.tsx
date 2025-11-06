"use client"

import { useEffect, useRef } from "react"
// Styles
import styles from "./HomeMainAside.module.css"
// Components
import AllClubsList from './AllClubsList'
import SearchBar from './SearchBar'
import { FilterSelect } from './FilterSelect';
// Types
import { RunClub } from '../../../lib/types';

interface HomeMainAsideProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  filterOptions: { value: string; label: string; count: number }[];
  isLoading: boolean;
  isError: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filteredClubs: RunClub[];
}

export default function HomeMainAside({ 
  selectedCity, 
  onCityChange, 
  filterOptions, 
  isLoading, 
  isError,
  searchTerm,
  onSearchChange,
  filteredClubs
}: HomeMainAsideProps) {

  // Scroll to top of list when city changes
  const clubsListRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true) // prevent scroll to allClubsList top on initial mount
  
  useEffect(() => {
     // Skip scroll on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (clubsListRef.current) {
      clubsListRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }, [selectedCity])

  // Handle search input
 const inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lowerCase = e.target.value.toLowerCase();
    onSearchChange(lowerCase);
  };

  // Clear search input
  const clearInput = () => {
    onSearchChange('');
  };


  return (
    <aside className={`${styles.mainSection__side} col-m-12 col-t-8 col-d-8`}>
        <h3 className={`${styles.side__title} h3`}>{selectedCity === 'all' ? 'Run clubs in Estonia' : `Run clubs in ${selectedCity}`}<span className={`${styles.side__count}`}>{filteredClubs.length}</span></h3>
        <div className={`${styles.side__filters} fp`} ref={clubsListRef}>
          <SearchBar inputHandler={inputHandler} clearInput={clearInput} searchTerm={searchTerm} />
          <FilterSelect 
            value={selectedCity} 
            onValueChange={onCityChange} 
            options={filterOptions} 
            placeholder='Select a filter' 
          />
        </div>
        <AllClubsList 
          clubs={filteredClubs} 
          isLoading={isLoading} 
          isError={isError} 
        />
    </aside>
  )
}