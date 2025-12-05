// Format dates to YYYY-MM-DD
export const formatDate = (date: Date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};
