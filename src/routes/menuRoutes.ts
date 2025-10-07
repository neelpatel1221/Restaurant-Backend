import { authMiddleware } from "../middlewares/authMiddleware";
import { allowOnlyAdmin } from "../middlewares/permissionChecker";
import { MenuCategory } from "../models/MenuCategory";
import { MenuItem } from "../models/MenuItem";
import { Request, Response, Router } from "express";
import Joi from "joi";
import upload from "../utils/multer";
import cloudinary from "../utils/cloudinary";
import streamifier from "streamifier";

const router = Router()

router.use(authMiddleware)
router.use(allowOnlyAdmin)

router.get("/", async (req: Request, res: Response) => {
    const menu = await MenuCategory.aggregate([
        {
            $match: {
                isActive: true
            }
        },
        {
            $lookup: {
                from: 'menuitems',
                let: { catId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$categoryId", "$$catId"] },
                            isAvailable: true
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            itemId: "$_id",
                            name: "$itemName",
                            itemDescription: "$description",
                            price: 1,
                            imageUrl: 1
                        }
                    }
                ],
                as: "items"
            }
        },
        {
            $project: {
                _id: 0,
                categoryName: "$categoryName",        
                categoryId: "$_id",        
                categoryDescription: "$description",   
                items: 1
            }
        }
    ]);

    res.send( menu );
})




router.get("/list_categories", async (req: Request, res: Response) => {
    const categories = await MenuCategory.find()
    res.send({ categories })
})

router.get("/get_category/:id", async (req: Request, res: Response) => {
    await Joi.object({
        id: Joi.string().required()
    }).validateAsync(req.params, {
        abortEarly: false,
        allowUnknown: false
    })
    const category = await MenuCategory.findById(req.params.id)
    if (!category) throw new Error("Menu Category Not Found")
    res.send({ category })
})

router.post("/create_category", async (req: Request, res: Response) => {
    await Joi.object({
        categoryName: Joi.string().required(),
        description: Joi.string().optional().allow(null, ""),
        isActive: Joi.boolean().optional(),
    }).validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: false
    })

    const { categoryName, description, isActive } = req.body
    const normalizedCategoryName = categoryName.trim().toLowerCase()

    const isMenuCatExist = await MenuCategory.findOne({ categoryName: normalizedCategoryName })

    if (isMenuCatExist) throw new Error("Menu with Same Category Exists")

    const category = await MenuCategory.create({
        categoryName: normalizedCategoryName,
        description,
        isActive
    })

    res.send({ category, message: "Menu Category Created Successfully" })
})

router.put("/update_category/:id", async (req: Request, res: Response) => {
    await Joi.object({
        categoryName: Joi.string().required(),
        description: Joi.string().optional().allow(null, ""),
        isActive: Joi.boolean().optional(),
    }).validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: false
    })

    const { categoryName, description, isActive } = req.body

    const menuCategory = await MenuCategory.findById(req.params.id)

    if (!menuCategory) throw new Error("Menu Category Not Found")

    menuCategory.categoryName = categoryName
    menuCategory.description = description
    menuCategory.isActive = isActive

    await menuCategory.save()

    res.send({ menuCategory, message: "Menu Category Updated Successfully" })
})

router.delete("/delete_category/:id", async (req: Request, res: Response) => {
    await Joi.object({
        id: Joi.string().required()
    }).validateAsync(req.params, {
        abortEarly: false,
        allowUnknown: false
    })

    const menuCategory = await MenuCategory.findByIdAndDelete(req.params.id)

    if (!menuCategory) throw new Error("Menu Category Not Found")

    res.send({ message: "Menu Category Deleted Successfully" })
})

router.get("/list_menu_items", async (req: Request, res: Response) => {
    const menuItems = await MenuItem.find().populate("categoryId")
    res.send({ menuItems })
})

router.post("/create_menu_item", upload.single("image"), async (req: Request, res: Response) => {
    await Joi.object({
        itemName: Joi.string().required(),
        description: Joi.string().optional().allow(null, ""),
        price: Joi.number().min(1).max(9999).required(),
        categoryId: Joi.string().required(),
        isAvailable: Joi.boolean().optional(),
    }).validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: false
    })

    const { itemName, description, price, categoryId, isAvailable = true } = req.body

    const isCatAvailable = await MenuCategory.findById(categoryId)
    if (!isCatAvailable) throw new Error("Menu Category Not Found")

        let imageUrl = "";

    if(req.file){
        const streamUpload = async ()=>{
            return new Promise((resolve, reject)=>{
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'menu_items',
                        resource_type: 'image'
                    },
                    (error, result)=>{
                        if (result) resolve(result)
                        else reject(error);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream)
            })
        }
        const result: any = await streamUpload()
        imageUrl = result.secure_url;
    }

    const menuItem = await MenuItem.create({
        itemName,
        description,
        price,
        categoryId,
        isAvailable,
        imageUrl
    })

    res.send({ menuItem, message: "Menu Item Created Successfully" })
})

router.put("/update_menu_item/:id", async (req: Request, res: Response) => {
    await Joi.object({
        itemName: Joi.string().required(),
        description: Joi.string().optional().allow(null, ""),
        price: Joi.number().min(1).max(9999).required(),
        categoryId: Joi.string().required(),
        isAvailable: Joi.boolean().required(),
    }).validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: false
    })

    const { itemName, description, price, categoryId, isAvailable } = req.body

    const meuItem = await MenuItem.findById(req.params.id)
    if (!meuItem) throw new Error("Menu Item Not Found")

    const isCatAvailable = await MenuCategory.findById(categoryId)
    if (!isCatAvailable) throw new Error("Menu Category Not Found")

    meuItem.itemName = itemName
    meuItem.description = description
    meuItem.price = price
    meuItem.categoryId = categoryId
    meuItem.isAvailable = isAvailable

    await meuItem.save()

    res.send({ menuItem: meuItem, message: "Menu Item Updated Successfully" })
})

router.delete("/delete_menu_item/:id", async (req: Request, res: Response) => {
    await Joi.object({
        id: Joi.string().required()
    }).validateAsync(req.params, {
        abortEarly: false,
        allowUnknown: false
    })

    const meuItem = await MenuItem.findById(req.params.id)
    if (!meuItem) throw new Error("Menu Item Not Found")

    await meuItem.deleteOne()

    res.send({ message: "Menu Item Deleted Successfully" })
})

export default router