import { Routes } from "./routes"

// 需要排除的api
export const urlPath = [
    '/api/v1/login', 
    '/api/v1/register',
    '/api/v1/goodsTypeList',
    '/api/v1/goodsList',
    '/api/v1/goodsDetails',
    '/api/v1/getGoodsSku',
    '/api/v1/goodsTypeByGoods',
    '/api/v1/getAnswer'
]

// 收集系统所有路径
export const routes = []
Routes.forEach(r => {
    routes.push(r.route.split(':')[0])
})