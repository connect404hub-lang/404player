import CryptoJS from 'crypto-js';

export function decryptMediaUrl(encryptedMediaUrl) {
  if (!encryptedMediaUrl) return '';
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedMediaUrl) },
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    const decryptedUrl = decrypted.toString(CryptoJS.enc.Utf8);
    // Upgrade audio stream to 320kbps
    return decryptedUrl.replace('_96.mp4', '_320.mp4').replace('_96.m4a', '_320.m4a');
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}
