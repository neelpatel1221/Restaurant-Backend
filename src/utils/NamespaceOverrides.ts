import {IUser} from "../models/User";

export interface Token {
  id: number
  email: string
  name: number
  role: string
  status: string
}

declare global {
  export namespace Express {
    interface Request {
      locals: any,
      user: IUser
    }
  }
}