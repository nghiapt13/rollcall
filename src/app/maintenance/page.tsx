import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'FPI ĐÀ NẴNG',
    description: 'Hệ thống đang được bảo trì, vui lòng quay lại sau.',
    robots: 'noindex, nofollow',
};

export default function MaintenancePage() {
    return (
        <div className="bg-gray-100">
            <div className="min-h-screen flex flex-col justify-center items-center">
                <Image
                    src="/2020-Btec.png"
                    alt="BTEC"
                    width={350}
                    height={350}
                    className="mb-5"
                />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-gray-700 mb-4">TRANG WEB ĐANG ĐƯỢC BẢO TRÌ</h1>
                <p className="text-center text-gray-500 text-lg md:text-xl lg:text-2xl mb-8">Anh/chị vui lòng thử lại sau</p>
            </div>
        </div>
    );
}