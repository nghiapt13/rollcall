import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export async function POST(request: NextRequest) {
    try {
        console.log('📤 API Upload Photo được gọi');

        // Lấy form data
        const formData = await request.formData();
        const file = formData.get('photo') as File;
        const userEmail = formData.get('userEmail') as string;

        if (!file || !userEmail) {
            return NextResponse.json(
                { success: false, error: 'Thiếu file ảnh hoặc email' },
                { status: 400 }
            );
        }

        console.log('📁 File info:', {
            name: file.name,
            size: file.size,
            type: file.type,
            userEmail: userEmail
        });

        // Cấu hình Google Drive API
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: [
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/drive'
            ],
        });

        const drive = google.drive({ version: 'v3', auth });

        // Tạo tên file với timestamp
        const timestamp = new Date().toLocaleString('vi-VN', { 
            timeZone: 'Asia/Ho_Chi_Minh' 
        }).replace(/[/:]/g, '-').replace(/\s/g, '_');
        
        const fileName = `chamcong_${userEmail}_${timestamp}.jpg`;

        console.log('☁️ Đang upload lên Google Drive...');

        // Sử dụng multipart upload để tránh lỗi pipe
        const metadata = {
            name: fileName,
            parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : undefined,
        };

        // Chuyển file thành buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResponse = await drive.files.create({
            requestBody: metadata,
            media: {
                mimeType: 'image/jpeg',
                body: Readable.from(buffer),
            },
            fields: 'id,name,webViewLink,webContentLink',
        });

        const fileId = uploadResponse.data.id;
        
        if (!fileId) {
            throw new Error('Không thể lấy file ID từ Google Drive');
        }

        console.log('✅ Upload thành công:', {
            fileId: fileId,
            fileName: fileName
        });

        // Đặt quyền public cho file (optional - để có thể xem ảnh)
        try {
            await drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });
            console.log('🔓 Đã đặt quyền public cho file');
        } catch (permError) {
            console.log('⚠️ Không thể đặt quyền public:', permError);
        }

        // Tạo link xem trực tiếp
        const directViewLink = `https://drive.google.com/file/d/${fileId}/view`;
        const thumbnailLink = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;

        return NextResponse.json({
            success: true,
            message: 'Upload ảnh thành công!',
            fileId: fileId,
            fileName: fileName,
            viewLink: directViewLink,
            thumbnailLink: thumbnailLink,
            webViewLink: uploadResponse.data.webViewLink,
        });

    } catch (error) {
        console.error('❌ Lỗi upload ảnh:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Lỗi server khi upload ảnh: ' + (error as Error).message 
            },
            { status: 500 }
        );
    }
} 