import mongoose, { Document, Model, Types } from "mongoose";
import { IOrder } from "./Orders";


export interface ICustomer extends Document {
  phoneNumber?: string;
  name: string;
  email?: string;
  createdAt: Date;
  orders: (Types.ObjectId | IOrder)[];
}


const CustomerSchema = new mongoose.Schema<ICustomer>({
  phoneNumber: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
    unique: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  }]
}, { timestamps: true });

export const Customer: Model<ICustomer> = mongoose.model("Customer", CustomerSchema);

