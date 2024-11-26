import { OrderStatus } from "@prisma/client";

export interface OrderWithProducts {
  OrderItem: {
    product_name: any;
    product_id: number;
    quantity: number;
    price: number;
  }[];
  id: string;
  total_amount: number;
  total_items: number;
  status: OrderStatus;
  paid: boolean;
  paid_at: Date;
  created_at: Date;
  updated_at: Date;
}
