const otpStore = new Map<string, { otp: string; expiresAt: number }>()

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const storeOTP = (email: string, otp: string): void => {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000
  })
}

export const verifyOTP = (email: string, otp: string): boolean => {
  const record = otpStore.get(email)
  if (!record) return false
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email)
    return false
  }
  if (record.otp !== otp) return false
  otpStore.delete(email)
  return true
}