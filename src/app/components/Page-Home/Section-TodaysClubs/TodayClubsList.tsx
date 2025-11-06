// Styles
import styles from './TodayClubsList.module.css';
// Components
import TodaysClubsListItem from './TodayClubsListItem';
// Utils
import { convertDaysToAbbs } from "@/app/lib/utils/convertDays";
// Types
import { RunClub } from '@/app/lib/types';
// Icons
import { Search } from 'lucide-react';

interface TodayClubsListProps {
  todaysClubs: RunClub[];
  isLoading: boolean;
  isError: boolean;
}

export type FormattedRunClub = Omit<RunClub, 'days'> & {
  days: string;
};

export function TodayClubsList({ todaysClubs, isLoading, isError  }: TodayClubsListProps) {

  if (isLoading) {
    return <div className={`${styles.todayClubsList} loading`}>Loading clubs...</div>
  }
  
  if (isError) {
    return <div className={`${styles.todayClubsList} error`}>Error loading clubs</div>
  }

  // Format the clubs
const formattedClubs: FormattedRunClub[] = todaysClubs.map((club: RunClub): FormattedRunClub => ({
  ...club,
  days: convertDaysToAbbs(club.days).join(', ')
}));

  if (formattedClubs.length === 0) {
    return (
      <div className={`${styles.todayClubsList} ${styles.no_clubs}`}>
        <div className={`${styles.todayClubsList__item} fp-col`}>
          <Search width={24} height={24} className=''/>
          <div className=''>
            <p className='h4'>
              {`No clubs running in your selected city today matching your search`}  
            </p>
            <p className='txt-body'>
              {`Try using different keywords or check the spelling.`}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ul className={styles.todayClubsList}>
      {todaysClubs.map((club) => (
        <TodaysClubsListItem key={club._id} club={club}  formattedDays={convertDaysToAbbs(club.days).join(', ')}/>
      ))}
    </ul>
  );
}