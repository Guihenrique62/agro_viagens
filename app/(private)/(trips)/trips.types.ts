export interface Trip {
  id: number;
  userId: string;
  destination: string;
  client: string;
  reason: string;
  escort?: string;
  type: string;
  advance_value: number;
  startDate: string;
  endDate: string;
  status: string;
  parameters_kmId: string;
  transports: {
    id: number;
    name: string;
    calculateKM: boolean;
    status: number;
  }[]

  user: {
    id: string;
    name: string;
  }

  parameters_km: {
    id: string;
    value: number;
    startDate: string;
    endDate: string;

  }

  trip_expenses: {
        id: number,
        typePayment: string,
        value: number,
        date: string,
        taxDocument: string,
        observation: string,
        createdAt: string,
        proof: string,
        tripId: number,
        expenses: {
          id: number,
          name: string,
          status: number
        }
    }[]
}
