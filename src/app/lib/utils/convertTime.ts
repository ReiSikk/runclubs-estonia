import moment from "moment";

export function formatMonthYear(dateString: string) {
  const m = moment(dateString);
  if (!m.isValid()) return dateString;
  return m.format("MMMM YYYY");
}

export function formatEventDate(dateString: string): string {
  return moment(dateString).format("dddd, MMMM D, YYYY");
}


export function formatDividerDate(d: string): string {
  const m = moment(d);
  if (!m.isValid()) return d;
  return m.format("ddd, MMM D");
}