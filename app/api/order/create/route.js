import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/user";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(request) {
    try {
        const { userId } = await auth();
        const { address, items } = await request.json();

        if (!address || !items || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Address and items are required to create an order' });
        }

        // Caalculate amount
        const amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return acc + (product.offerPrice * item.quantity);
        }, 0);

        await inngest.send({
            name: 'order/created',
            data: {
                userId,
                items,
                amount: amount + Math.floor(amount * 0.02), // Including 2% tax
                address,
                status: 'Order Placed',
                date: Date.now()
            }
        });

        //clear cart items after order creation
        const user = await User.findById(userId);
        user.cartItems = {};
        await user.save();

        return NextResponse.json({ success: true, message: 'Order created successfully' });

    } catch (error) {
        console.log("Error creating order:", error);
        return NextResponse.json({ success: false, message: error.message });
    }
}
