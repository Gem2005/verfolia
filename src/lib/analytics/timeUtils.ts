export const toISODate = (d: Date) => d.toISOString().slice(0, 10);

export const toISODateTime = (d: Date) => d.toISOString().slice(0, 13); // Returns YYYY-MM-DDTHH

export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

export const hoursAgo = (n: number) => {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
};

export const getDateRange = (timeframe: string) => {
  const range = Number(timeframe);
  const is24Hours = range === 1;
  return { range, is24Hours };
};

export const createTimeSlots = (timeframe: string) => {
  const { range, is24Hours } = getDateRange(timeframe);
  const slots = new Map();

  if (is24Hours) {
    // Create 24 hour slots
    Array.from({ length: 24 }).forEach((_, i) => {
      const hourDate = hoursAgo(23 - i);
      const key = toISODateTime(hourDate);
      slots.set(key, {
        date: hourDate.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          hour12: true,
        }),
        key,
      });
    });
  } else {
    // Create day slots
    Array.from({ length: range + 1 }).forEach((_, i) => {
      const dayDate = daysAgo(range - i);
      const key = toISODate(dayDate);
      slots.set(key, {
        date: key,
        key,
      });
    });
  }

  return { slots, is24Hours };
};
