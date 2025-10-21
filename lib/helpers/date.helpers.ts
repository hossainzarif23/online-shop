/**
 * Date Formatting Helpers
 */

export const dateHelpers = {
  /**
   * Format date to readable string (e.g., "October 21, 2025")
   */
  formatLongDate(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  /**
   * Format date to short string (e.g., "10/21/2025")
   */
  formatShortDate(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US");
  },

  /**
   * Format date with time (e.g., "Oct 21, 2025 at 3:45 PM")
   */
  formatDateTime(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  },

  /**
   * Get relative time (e.g., "2 hours ago", "3 days ago")
   */
  getRelativeTime(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

    return dateHelpers.formatShortDate(d);
  },
};
