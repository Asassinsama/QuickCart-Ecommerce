import connectDB from "@/config/db"; // Add this import change
import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/user";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(request) {
    try {
         await connectDB // Connect to DB first change

        const { userId } = await auth();
        const { address, items } = await request.json();

        if (!address || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid order' });
        }

        // Caalculate amount
        /*const amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return await acc + product.offerPrice * item.quantity;
        }, 0);*/
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                amount += product.offerPrice * item.quantity;
            }
        }

       

        await inngest.send({
            name: 'order/created',
            data: {
                userId,
                address,
                items,
                amount: amount + Math.floor(amount * 0.02), // Including 2% tax
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
