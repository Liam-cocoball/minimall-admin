import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"

import { User } from '../entity/User'
import { generationToken, storeUserPassword, currentFormattedTime } from "../tools/tools"

import { MessageInfo } from "../tip/tip"
import { body, validationResult } from 'express-validator';


export class UserController {

    private userRepository = AppDataSource.getRepository(User)

    // 登录
    async login(request: Request, response: Response, next: NextFunction) {
        const result = validationResult(request)
        if (result.array().length > 0) {
            return { code: 501, message: MessageInfo.Fail, data: result.array() }
        }
        // 得到账号名和密码
        let { account, password } = request.body;
        // 加密密码
        password = storeUserPassword(password)
        // 从数据库中查询数据
        let sysuser = await this.userRepository.findOne({ select: ["id"], where: { account, password } })
        if (!sysuser) {
            return { code: 500, message: MessageInfo.SysUserMatcFail }
        }
        // 修改登录时间
        sysuser.lastTime = currentFormattedTime()
        let err = undefined
        await this.userRepository.save(sysuser).then().catch(e => {
            err = e
        })
        if (err) {
            return { code: 500, message: MessageInfo.SysUserLoginFail }
        }
        // 查询查询数据
        sysuser = await this.userRepository.findOne({ select: ["id", "account", "profile", "money", "level", "phone", "email", "zfbAccount", "zfbName", "lastTime"], where: { account, password } })
        if (!sysuser) {
            return { code: 500, message: MessageInfo.SysUserLoginFail }
        }
        // 生成token 
        let token = ""
        let er = null
        await generationToken({ ...sysuser }).then(res => { token = res }).catch(err => { er = err })
        if (er) {
            console.log(er)
            return { code: 500, message: MessageInfo.SysUserLoginFail }
        }
        return {
            code: 200,
            message: MessageInfo.Success,
            data: {
                token,
                sysuser
            }
        }
    }

    // 注册
    async register(request: Request, response: Response, next: NextFunction) {
        const result = validationResult(request)
        if (result.array().length > 0) {
            return { code: 501, message: MessageInfo.Fail, data: result.array() }
        }
        // 收集到注册数据
        let { account, password, okpassword, email } = request.body
        // 判断密码和确认密码是否一致
        if (!(password === okpassword)) {
            return { code: 500, message: MessageInfo.PasswordDifferent }
        }
        // 账号必须唯一
        const sysuser = await this.userRepository.findOne({ select: ["account"], where: { account } })
        if (sysuser) {
            return { code: 500, message: MessageInfo.AccountRepeate }
        }
        // 对密码进行加密
        password = storeUserPassword(password)
        // 保存数据
        const user = Object.assign(new User(), {
            account,
            password,
            email,
            lastTime: currentFormattedTime()
        })
        let err = undefined
        this.userRepository.save(user).then(
            res => {
                // console.log('操作成功返回的数据: ', res)
            },
            er => {
                // console.log('异常：',err)
                err = er
            })
        if (err !== undefined) {
            return { code: 200, message: MessageInfo.RegisterFail }
        }
        return { code: 200, message: MessageInfo.RegisterSuccess }
    }

    // 修改密码
    async updatepwd(request: Request, response: Response, next: NextFunction) {
        const result = validationResult(request)
        if (result.array().length > 0) {
            return { code: 501, message: MessageInfo.Fail, data: result.array() }
        }
        // 收集到注册数据
        let { oldpassword, newpassword, oknewpassword } = request.body
        // 判断新密码和确认密码是否一致
        if (!(newpassword === oknewpassword)) {
            return { code: 500, message: MessageInfo.PasswordDifferent }
        }
        // 验证旧密码是否是否正确
        oldpassword = storeUserPassword(oldpassword)
        const userInfo = request.userInfo
        const sysuser = await this.userRepository.findOne({ select: ["id"], where: { account:userInfo.account, password: oldpassword } })
        if (!sysuser) {
            return { code: 500, message: MessageInfo.SysUserPasswordFail }
        }
        // 保存数据
        newpassword = storeUserPassword(newpassword)
        const user = Object.assign(new User(), {
            id: 1,
            password: newpassword
        })
        let err = undefined
        this.userRepository.update({ id: userInfo.id }, { password: newpassword }).then(
            res => {
            },
            er => {
                err = er
            })
        if (err !== undefined) {
            return { code: 200, message: MessageInfo.Fail }
        }
        return { code: 200, message: MessageInfo.Success }
    }

    // 修改资料
    async updateuser(request: Request, response: Response, next: NextFunction) {
        const result = validationResult(request)
        if (result.array().length > 0) {
            return { code: 501, message: MessageInfo.Fail, data: result.array() }
        }
        // 收集到注册数据
        let { oldpassword, newpassword, okpassword } = request.body
        // 判断新密码和确认密码是否一致
        if (!(newpassword === okpassword)) {
            return { code: 500, message: MessageInfo.PasswordDifferent }
        }
        // 验证旧密码是否是否正确
        oldpassword = storeUserPassword(oldpassword)
        console.log(request.userInfo)
        const sysuser = await this.userRepository.findOne({ select: ["account"], where: { password: oldpassword } })
        if (sysuser) {
            return { code: 500, message: MessageInfo.SysUserPasswordFail }
        }
        // 保存数据
        newpassword = storeUserPassword(newpassword)
        const user = Object.assign(new User(), {
            id: 1,
            password: newpassword
        })
        let err = undefined
        this.userRepository.save(user).then(
            res => {
            },
            er => {
                err = er
            })
        if (err !== undefined) {
            return { code: 200, message: MessageInfo.Fail }
        }
        return { code: 200, message: MessageInfo.Success }
    }
}

