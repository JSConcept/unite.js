//
const fromHexString = (hexString) => Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
const toHexString = (bytes) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

// BASE: Random Base64 from 16 bytes string as is
export const useSecretBase64Key = (secretKeyBase64 = "")=>{
    const key = Uint8Array.from(window.atob(secretKeyBase64), v => v.charCodeAt(0));
    if (key.length != 16) throw Error("Wrong key length (needs 16 bytes), has: " + key.length);
    return window.crypto.subtle.importKey(
        "raw",
        key.buffer,
        "AES-GCM",
        false,
        ["encrypt", "decrypt"],
    );
}

//
export const encryptMessage = (keyObj, binary)=>{
    // iv will be needed for decryption
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    return [window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        keyObj,
        binary,
    ), toHexString(iv)];
}

//
export const decryptMessage = (keyObj, encryptedAndIV)=>{
    const [encrypted, iv] = encryptedAndIV;
    return window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: fromHexString(iv) },
        keyObj,
        encrypted,
    );
}

// prefer use only in server-side (only once)
export const generateSalt = ()=>{
    return toHexString(window.crypto.getRandomValues(new Uint8Array(16)));
}

// prefer use only in server-side
export const makeSecretBase64Key = async (accessKey, salt = "")=>{
    const encoder = new TextEncoder();
    const hash = await window.crypto.subtle.digest("SHA-256", encoder.encode(accessKey + salt));
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(hash))));
}

//
export const useWithAccess = (accessKey = "", encryptedAndIV = [])=>{
    return { accessKey, encryptedAndIV }
}

// use as request ID (identify when sending requests)
export const UUIDv4 = () => {
    return crypto?.randomUUID ? crypto?.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16));
};
