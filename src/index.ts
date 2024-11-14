import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { routes,route } from "./routes"
import { jwtVerify } from "./tools/tools"
import { urlPath } from "./config"
import { customAlphabet } from "nanoid"
// 初始化nanoid
export const nanoid = customAlphabet('1234567890QWERTYUIOPASDFGHJKLZXCVBNM', 6);

AppDataSource.initialize().then(async () => {
    // create express app
    const app = express()
    app.use(bodyParser.json())
    app.use(async function (req, res, next) {
        const originalUrl = req.originalUrl
        console.log('请求路径: ', originalUrl, '请求参数：', req.body)
        // 只能访问系统提供的路径
        if (!route.includes(originalUrl)) {
            return res.json({ code: 500, message: '404' })
        }
        // 放行指定api以及校验token
        if (!urlPath.includes(originalUrl)) {
            let token = req.get('Authorization')
            if (token === undefined) {
                return res.json({ code: 500, message: '未认证' })
            }
            let userInfo = {}
            let err = await jwtVerify(token).then(
                res => {
                    userInfo = { ...res.payload }
                },
                er => { return er }
            )
            if (err !== undefined && (err.code === "ERR_JWT_EXPIRED" || err.code === "ERR_JWS_INVALID" || err.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED')) {
                return res.json({ code: 500, message: '登录过期,请重新登录' })
            }
            req.userInfo = userInfo
        }
        next()
    })
    // register express routes from defined application routes
    routes.forEach(route => {
        (app as any)[route.method](route.route,route.verify, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next)
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)

            } else if (result !== null && result !== undefined) {
                res.json(result)
            }
        })
    })
    // setup express app here


    // start express server
    app.listen(3000)


    console.log("Express server has started on port 3000. Open http://localhost:3000 to see results")

}).catch(error => console.log(error))


