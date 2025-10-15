import { IMenuItem, MenuItem } from "../models/MenuItem";
import { Bill, BillPaymentStatus, BillStatus, IBill } from "../models/Bills";
import { Router, Request, Response } from "express";
import Joi from "joi";
import { IOrder, Order, OrderStatus } from "../models/Orders";
import { Table } from "../models/Table";

const router = Router()

router.post("/place_order", async (req: Request, res: Response) => {
    await Joi.object({
        items: Joi.array().required(),
        tableNo: Joi.number().required(),
        billId: Joi.string().optional().allow(null, "")
    }).validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: false,
        convert: true
    })

    const { tableNo, items, billId } = req.body

    const doesTableExist = await Table.findOne({
        tableNumber: tableNo,
        isAvailable: true
    })

    if (!doesTableExist) {
        throw new Error("Table does not exist or is not available");
    }

    const menuItemIds = items.map(item => item._id);

    const menuItems: IMenuItem[] = await MenuItem.find(
        {
            _id: { $in: menuItemIds },
            isAvailable: true
        }
    )

    if (menuItems.length !== items.length) {
        throw new Error("Some menu items are invalid or inactive")
    }

    const itemsToBeOrdered = items.map(clientItem => {
        const menuItem = menuItems.find(menuItem => menuItem?._id?.toString() === clientItem._id)
        return {
            menuItemId: menuItem._id,
            name: menuItem.itemName,
            price: menuItem.price,
            quantity: clientItem.quantity,
            total: menuItem.price * clientItem.quantity,
        };
    });

    let bill: IBill | null = null
    if (billId) {
        bill = await Bill.findOne({
            _id: billId,
            tableId: doesTableExist._id,
            status: BillStatus.OPEN
        })

        if (!bill) throw new Error("Bill not found or bill is closed")

    } else {
        bill = await Bill.create({
            tableId: doesTableExist._id,
            orders: [],
            status: BillStatus.OPEN,
            totalAmount: 0,
            paidAmount: 0,
            paymentStatus: BillPaymentStatus.PENDING
        })
    }

    const newOrder = await Order.create({
        tableId: doesTableExist._id,
        items: itemsToBeOrdered,
        billId: bill._id,
        status: OrderStatus.PENDING,
        isActive: true,
        totalAmount: itemsToBeOrdered.reduce((acc, item) => acc + item.total, 0),
    })

    bill.orders.push(newOrder._id as IOrder)
    bill.totalAmount += newOrder.totalAmount;
    bill.save()

    const populatedBill = await Bill.findById(bill._id)
        .populate({
            path: "orders",
            model: "Order",
            populate: {
                path: "items.menuItemId",
                model: "MenuItem",
            },
        });

    const aggregatedItemsMap = new Map<string, any>();

    populatedBill.orders.forEach((order: any) => {
        order.items.forEach((item) => {
            const key = item.menuItemId._id.toString();
            if (aggregatedItemsMap.has(key)) {
                const existing = aggregatedItemsMap.get(key);
                existing.quantity += item.quantity;
                existing.total += item.total;
            } else {
                aggregatedItemsMap.set(key, { ...item.toObject() });
            }
        });
    });

    // Convert map to array
    const aggregatedItems = Array.from(aggregatedItemsMap.values());

    // Create a single order object with aggregated items
    const combinedOrder = {
        _id: bill._id,               // same as bill id for simplicity
        billId: bill._id,
        tableId: bill.tableId,
        items: aggregatedItems,
        status: bill.status,
        totalAmount: aggregatedItems.reduce((acc, i) => acc + i.total, 0),
        isActive: true
    };

    // Replace bill.orders with single aggregated order
    const responseBill = {
        ...bill.toObject(),
        orders: [combinedOrder],        // keep same structure, single order
    };

    res.json({
        message: "Order placed successfully",
        bill: responseBill,
    });


    // res.send({ message: "Order placed successfully", bill: populatedBill.toObject() })
})

router.get("/get_bill/:billId", async (req: Request, res: Response) => {
    await Joi.object({
        billId: Joi.string().required()
    }).validateAsync(req.params, {
        abortEarly: false,
        allowUnknown: false
    })

    const { billId } = req.params

    const bill = await Bill.findById(billId)
        .populate({
            path: "orders",
            model: "Order",
            populate: {
                path: "items.menuItemId",
                model: "MenuItem",
            },
        });

    if (!bill) {
        return res.status(404).send({ message: "Bill not found" })
    }

    const aggregatedItemsMap = new Map<string, any>();

    bill.orders.forEach((order: any) => {
        order.items.forEach((item) => {
            const key = item.menuItemId._id.toString();
            if (aggregatedItemsMap.has(key)) {
                const existing = aggregatedItemsMap.get(key);
                existing.quantity += item.quantity;
                existing.total += item.total;
            } else {
                aggregatedItemsMap.set(key, { ...item.toObject() });
            }
        });
    });

    // Convert map to array
    const aggregatedItems = Array.from(aggregatedItemsMap.values());

    // Create a single order object with aggregated items
    const combinedOrder = {
        _id: bill._id,               
        billId: bill._id,
        tableId: bill.tableId,
        items: aggregatedItems,
        status: bill.status,
        totalAmount: aggregatedItems.reduce((acc, i) => acc + i.total, 0),
        isActive: true
    };

    // Replace bill.orders with single aggregated order
    const responseBill = {
        ...bill.toObject(),
        orders: [combinedOrder],        // keep same structure, single order
    };

    res.json({
        bill: responseBill,
    });
})

export default router