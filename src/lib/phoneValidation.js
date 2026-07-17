export function validateSyrianPhone(phone) {
  if (!phone || !phone.trim()) {
    return { valid: false, error: "رقم الهاتف مطلوب" };
  }
  
  let cleaned = phone.replace(/[\s\-()]/g, "");
  
  // Normalize international formats to local
  if (cleaned.startsWith("+963")) {
    cleaned = "0" + cleaned.slice(4);
  } else if (cleaned.startsWith("00963")) {
    cleaned = "0" + cleaned.slice(5);
  } else if (cleaned.startsWith("963")) {
    cleaned = "0" + cleaned.slice(3);
  }
  
  // Must be exactly 10 digits starting with 09
  if (!/^09\d{8}$/.test(cleaned)) {
    if (cleaned.length < 10) {
      return { valid: false, error: "رقم الهاتف قصير جداً. يجب أن يكون 10 أرقام ويبدأ بـ 09" };
    }
    if (cleaned.length > 10) {
      return { valid: false, error: "رقم الهاتف طويل جداً. يجب أن يكون 10 أرقام" };
    }
    return { valid: false, error: "رقم الهاتف غير صالح. يجب أن يبدأ بـ 09" };
  }
  
  // Validate operator code (3rd digit)
  const operatorCode = cleaned[2];
  const validOperators = ["2", "3", "4", "5", "6", "8", "9"];
  if (!validOperators.includes(operatorCode)) {
    return { valid: false, error: "رمز المشغل غير صالح. الأرقام الصحيحة: 092/093/094/095/096/098/099" };
  }
  
  // Check for obviously fake numbers (all same digits or sequential)
  const digits = cleaned.slice(2);
  const isAllSame = digits.split("").every((d) => d === digits[0]);
  const isSequential = "0123456789".includes(digits) || "9876543210".includes(digits);
  if (isAllSame || isSequential) {
    return { valid: false, error: "هذا الرقم غير صالح. يرجى إدخال رقم حقيقي" };
  }
  
  return { valid: true, normalized: cleaned };
}