import React from 'react'
// Styles
import styles from './SearchBar.module.css'
// Icons
import { Search } from 'lucide-react'

interface SearchBarProps {
  inputHandler: (e: React.ChangeEvent<HTMLInputElement>) => void
  clearInput: () => void,
  searchTerm: string
}

function SearchBar({ inputHandler, clearInput, searchTerm }: SearchBarProps) {
  return (
   <form role="search" aria-labelledby="clubs-search-label" className={styles.side__SearchForm}>
  <label id="clubs-search-label" htmlFor="clubs-search" className="txt-label sr-only">
    Search run clubs
  </label>

  <div className={`${styles.searchField} fp`}>
    <Search 
        className={styles.searchField__icon} 
        aria-hidden="true" 
        focusable="false"
        width="20"
        height="20"
    />
    <input
      id="clubs-search"
      name="q"
      type="search"
      placeholder="Search clubs"
      className={`${styles.searchField__input} h5`}
      autoComplete="off"
      enterKeyHint="search"
      onChange={inputHandler}
      value={searchTerm}
      data-umami-event="Clicked on SearchBar"
    />
     <div
      role="button" 
      className={`${styles.searchField__clear} btn_small btn-txt-anim`} 
      aria-label="Clear search input"
      onClick={clearInput}
      >
      <span className="txt-main h5">Clear</span>
      <span className="txt-hovered h5">Clear</span>
    </div>
  </div>
</form>
  )
}

export default SearchBar