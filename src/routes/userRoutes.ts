import { User } from "../models/User";
import { Request, Response, Router } from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import path from "path";
import jwt from "jsonwebtoken";
import {readFileSync} from "fs";

const router = Router();
const privateKey = readFileSync(path.join(__dirname, "..", "jwt", process.env.NODE_ENV, "jwtRS256.key"), "utf-8")


router.post("/login", async (req: Request, res: Response)=>{
    await Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(30).required()
    }).validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: false
    })

    const {email, password} = req.body

    const doesUserExist = await User.findOne({email}).select("+password")
    if(!doesUserExist) throw new Error("Invalid  Credentials")

    if(!bcrypt.compareSync(password, doesUserExist.password)) throw new Error("Invalid  Credentials")

    const payload = {
        email: doesUserExist.email,
        id: doesUserExist._id,
        role: doesUserExist.role,
        name: doesUserExist.fullName,
        isActive: doesUserExist.isActive,
    }
    const token = await jwt.sign(payload, privateKey, {
        algorithm: "RS256",
        expiresIn: '24h'
    })

    if(!token) throw new Error("Error generating token")
    delete doesUserExist.password;
    res.send({token, user: {...doesUserExist.toObject()}})
})

export default router;