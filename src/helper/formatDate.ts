export const formatDate = (date: Date) => {
  const d = new Date(date);
  const isoDate = d.toISOString().split("T")[0];
  return isoDate as string;
};
