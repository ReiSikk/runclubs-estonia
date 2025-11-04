// Styles
import styles from "./AllClubsList.module.css"
// Components
import AllClubsListItem from '../Section-AllClubs/AllClubsListItem'
// Types
import { RunClub } from '../../../lib/types'
// Icons
import { Search } from 'lucide-react';

function AllClubsList({clubs, isLoading, isError, }: { clubs: RunClub[], isLoading: boolean; isError: boolean }) {

  if (isLoading) {
    return (
      <ul className={`${styles.allClubsList} list-block error`}>
      <li className={`${styles.noResults} fp`}>
          Loading clubs...
        </li>
      </ul> 
    )
  }
  
  if (isError) {
    return (
      <ul className={`${styles.allClubsList} list-block error`}>
        <li className={`${styles.noResults} fp`}>
          Error loading clubs
        </li>
      </ul>
    );
  }
  
  return (
    <ul className={`${styles.allClubsList} list-grid`} data-testid="all-clubs-section">
      {clubs.length > 0 ? (
        clubs.map(club => (
          <AllClubsListItem key={club._id} club={club} />
        ))
      ) : (
        <li className={`${styles.noResults} fp-col`}>
            <Search width={24} height={24} className=''/>
            <span className='h4'>
              {`No results for your search`}  
            </span>
            <br />
            Try using different keywords or check the spelling.
        </li>
      )}
    </ul>
  )
}

export default AllClubsList