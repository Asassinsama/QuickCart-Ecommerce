import connectDB from "@/config/db";
import User from "@/models/user";
import { getAuth } from "@clerk/nextjs/server"; 
import { NextResponse } from "next/server";

export async function GET(request) {
    try {

        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await connectDB()

            const userCount = await User.countDocuments();

        const user = await User.findById(userId);

        if(!user){
            return NextResponse.json({ success: false, message: "User Not Found"})
        }

        return NextResponse.json({ success:true, user })
    } catch (error) {
        console.error("API Error:", error); 
         return NextResponse.json({ success: false, message: error.message})
    }
}