export type TBooking = {
  id?: number;
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
  total_price: number;
  status: "active" | "cancelled" | "returned";
};

export type TBookingCreate = {
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
};

export type TBookingResponse = {
  id: number;
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
  total_price: number;
  status: "active" | "cancelled" | "returned";
  vehicle: {
    vehicle_name: string;
    daily_rent_price: number;
  };
};
