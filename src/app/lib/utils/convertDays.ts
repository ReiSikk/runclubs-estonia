// Convert full names for days into abbreviations
export function convertDaysToAbbs(days: string[]): string[] {

    const abbreviatedDays = days.map((day) => {
    const trimmedDay = day.trim();
    const abbreviatedDay = trimmedDay.slice(0, 3);

    return abbreviatedDay.charAt(0).toUpperCase() + abbreviatedDay.slice(1).toLowerCase();
    });

    return abbreviatedDays;
}