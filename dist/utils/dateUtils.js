"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomDates = void 0;
const date_fns_1 = require("date-fns");
const logger_1 = __importDefault(require("./logger"));
/**
 * Generates a target number of unique random dates within specified periods
 * (daily, weekly, or monthly) across an overall date range.
 * Each period will attempt to generate the 'target' number of dates.
 */
function generateRandomDates(overallStartDate, overallEndDate, frequency, target) {
    logger_1.default.debug("generateRandomDates received:", {
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
    const allGeneratedDates = [];
    const endOfOverallEndDate = (0, date_fns_1.endOfDay)(overallEndDate);
    // Helper to get random time within a day
    const getRandomTimeInDay = (date) => {
        const newDate = new Date(date);
        newDate.setHours(Math.floor(Math.random() * 24));
        newDate.setMinutes(Math.floor(Math.random() * 60));
        newDate.setSeconds(Math.floor(Math.random() * 60));
        newDate.setMilliseconds(Math.floor(Math.random() * 1000));
        return newDate;
    };
    let currentPeriodStartIterator = (0, date_fns_1.startOfDay)(overallStartDate); // Start from the beginning of the first day
    while ((0, date_fns_1.isBefore)(currentPeriodStartIterator, endOfOverallEndDate) ||
        (0, date_fns_1.isEqual)(currentPeriodStartIterator, endOfOverallEndDate)) {
        let periodStart;
        let periodEnd;
        let nextPeriodStartForIterator; // To advance the loop
        if (frequency === "daily") {
            periodStart = (0, date_fns_1.startOfDay)(currentPeriodStartIterator);
            periodEnd = (0, date_fns_1.endOfDay)(currentPeriodStartIterator);
            nextPeriodStartForIterator = (0, date_fns_1.addDays)(currentPeriodStartIterator, 1);
        }
        else if (frequency === "weekly") {
            periodStart = (0, date_fns_1.startOfDay)(currentPeriodStartIterator);
            periodEnd = (0, date_fns_1.endOfDay)((0, date_fns_1.addDays)(currentPeriodStartIterator, 6)); // 7 days from currentPeriodStartIterator
            nextPeriodStartForIterator = (0, date_fns_1.addDays)(currentPeriodStartIterator, 7);
        }
        else if (frequency === "monthly") {
            periodStart = (0, date_fns_1.startOfDay)(currentPeriodStartIterator);
            periodEnd = (0, date_fns_1.endOfDay)((0, date_fns_1.addDays)(currentPeriodStartIterator, 29)); // 30 days from currentPeriodStartIterator
            nextPeriodStartForIterator = (0, date_fns_1.addDays)(currentPeriodStartIterator, 30);
        }
        else {
            // This case should ideally not be reached with the defined frequencies
            return []; // Return an empty array or handle as appropriate
        }
        // Adjust the current period's effective start and end to not exceed the overall date range
        const effectivePeriodStart = new Date(Math.max(periodStart.getTime(), overallStartDate.getTime()));
        const effectivePeriodEnd = new Date(Math.min(periodEnd.getTime(), endOfOverallEndDate.getTime()));
        // If the effective period is invalid (start is after end), move to next period
        if (effectivePeriodStart.getTime() > effectivePeriodEnd.getTime()) {
            currentPeriodStartIterator = nextPeriodStartForIterator;
            continue;
        }
        const uniqueTimestampsInPeriod = new Set();
        let attempts = 0;
        const MAX_ATTEMPTS = target * 10; // Prevent infinite loops for very small periods or high targets
        // --- Start of modified logic for weekly frequency ---
        if (frequency === "weekly") {
            // Normalize effective period dates to start/end of day for accurate day iteration
            const normalizedEffectivePeriodStart = (0, date_fns_1.startOfDay)(effectivePeriodStart);
            const normalizedEffectivePeriodEnd = (0, date_fns_1.endOfDay)(effectivePeriodEnd);
            logger_1.default.debug("Weekly calculation:", {
                effectivePeriodStart,
                effectivePeriodEnd,
                normalizedEffectivePeriodStart,
                normalizedEffectivePeriodEnd,
            });
            const availableDays = [];
            let tempDate = new Date(normalizedEffectivePeriodStart);
            while ((0, date_fns_1.isBefore)(tempDate, normalizedEffectivePeriodEnd) ||
                (0, date_fns_1.isEqual)(tempDate, normalizedEffectivePeriodEnd)) {
                availableDays.push(new Date(tempDate));
                tempDate = (0, date_fns_1.addDays)(tempDate, 1);
            }
            logger_1.default.debug("Available Days:", availableDays.map((d) => d.toISOString().split("T")[0]), "Length:", availableDays.length);
            // Shuffle availableDays and pick 'target' unique days
            const shuffledDays = availableDays.sort(() => 0.5 - Math.random());
            const daysToPost = shuffledDays.slice(0, Math.min(target, shuffledDays.length));
            logger_1.default.debug("Days to Post:", daysToPost.map((d) => d.toISOString().split("T")[0]), "Length:", daysToPost.length);
            for (const day of daysToPost) {
                uniqueTimestampsInPeriod.add(getRandomTimeInDay(day).getTime());
            }
        }
        else {
            // --- Original logic for daily/monthly frequencies ---
            while (uniqueTimestampsInPeriod.size < target &&
                attempts < MAX_ATTEMPTS) {
                if (effectivePeriodStart.getTime() === effectivePeriodEnd.getTime()) {
                    // Handle single-day or zero-duration periods to avoid issues with random calculation
                    uniqueTimestampsInPeriod.add(getRandomTimeInDay(effectivePeriodStart).getTime());
                }
                else {
                    const randomTime = effectivePeriodStart.getTime() +
                        Math.random() *
                            (effectivePeriodEnd.getTime() - effectivePeriodStart.getTime());
                    uniqueTimestampsInPeriod.add(getRandomTimeInDay(new Date(randomTime)).getTime());
                }
                attempts++;
            }
        }
        // --- End of modified logic for weekly frequency ---
        // Add generated dates for this period to the main list
        allGeneratedDates.push(...Array.from(uniqueTimestampsInPeriod).map((ts) => new Date(ts)));
        // Advance the iterator to the start of the next period
        currentPeriodStartIterator = nextPeriodStartForIterator;
    }
    // Sort all generated dates chronologically before returning
    allGeneratedDates.sort((a, b) => a.getTime() - b.getTime());
    // Filter out any dates that might have accidentally slipped outside the original overall bounds
    // (though the logic above aims to prevent this, it's a good final safeguard)
    return allGeneratedDates.filter((date) => ((0, date_fns_1.isAfter)(date, overallStartDate) || (0, date_fns_1.isEqual)(date, overallStartDate)) &&
        ((0, date_fns_1.isBefore)(date, overallEndDate) ||
            (0, date_fns_1.isEqual)(date, overallEndDate) ||
            (0, date_fns_1.isSameDay)(date, overallEndDate)) // Include end day
    );
}
exports.generateRandomDates = generateRandomDates;
//# sourceMappingURL=dateUtils.js.map