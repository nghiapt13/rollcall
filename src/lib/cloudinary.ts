import { v2 as cloudinary } from 'cloudinary'

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
    public_id: string
    secure_url: string
    width: number
    height: number
    format: string
    resource_type: string
}

export async function uploadToCloudinary(
    file: File,
    folder: string = 'attendance',
    userEmail: string,
    type: 'checkin' | 'checkout' = 'checkin'
): Promise<UploadResult> {
    try {
        // Chuyển file thành base64
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64 = buffer.toString('base64')
        const dataURI = `data:${file.type};base64,${base64}`

        // Tạo public_id có ý nghĩa
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const publicId = `${folder}/${type}_${userEmail.replace('@', '_')}_${timestamp}`

        // Upload lên Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            public_id: publicId,
            folder: folder,
            resource_type: 'image',
            transformation: [
                { width: 800, height: 600, crop: 'limit' }, // Resize để tiết kiệm storage
                { quality: 'auto:good' }, // Tự động optimize chất lượng
                { format: 'auto' } // Tự động chọn format tốt nhất
            ],
            tags: [type, userEmail, 'attendance'] // Tags để dễ quản lý
        })

        return {
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            resource_type: result.resource_type
        }
    } catch (error) {
        console.error('Cloudinary upload error:', error)
        throw new Error('Failed to upload image to Cloudinary')
    }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.error('Cloudinary delete error:', error)
        throw new Error('Failed to delete image from Cloudinary')
    }
}

// Tạo URL với transformation
export function getOptimizedImageUrl(
    publicId: string,
    width?: number,
    height?: number
): string {
    return cloudinary.url(publicId, {
        width: width || 400,
        height: height || 300,
        crop: 'fill',
        quality: 'auto:good',
        format: 'auto'
    })
}