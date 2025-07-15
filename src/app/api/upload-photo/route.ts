import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
    try {
        console.log('📤 API Upload Photo được gọi')

        // Lấy form data
        const formData = await request.formData()
        const file = formData.get('photo') as File
        const userEmail = formData.get('userEmail') as string
        const type = formData.get('type') as 'checkin' | 'checkout' || 'checkin'

        if (!file || !userEmail) {
            return NextResponse.json(
                { success: false, error: 'Thiếu file ảnh hoặc email' },
                { status: 400 }
            )
        }

        console.log('📁 File info:', {
            name: file.name,
            size: file.size,
            type: file.type,
            userEmail: userEmail,
            uploadType: type
        })

        // Kiểm tra kích thước file (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'File quá lớn. Tối đa 10MB.' },
                { status: 400 }
            )
        }

        // Kiểm tra định dạng file
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'Chỉ chấp nhận file ảnh.' },
                { status: 400 }
            )
        }

        console.log('☁️ Đang upload lên Cloudinary...')

        // Upload lên Cloudinary
        const uploadResult = await uploadToCloudinary(
            file,
            'attendance', // folder
            userEmail,
            type
        )

        console.log('✅ Upload thành công:', {
            publicId: uploadResult.public_id,
            url: uploadResult.secure_url
        })

        return NextResponse.json({
            success: true,
            message: 'Upload ảnh thành công!',
            publicId: uploadResult.public_id,
            imageUrl: uploadResult.secure_url,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format
        })

    } catch (error) {
        console.error('❌ Lỗi upload ảnh:', error)
        return NextResponse.json(
            { 
                success: false, 
                error: 'Lỗi server khi upload ảnh: ' + (error as Error).message 
            },
            { status: 500 }
        )
    }
}