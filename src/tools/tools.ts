import * as jose from 'jose'
import { Md5 } from 'ts-md5'

const secret = new TextEncoder().encode('0f259c900c0e896f8162a73b89630fa0')



// 生成token
export function generationToken(payload: jose.JWTPayload): Promise<string> {
    const alg = 'HS256'
    return new jose.SignJWT(payload)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer('cocoball')
        .setAudience('urn:cocoball:audience')
        .setExpirationTime('24h')
        .sign(secret)
}
// 校验token
export function jwtVerify(token: string): Promise<jose.JWTVerifyResult<jose.JWTPayload>> {
    return jose.jwtVerify(token, secret)
}

// md5 加密
export function storeUserPassword(password: string): string {
    return Md5.hashStr(password);
}
// 获取当前时间
export function currentFormattedTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero based  
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
