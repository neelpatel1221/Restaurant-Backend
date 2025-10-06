import { UserRole } from "../models/User"
import { NextFunction, Request, Response } from "express"


export const allowOnlyAdmin = (req: Request, res: Response, next: NextFunction)=>{
        try {
            if(!req.user) throw new Error("User not found in request")
            if(req.user.role === UserRole.ADMIN) {
                next()
            } else {
                throw new Error("only Admin can access this route")
            }
        } catch (error) {
            throw new Error("only Admin can access this route")
        }

}