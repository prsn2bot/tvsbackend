import {
  startOfDay,
  endOfDay,
  addDays,
  isBefore,
  isAfter,
  isEqual,
  isSameDay,
} from "date-fns";
import logger from "./logger";

/**
 * Generates a target number of unique random dates within specified periods
 * (daily, weekly, or monthly) across an overall date range.
 * Each period will attempt to generate the 'target' number of dates.
 */
export function generateRandomDates(
  overallStartDate: Date,
  overallEndDate: Date,
  frequency: "daily" | "weekly" | "monthly",
  target: number
): Date[] {
  logger.debug("generateRandomDates received:", {
    overallStartDate,
    overallEndDate,
    frequency,
    target,
  });

  // If in development mode, adjust dates to be within a short window for easier testing
  // REMOVED: This block was overriding the intended date range for all environments when NODE_ENV was 'development'.
  // If testing with small ranges is desired, it should be done by explicitly passing small ranges.
  // if (env.NODE_ENV === "development") {
  //   const now = new Date();
  //   overallStartDate = addMinutes(now, -5); // 5 minutes ago
  //   overallEndDate = addMinutes(now, 5); // 5 minutes from now
  // }

  const allGeneratedDates: Date[] = [];
  const endOfOverallEndDate = endOfDay(overallEndDate);

  // Helper to get random time within a day
  const getRandomTimeInDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(Math.floor(Math.random() * 24));
    newDate.setMinutes(Math.floor(Math.random() * 60));
    newDate.setSeconds(Math.floor(Math.random() * 60));
    newDate.setMilliseconds(Math.floor(Math.random() * 1000));
    return newDate;
  };

  let currentPeriodStartIterator = startOfDay(overallStartDate); // Start from the beginning of the first day

  while (
    isBefore(currentPeriodStartIterator, endOfOverallEndDate) ||
    isEqual(currentPeriodStartIterator, endOfOverallEndDate)
  ) {
    let periodStart: Date;
    let periodEnd: Date;
    let nextPeriodStartForIterator: Date; // To advance the loop

    if (frequency === "daily") {
      periodStart = startOfDay(currentPeriodStartIterator);
      periodEnd = endOfDay(currentPeriodStartIterator);
      nextPeriodStartForIterator = addDays(currentPeriodStartIterator, 1);
    } else if (frequency === "weekly") {
      periodStart = startOfDay(currentPeriodStartIterator);
      periodEnd = endOfDay(addDays(currentPeriodStartIterator, 6)); // 7 days from currentPeriodStartIterator
      nextPeriodStartForIterator = addDays(currentPeriodStartIterator, 7);
    } else if (frequency === "monthly") {
      periodStart = startOfDay(currentPeriodStartIterator);
      periodEnd = endOfDay(addDays(currentPeriodStartIterator, 29)); // 30 days from currentPeriodStartIterator
      nextPeriodStartForIterator = addDays(currentPeriodStartIterator, 30);
    } else {
      // This case should ideally not be reached with the defined frequencies
      return []; // Return an empty array or handle as appropriate
    }

    // Adjust the current period's effective start and end to not exceed the overall date range
    const effectivePeriodStart = new Date(
      Math.max(periodStart.getTime(), overallStartDate.getTime())
    );
    const effectivePeriodEnd = new Date(
      Math.min(periodEnd.getTime(), endOfOverallEndDate.getTime())
    );

    // If the effective period is invalid (start is after end), move to next period
    if (effectivePeriodStart.getTime() > effectivePeriodEnd.getTime()) {
      currentPeriodStartIterator = nextPeriodStartForIterator;
      continue;
    }

    const uniqueTimestampsInPeriod: Set<number> = new Set();
    let attempts = 0;
    const MAX_ATTEMPTS = target * 10; // Prevent infinite loops for very small periods or high targets

    // --- Start of modified logic for weekly frequency ---
    if (frequency === "weekly") {
      // Normalize effective period dates to start/end of day for accurate day iteration
      const normalizedEffectivePeriodStart = startOfDay(effectivePeriodStart);
      const normalizedEffectivePeriodEnd = endOfDay(effectivePeriodEnd);

      logger.debug("Weekly calculation:", {
        effectivePeriodStart,
        effectivePeriodEnd,
        normalizedEffectivePeriodStart,
        normalizedEffectivePeriodEnd,
      });

      const availableDays: Date[] = [];
      let tempDate = new Date(normalizedEffectivePeriodStart);
      while (
        isBefore(tempDate, normalizedEffectivePeriodEnd) ||
        isEqual(tempDate, normalizedEffectivePeriodEnd)
      ) {
        availableDays.push(new Date(tempDate));
        tempDate = addDays(tempDate, 1);
      }
      logger.debug(
        "Available Days:",
        availableDays.map((d) => d.toISOString().split("T")[0]),
        "Length:",
        availableDays.length
      );

      // Shuffle availableDays and pick 'target' unique days
      const shuffledDays = availableDays.sort(() => 0.5 - Math.random());
      const daysToPost = shuffledDays.slice(
        0,
        Math.min(target, shuffledDays.length)
      );
      logger.debug(
        "Days to Post:",
        daysToPost.map((d) => d.toISOString().split("T")[0]),
        "Length:",
        daysToPost.length
      );

      for (const day of daysToPost) {
        uniqueTimestampsInPeriod.add(getRandomTimeInDay(day).getTime());
      }
    } else {
      // --- Original logic for daily/monthly frequencies ---
      while (
        uniqueTimestampsInPeriod.size < target &&
        attempts < MAX_ATTEMPTS
      ) {
        if (effectivePeriodStart.getTime() === effectivePeriodEnd.getTime()) {
          // Handle single-day or zero-duration periods to avoid issues with random calculation
          uniqueTimestampsInPeriod.add(
            getRandomTimeInDay(effectivePeriodStart).getTime()
          );
        } else {
          const randomTime =
            effectivePeriodStart.getTime() +
            Math.random() *
              (effectivePeriodEnd.getTime() - effectivePeriodStart.getTime());
          uniqueTimestampsInPeriod.add(
            getRandomTimeInDay(new Date(randomTime)).getTime()
          );
        }
        attempts++;
      }
    }
    // --- End of modified logic for weekly frequency ---

    // Add generated dates for this period to the main list
    allGeneratedDates.push(
      ...Array.from(uniqueTimestampsInPeriod).map((ts) => new Date(ts))
    );

    // Advance the iterator to the start of the next period
    currentPeriodStartIterator = nextPeriodStartForIterator;
  }

  // Sort all generated dates chronologically before returning
  allGeneratedDates.sort((a, b) => a.getTime() - b.getTime());

  // Filter out any dates that might have accidentally slipped outside the original overall bounds
  // (though the logic above aims to prevent this, it's a good final safeguard)
  return allGeneratedDates.filter(
    (date) =>
      (isAfter(date, overallStartDate) || isEqual(date, overallStartDate)) &&
      (isBefore(date, overallEndDate) ||
        isEqual(date, overallEndDate) ||
        isSameDay(date, overallEndDate)) // Include end day
  );
}
