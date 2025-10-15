import mongoose, { Document, Model, Types } from "mongoose";
import { ITable } from "./Table";
import { IOrder } from "./Orders";

export enum BillPaymentStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID"
}
export enum BillStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  CANCELLED = "CANCELLED"
}


export interface IBill extends Document {
  tableId: Types.ObjectId | ITable;
  orders: (Types.ObjectId | IOrder)[];
  status: BillStatus;
  totalAmount: number;
  paidAmount: number;
  isClosed: boolean;
  paymentStatus: BillPaymentStatus;

}



const BillSchema = new mongoose.Schema<IBill>({
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table",
    required: true,
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  }],
  status: {
    type: String,
    enum: Object.values(BillStatus),
    default: BillStatus.OPEN
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: Object.values(BillPaymentStatus),
    default: BillPaymentStatus.PENDING
  }
}, { timestamps: true });

export const Bill: Model<IBill> = mongoose.model("Bill", BillSchema);

