import { NextResponse } from 'next/server'
import {prisma} from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export async function POST() {
  try {
    // Lấy thông tin user từ Clerk
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const email = user.emailAddresses[0]?.emailAddress
    const name = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || email?.split('@')[0] || 'Unknown'

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email not found' },
        { status: 400 }
      )
    }

    // Tạo hoặc cập nhật user trong database
    const dbUser = await prisma.user.upsert({
      where: { clerkId: user.id },
      update: {
        email,
        name,
        isActive: true
      },
      create: {
        clerkId: user.id,
        email,
        name,
        role: 'USER', // Mặc định là USER, admin sẽ được set thủ công
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      user: dbUser
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}