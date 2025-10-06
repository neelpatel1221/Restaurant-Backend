import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import {readFileSync} from "fs"
import path from "path"
import { User } from "../models/User";
import { Token } from '../utils/NamespaceOverrides'


const publicKey = readFileSync(path.join(__dirname, "..", "jwt", process.env.NODE_ENV, "jwtRS256.key.pub"), "utf-8")
export const authMiddleware = async (req: Request, res: Response, next: NextFunction)=>{
try {
    const token = req.headers.authorization?.split(" ")[1]
    if(!token) return res.send({message: "No authorization header present"})
    
    const decodedToken: Token = jwt.verify(token, publicKey, {
        algorithms: ["RS256"]
    }) as Token
    
    if(!decodedToken.id) return res.status(403).send({message: "Invalid Token"})
    
    const user = await User.findOne({email: decodedToken.email})

    if(!user) return res.status(401).send({message: "User not found / token invalid / outdated / expired"})

    if(!user.isActive) return res.status(403).send({message: "User is not active"})

    req.user = user.toObject()
    next()
} catch (error) {
    console.log(error);
    return res.status(403).send({ message: 'Invalid or expired token'})
}
}