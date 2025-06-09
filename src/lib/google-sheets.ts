export interface LoginData {
  email: string;
  name: string;
  userId: string;
}

export async function checkAttendanceStatus(email: string) {
  try {
    const response = await fetch(`/api/check-attendance?email=${encodeURIComponent(email)}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Không thể kiểm tra trạng thái điểm danh');
    }

    return result;
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái điểm danh:', error);
    throw error;
  }
}

export async function sendLoginDataToSheet(data: LoginData) {
  try {
    console.log('🔄 Đang gửi dữ liệu điểm danh:', data);
    
    const response = await fetch('/api/google-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('📨 Kết quả từ API:', result);
    
    if (!response.ok) {
      // Nếu đã điểm danh rồi
      if (response.status === 409 && result.alreadyCheckedIn) {
        console.log('⚠️ Đã điểm danh hôm nay');
        const error = new Error(result.message) as Error & { code: string };
        error.code = 'ALREADY_CHECKED_IN';
        throw error;
      }
      
      // Nếu không có quyền
      if (response.status === 403 && result.unauthorized) {
        console.log('🚫 Không có quyền truy cập');
        const error = new Error(result.message) as Error & { code: string };
        error.code = 'UNAUTHORIZED';
        throw error;
      }
      
      // Lỗi khác
      console.log('❌ Lỗi khác:', result.error);
      throw new Error(result.error || 'Không thể gửi dữ liệu');
    }

    console.log('✅ Điểm danh thành công!');
    return result;
  } catch (error) {
    console.error('❌ Lỗi khi gửi dữ liệu:', error);
    throw error;
  }
}

interface CheckoutData {
  email: string;
  name: string;
  checkoutTime: string;
  userId: string;
}

export async function sendCheckoutDataToSheet(data: CheckoutData) {
  try {
    console.log('🔄 Đang gửi dữ liệu checkout:', data);
    
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('📨 Kết quả checkout từ API:', result);
    
    if (!response.ok) {
      // Nếu đã checkout rồi
      if (response.status === 409 && result.alreadyCheckedOut) {
        console.log('⚠️ Đã checkout hôm nay');
        const error = new Error(result.error) as Error & { code: string };
        error.code = 'ALREADY_CHECKED_OUT';
        throw error;
      }
      
      // Nếu chưa check-in
      if (response.status === 400 && result.notCheckedIn) {
        console.log('🚫 Chưa check-in hôm nay');
        const error = new Error(result.error) as Error & { code: string };
        error.code = 'NOT_CHECKED_IN';
        throw error;
      }
      
      // Lỗi khác
      console.log('❌ Lỗi khác:', result.error);
      throw new Error(result.error || 'Không thể thực hiện checkout');
    }

    console.log('✅ Checkout thành công!');
    return result;
  } catch (error) {
    console.error('❌ Lỗi khi checkout:', error);
    throw error;
  }
}