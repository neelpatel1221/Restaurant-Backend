import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"
dotenv.config();
import streamifier from 'streamifier';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

export const uploadToCloudinary = (buffer: Buffer, folder = 'menu_items') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'menu_items',
                resource_type: 'image'
            },
            (error, result) => {
                if (result) resolve(result)
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream)
    })
};

const extractPublicId = (url: string): string | null => {
    try {
        const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
        return matches ? matches[1] : null;
    } catch {
        return null;
    }
};


export const deleteFromCloudinary = async (imageUrl: string) => {
    const publicId = extractPublicId(imageUrl);

    if (!publicId) {
        throw new Error("Invalid Cloudinary image URL");
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
        });

        return result;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to delete image from Cloudinary");
    }
};