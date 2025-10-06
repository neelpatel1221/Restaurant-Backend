import mongoose, { Document, Model, Types } from "mongoose";
import { IBill } from "./Bills";

export interface ITable extends Document {
  tableNumber: number;
  isAvailable: boolean;
  qrCode: string;
  seating?: number;
  activeBill?: Types.ObjectId | IBill;
}

const TableSchema = new mongoose.Schema<ITable>({
    tableNumber:{
        type: Number,
        required: true,
        unique: true
    },
    isAvailable:{
        type: Boolean,
        default: true
    },
    qrCode:{
        type: String,
        unique: true
    },
    seating:{
        type: Number,
        required: false,
    },
    activeBill: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Bill", default: null 
    }

}, {timestamps: true})



export const Table: Model<ITable> = mongoose.model("Table", TableSchema)