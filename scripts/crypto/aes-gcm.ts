//
const fromHexString = (hexString) => Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
const toHexString = (bytes) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

//
const fromBase64String = (base64String)=> ( Uint8Array.from(window.atob(base64String), v => v.charCodeAt(0)) );
const toBase64String = (bytes)=>(btoa(String.fromCharCode.apply(null, Array.from(bytes))));


// BASE: Random Base64 from 16 bytes string as is
export const useSecretBase64Key = (secretKeyBase64 = "")=>{
    const key = fromBase64String(secretKeyBase64);
    if (key.length != 16) throw Error("Wrong key length (needs 16 bytes), has: " + key.length);
    return window.crypto.subtle.importKey(
        "raw",
        key.buffer,
        "AES-GCM",
        false,
        ["encrypt", "decrypt"],
    );
}

// IV not needed to send into server if you want store encrypted
// used in client-side, used with secret key (encoded to OBJ with JS)
export const encryptMessage = (keyObj, binary)=>{
    // iv will be needed for decryption
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    return [window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        keyObj,
        binary,
    ), toBase64String(iv)];
}

// used in client-side when got data back (please, save IV and accessID for decrypt)
export const decryptMessage = (keyObj, encryptedAndIV)=>{
    const [encrypted, iv] = encryptedAndIV;
    return window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: fromBase64String(iv) },
        keyObj,
        encrypted,
    );
}

// prefer use only in server-side (only once)
export const generateSalt = ()=>{
    return toHexString(window.crypto.getRandomValues(new Uint8Array(16)));
}

// prefer use only in server-side
// also, this key can be retrieved from server-side by 'accessKey'
// but IV you needs to be saved
export const makeSecretBase64Key = async (accessKey, salt = "")=>{
    const encoder = new TextEncoder();
    const hash = await window.crypto.subtle.digest("SHA-256", encoder.encode(accessKey + salt));
    return toBase64String(new Uint8Array(hash));
}

//
export const useWithAccess = (accessKey = "", encryptedAndIV = [])=>{
    return { accessKey, encryptedAndIV }
}

// use as request ID (identify when sending requests)
export const UUIDv4 = () => {
    return crypto?.randomUUID ? crypto?.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16));
};
