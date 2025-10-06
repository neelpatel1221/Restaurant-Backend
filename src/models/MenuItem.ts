import mongoose, { Document, Model, Types } from "mongoose";
import { IMenuCategory } from "./MenuCategory";

export interface IMenuItem extends Document {
  itemName: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  categoryId: Types.ObjectId | IMenuCategory;
}

const menuItemSchema = new mongoose.Schema<IMenuItem>({
    itemName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    price: { 
        type: Number, 
        required: true 
    },
    imageUrl: {
        type: String,
        required: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuCategory",
        required: true
    },

}, {timestamps: true})

export const MenuItem: Model<IMenuItem> = mongoose.model("MenuItem", menuItemSchema)
