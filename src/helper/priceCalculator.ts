export const calculatePrice = (
  startDate: string,
  endDate: string,
  daily_rent_price: number
) => {
  const number_of_days = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const total_price = daily_rent_price * number_of_days;

  return total_price;
};
