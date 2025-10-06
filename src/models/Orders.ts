import mongoose, { Model, Types } from "mongoose";
import { IMenuItem } from "./MenuItem";
import { ICustomer } from "./Customer";
import { IBill } from "./Bills";
import { ITable } from "./Table";

export enum OrderStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export interface IOrderItem {
  menuItemId: Types.ObjectId | IMenuItem;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IOrder extends Document {
  customerId?: Types.ObjectId | ICustomer;
  tableId: Types.ObjectId | ITable;
  billId: Types.ObjectId | IBill;
  items: IOrderItem[];
  status: OrderStatus;
}


const OrderSchema = new mongoose.Schema<IOrder>({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false,
  },
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true,
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    name: String,
    quantity: { type: Number, default: 1 },
    price: Number,
    total: Number
  }],
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  },
  // totalAmount: {
  //   type: Number,
  //   required: true,
  // },
}, { timestamps: true });

export const Order: Model<IOrder> = mongoose.model("Order", OrderSchema);
