import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Format a number to a shorter format (e.g., 1000 -> 1K)
export const formatNumber = (num: number): string => {
  if (num >= 1000) return Math.floor(num / 1000) + "K";
  return num.toString();
};

// Format a date to a short relative format + month/year for older dates
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;

  // For dates older than ~1 month, return "MMM YYYY"
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};
