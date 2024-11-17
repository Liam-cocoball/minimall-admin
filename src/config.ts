import { routes } from "./routes"


// 需要排除的api
export const urlPath = [
    '/api/v1/login',
    '/api/v1/register',
    '/api/v1/goodsTypeList',
    '/api/v1/goodsList',
    '/api/v1/goodsDetails',
    '/api/v1/getGoodsSku',
    '/api/v1/goodsTypeByGoods',
    '/api/v1/getAnswer',
    '/api/v1/createOrder',
    '/api/v1/notifyUrl',
    '/api/v1/order/page'
]






export const OrderConfig = {
    // 支付方式
    playFun: {
        Wx: 1,
        Zfb: 2,
        Ye: 3,
    },
    // 商户id
    mchId: '1699096136',
    // 支付通知地址
    notify_url: 'http://minimall.cocoball.vip/api/v1/notifyUrl',
    // 支付成功后用户点击返回商户地址
    return_url: 'http://minimall.cocoball.vip',
    // 商户密钥
    mchSign: 'ca2d39fa2344e8527a29c107da5b7cd6',
    // api支付请求模式
    apiMethod: 'post',
    // api支付地址
    apiUrl: 'https://api.ltzf.cn/api/wxpay/jsapi_convenient',
    // 支付订单过期时间
    timeExpire: '15m'
}
// 邮箱配置
export const emailConfig = {
    // 发送邮箱名字
    name: 'minimall',
    // QQ邮箱的SMTP服务器地址
    host: "smtp.qq.com",
    // 使用SSL时选择465，使用STARTTLS时选择587
    port: 465,
    // 如果使用465端口，则设置为true
    secure: true,
    auth: {
        // 你的QQ邮箱地址
        user: "2313988763@qq.com",
        // QQ邮箱的SMTP授权码
        pass: "vpzybihsiuojdjbi",
    },
    templateHtml:''
}