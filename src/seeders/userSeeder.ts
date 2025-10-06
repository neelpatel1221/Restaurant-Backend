import { User, UserRole } from "../models/User";
import bcrypt from "bcrypt"


export const seedUser = async ()=>{
    try {
        const user = await User.findOne({role: UserRole.ADMIN})

        if(!user){
            const hashPassword = await bcrypt.hash("Admin@123", 10)
            await User.create({
                firstName: 'Admin',
                email: 'admin@rest.com',
                password: hashPassword,
                role: UserRole.ADMIN,
            })
            console.log("Default admin user created");
        } else {
            console.log("admin user already Exist ", user.email);
        }

        
    } catch (error) {
        console.log("error while seeding User");
        process.exit(1);
    }
}