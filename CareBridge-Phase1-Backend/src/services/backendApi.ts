const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

export interface OtpRequestResponse {
  challengeId: string;
  expiresInSeconds: number;
  testMode: boolean;
  testOtp?: string;
  message: string;
}

export async function requestOtp(phone: string): Promise<OtpRequestResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  if (!response.ok) throw new Error((await response.json()).error || 'Unable to request OTP');
  return response.json();
}

export async function verifyOtp(challengeId: string, otp: string, role?: 'patient' | 'doctor', fullName?: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeId, otp, role, fullName }),
  });
  if (!response.ok) throw new Error((await response.json()).error || 'Unable to verify OTP');
  return response.json();
}
