// Convert full names for days into abbreviations
export function convertDaysToAbbs(days: string[]): string[] {
    console.log('Converting days:', days);

    const abbreviatedDays = days.map((day) => {
    const trimmedDay = day.trim();
    const abbreviatedDay = trimmedDay.slice(0, 3);
    console.log(`Converted ${day} to ${abbreviatedDay}`);
    return abbreviatedDay.charAt(0).toUpperCase() + abbreviatedDay.slice(1).toLowerCase();
    });

    return abbreviatedDays;
}