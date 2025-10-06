import mongoose, { Document, Model, Types } from "mongoose";
import { IBill } from "./Bills";

export enum TransactionStatus {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    PENDING = "PENDING"
}

export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  UPI = "UPI"
}

export interface ITransaction extends Document {
  billId: Types.ObjectId | IBill;
  method: PaymentMethod;
  amount: number;
  status: TransactionStatus;
}

const transactionSchema = new mongoose.Schema<ITransaction>({
    billId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bill"
    },
    method: { 
        type: String, 
        enum: Object.values(PaymentMethod), 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: [TransactionStatus.SUCCESS, TransactionStatus.FAILED, TransactionStatus.PENDING], 
        default: TransactionStatus.PENDING
    }
}, { timestamps: true });

const Transaction: Model<ITransaction> = mongoose.model("Transaction", transactionSchema);
export default Transaction;
