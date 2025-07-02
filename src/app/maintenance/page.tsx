import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Bảo trì hệ thống - Chấm công hàng ngày',
    description: 'Hệ thống đang được bảo trì, vui lòng quay lại sau.',
    robots: 'noindex, nofollow',
};

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Hệ thống đang bảo trì
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Chúng tôi đang nâng cấp hệ thống để mang đến trải nghiệm tốt hơn.
                        Vui lòng quay lại sau ít phút.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Thời gian dự kiến:</h3>
                        <p className="text-blue-700">15-30 phút</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Liên hệ hỗ trợ:</h3>
                        <p className="text-gray-700">Phòng CTSV - FPI Đà Nẵng</p>
                    </div>
                </div>


            </div>
        </div>
    );
}