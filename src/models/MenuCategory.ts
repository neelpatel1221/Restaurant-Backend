import mongoose, { Document, Model } from "mongoose";


export interface IMenuCategory extends Document {
  categoryName: string;
  description: string;
  isActive: boolean;
}

const MenuCategorySchema = new mongoose.Schema<IMenuCategory>({
  categoryName: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description:{
    type: String,
    required: false,
  },
  isActive:{
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export const MenuCategory: Model<IMenuCategory> = mongoose.model("MenuCategory", MenuCategorySchema);
