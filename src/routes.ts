import { UserController } from "./controller/UserController"
import { GoodsController } from "./controller/GoodsController"
import { AnswerController } from "./controller/AnswerController"
import { body, checkSchema } from 'express-validator';



export const Routes = [
    {
        method: "post",
        route: "/api/v1/login", // 登录
        controller: UserController,
        action: "login",
        verify: checkSchema({
            account: {
                errorMessage: '账号必填',
                isLength: { options: { min: 1 } },
                trim: true
            },
            password: {
                errorMessage: '密码必填',
                isLength: { options: { min: 1 } },
                trim: true,
            },
        })
    },
    {
        method: "post",
        route: "/api/v1/register", //注册
        controller: UserController,
        action: "register",
        verify: checkSchema({
            account: {
                errorMessage: '账号不合法',
                matches: { options: '^[a-zA-Z][a-zA-Z0-9_]{4,15}$' },
                trim: true
            },
            password: {
                errorMessage: '密码不合法',
                matches: { options: '^[a-zA-Z]\\w{5,17}$' },
                trim: true,
            },
            okpassword: {
                errorMessage: '确认密码不合法',
                matches: { options: '^[a-zA-Z]\\w{5,17}$' },
                trim: true,
            },
            email: {
                isEmail: true,
                errorMessage: '邮箱必填',
                trim: true,
            }
        })
    },
    {
        method: "post",
        route: "/api/v1/updatepwd", // 修改密码
        controller: UserController,
        action: "updatepwd",
        verify: checkSchema({
            oldpassword: {
                errorMessage: '旧密码不合法',
                matches: { options: '^[a-zA-Z]\\w{5,17}$' },
                trim: true,
            },
            newpassword: {
                errorMessage: '新密码不合法',
                matches: { options: '^[a-zA-Z]\\w{5,17}$' },
                trim: true,
            },
            oknewpassword: {
                errorMessage: '确认密码不合法',
                matches: { options: '^[a-zA-Z]\\w{5,17}$' },
                trim: true,
            }
        })
    },
    {
        method: "get",
        route: "/api/v1/goodsList", // 首页商品列表
        controller: GoodsController,
        action: "getGoodsList",
        verify: checkSchema({})
    },
    {
        method: "get",
        route: "/api/v1/goodsTypeList", // 首页商品类型
        controller: GoodsController,
        action: "getGoodsTypeList",
        verify: checkSchema({})
    },
    {
        method: "post",
        route: "/api/v1/goodsDetails", // 首页商品详情
        controller: GoodsController,
        action: "getGoodsDetails",
        verify: checkSchema({})
    },
    {
        method: "post",
        route: "/api/v1/getGoodsSku", // 获取商品sku
        controller: GoodsController,
        action: "getGoodsSku",
        verify: checkSchema({})
    },
    {
        method: "post",
        route: "/api/v1/goodsTypeByGoods", // 根据商品类型查询商品
        controller: GoodsController,
        action: "getGoodsTypeByGoods",
        verify: checkSchema({})
    },
    {
        method: "post",
        route: "/api/v1/getAnswer", // 获取帮助
        controller: AnswerController,
        action: "getAnswer",
        verify: checkSchema({})
    }
]