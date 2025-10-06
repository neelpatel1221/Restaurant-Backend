import { allowOnlyAdmin } from "../middlewares/permissionChecker";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Request, Response, Router } from "express";
import Joi from "joi";
import Qrcode from 'qrcode'
import { Table } from "../models/Table";

const router = Router()

router.use(authMiddleware)
router.use(allowOnlyAdmin)

router.post("/create_table", async (req: Request, res: Response) => {
    await Joi.object({
        tableNumber: Joi.number().min(1).max(999).required(),
        isAvailable: Joi.boolean().required(),
        seating: Joi.number().min(1).max(20).required()
    }).validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: false
    })

    const { tableNumber, isAvailable, seating } = req.body
    const qrPayload = `${process.env.FRONTEND_URL}/table/${tableNumber}`

    const isTableExist = await Table.findOne({ tableNumber })

    if (isTableExist) throw new Error("Table with this number already exists")

    const table = await Table.create({
        tableNumber,
        isAvailable,
        seating,
        qrCode: qrPayload
    })
    if (!table) throw new Error("Error Creating Table")

    res.send({ table: table.toObject(), message: 'Table created successfully' })
})

router.put("/update_table/:id", async (req: Request, res: Response) => {
    await Joi.object({
        tableNumber: Joi.number().min(1).max(999).required(),
        isAvailable: Joi.boolean().required(),
        seating: Joi.number().optional().min(1).max(20),
    }).validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: false
    })

    const { tableNumber, isAvailable, seating } = req.body

    const doesTableNumberExist = await Table.findOne({ tableNumber, _id: { $ne: req.params.id } })
    if (doesTableNumberExist) throw new Error("Table with this number already exists")

    const table = await Table.findById(req.params.id)

    if (!table) throw new Error("Table Not Found")



    table.tableNumber = tableNumber
    table.isAvailable = isAvailable
    table.seating = seating

    await table.save()

    res.send({ table: table.toObject(), message: 'Table updated successfully' })
})

router.delete("/delete_table/:id", async (req: Request, res: Response) => {
    await Joi.object({
        id: Joi.string().required()
    }).validateAsync(req.params, {
        abortEarly: false,
        allowUnknown: false
    })

    const table = await Table.findById(req.params.id)
    if (!table) throw new Error("Table Not Found")
    if (table.activeBill) throw new Error("Cannot delete table with active bill")
    await table.deleteOne()
    res.send({ message: 'Table deleted successfully' })
})


router.get("/:tableId/qr", async (req: Request, res: Response) => {
    await Joi.object({
        tableId: Joi.string().required()
    }).validateAsync(req.params, {
        allowUnknown: false,
        abortEarly: false
    })
    const table = await Table.findById(req.params.tableId);
    if (!table) return res.status(404).json({ message: "Table not found" });

    const qrPayload = table.qrCode;

    const qrPng = await Qrcode.toBuffer(qrPayload, { width: 300, errorCorrectionLevel: "H" });

    res.set("Content-Type", "image/png");
    res.send(qrPng);
});

router.get("/list_tables", async (req: Request, res: Response) => {
    const tables = await Table.find()
    res.status(200).send(tables)
})

export default router