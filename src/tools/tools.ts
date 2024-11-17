import * as jose from 'jose'
import { Md5 } from 'ts-md5'


import nodemailer = require("nodemailer");
import { emailConfig } from '../config';


// 创建Transport对象，使用QQ邮箱的SMTP服务器信息
const transporter = nodemailer.createTransport({
    host: emailConfig.host, // QQ邮箱的SMTP服务器地址
    port: emailConfig.port, // 使用SSL时选择465，使用STARTTLS时选择587
    secure: emailConfig.secure, // 如果使用465端口，则设置为true
    auth: {
        user: emailConfig.auth.user, // 你的QQ邮箱地址
        pass: emailConfig.auth.pass, // QQ邮箱的SMTP授权码
    },
});

// 异步函数，用于发送邮件
export async function sendMail(toemail: string, subject: string, html: string) {
    try {
        const email = {
            from: emailConfig.name + ' < ' + emailConfig.auth.user + ' > ',
            to: toemail,
            subject: subject,
            html: html,
        }
        console.log('email 参数: ', email)
        const info = await transporter.sendMail(email)
        console.log("Message sent: %s", info.messageId)
    } catch (err) {
        console.log("发送邮箱失败," + err)
    }
}


// jwt密钥
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


// 支付签名Sign
export function wxPaySign(params: any, key: any) {
    const paramsArr = Object.keys(params);
    paramsArr.sort();
    const stringArr = [];
    paramsArr.map(key => {
        stringArr.push(key + '=' + params[key]);
    });
    // 最后加上商户Key
    stringArr.push("key=" + key);
    const string = stringArr.join('&');
    return Md5.hashStr(string).toString().toUpperCase();
}

// 返回当前时间戳
export function timestampInSeconds(): number {
    return Math.floor(new Date().getTime() / 1000)
}