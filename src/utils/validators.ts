// Validación correo electrónico válido (Regex estándar RFC 5322)
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

// Validación nombre (Mínimo 3 letras, solo letras y espacios)
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  const trimmed = name.trim();
  return trimmed.length >= 3 && nameRegex.test(trimmed);
};

// Validación DNI 
export const isValidDNI = (dni: string): boolean => {
  const cleanDNI = dni.replace(/\D/g, ''); // Saca todo lo que no sea número
  return cleanDNI.length >= 7 && cleanDNI.length <= 8;
};

// Validación número de teléfono (Espera entre 10 y 13 dígitos (considerando código de área y país opcional)
export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 13;
};

// Validación Código Postal (numérico de 4 dígitos, o CPA (letra + 4 números + 3 letras))
export const isValidZipCode = (zip: string): boolean => {
  const cleanZip = zip.replace(/\D/g, '');
  return cleanZip.length === 4;
};

// Validación dirección
export const isValidAddress = (address: string): boolean => {
  return address.trim().length >= 5;
};

// Validación ciudad
export const isValidCity = (city: string): boolean => {
  return city.trim().length >= 3;
};