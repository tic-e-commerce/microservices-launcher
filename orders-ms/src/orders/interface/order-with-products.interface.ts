import { order_status } from "@prisma/client";

export interface OrderWithProducts {
  OrderItem: {
    product_name: any;
    product_id: number;
    quantity: number;
    price: number;
    image_url: string;
  }[];
  order_id: string;
  user_id: number;
  total_amount: number;
  total_items: number;
  status: order_status;
  paid: boolean;
  paid_at: Date;
  created_at: Date; 
  updated_at: Date;
}
