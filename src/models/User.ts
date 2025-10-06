import mongoose, { Document, Model, Types } from "mongoose";

export enum UserRole {
    ADMIN = "ADMIN",
    STAFF = "STAFF"
}

export interface IUser extends Document {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdBy?: Types.ObjectId | IUser;
  lastLogin?: Date;
  fullName?: string;

}

const UserSchema = new mongoose.Schema<IUser>({
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: false
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        select: false
    },
    role:{
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.STAFF,
    },
    isActive:{
        type: Boolean,
        default: true
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        default: null 
    },
    lastLogin: { type: Date, default: null },


}, {timestamps: true})

UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

export const User: Model<IUser> = mongoose.model("User", UserSchema)