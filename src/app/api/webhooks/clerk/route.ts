import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import {prisma} from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        console.log("🔔 Webhook received at:", new Date().toISOString());
        
        // Lấy signing secret từ environment
        const secret = process.env.SIGNING_SECRET;
        if (!secret) {
            console.error("❌ Missing SIGNING_SECRET environment variable");
            return new Response("Missing webhook secret", { status: 500 });
        }

        // Khởi tạo Svix webhook
        const wh = new Webhook(secret);
        const body = await req.text();
        const headerPayload = await headers();

        console.log("📨 Request headers:", {
            'svix-id': headerPayload.get("svix-id"),
            'svix-timestamp': headerPayload.get("svix-timestamp"),
            'svix-signature': headerPayload.get("svix-signature")?.substring(0, 20) + '...'
        });

        // Verify webhook signature
        let event: WebhookEvent;
        try {
            event = wh.verify(body, {
                "svix-id": headerPayload.get("svix-id")!,
                "svix-timestamp": headerPayload.get("svix-timestamp")!,
                "svix-signature": headerPayload.get("svix-signature")!,
            }) as WebhookEvent;
        } catch (err) {
            console.error("❌ Webhook verification failed:", err);
            return new Response("Invalid signature", { status: 400 });
        }

        console.log("✅ Webhook verified successfully");
        console.log("📋 Event type:", event.type);
        console.log("👤 Event data:", JSON.stringify(event.data, null, 2));

        // Xử lý các loại event
        switch (event.type) {
            case "user.created":
            case "user.updated": {
                const { id, email_addresses, first_name, last_name, image_url } = event.data;
                
                // Validation
                if (!email_addresses || email_addresses.length === 0) {
                    console.error("❌ No email addresses found for user:", id);
                    return new Response("Invalid user data - no email", { status: 400 });
                }

                const email = email_addresses[0].email_address;
                const name = `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown User';
                const imageUrl = image_url || null; // Clerk cung cấp image_url

                console.log(`👤 Processing ${event.type} for user:`, {
                    clerkId: id,
                    email: email,
                    name: name,
                    imageUrl: imageUrl
                });

                try {
                    const user = await prisma.user.upsert({
                        where: { clerkId: id },
                        update: {
                            email: email,
                            name: name,
                            imageUrl: imageUrl,
                            isActive: true,
                        },
                        create: {
                            clerkId: id,
                            email: email,
                            name: name,
                            imageUrl: imageUrl,
                            role: 'USER', // Default role
                            isActive: true,
                        },
                    });

                    console.log(`✅ User ${event.type === 'user.created' ? 'created' : 'updated'} successfully:`, {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        imageUrl: user.imageUrl
                    });
                } catch (dbError) {
                    console.error("💥 Database error:", dbError);
                    return new Response("Database error", { status: 500 });
                }
                break;
            }

            case "user.deleted": {
                const { id } = event.data;
                
                try {
                    await prisma.user.update({
                        where: { clerkId: id },
                        data: { isActive: false },
                    });

                    console.log("🗑️ User soft deleted successfully:", id);
                } catch (dbError) {
                    console.error("💥 Database error during user deletion:", dbError);
                    return new Response("Database error", { status: 500 });
                }
                break;
            }

            default:
                console.log("ℹ️ Unhandled webhook event type:", event.type);
        }

        console.log("✅ Webhook processed successfully");
        return new Response("OK", { status: 200 });
        
    } catch (error) {
        console.error("💥 Webhook processing error:", error);
        return new Response("Internal server error", { status: 500 });
    }
}