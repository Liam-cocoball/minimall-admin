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
    mchId: 1699096136,
    // 支付通知地址
    notify_url: 'http://minimall.cocoball.vip/api/v1/notifyUrl',
    // 支付回调地址
    return_url: 'http://minimall.cocoball.vip/api/v1/order/page',
    // 商户密钥
    mchSign: 'ca2d39fa2344e8527a29c107da5b7cd6',
    // api支付请求模式
    apiMethod: 'post',
    // api支付地址
    apiUrl: 'https://api.ltzf.cn/api/wxpay/jsapi_convenient',
    // api支付请求头配置
    apiHeadersConf: {
        contentType: 'application/x-www-form-urlencoded'
    },
}