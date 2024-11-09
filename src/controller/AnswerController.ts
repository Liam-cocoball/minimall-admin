import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Answer } from '../entity/Answer'
import { MessageInfo } from "../tip/tip"
import { In } from "typeorm"


export class AnswerController {
    private AnswerRepository = AppDataSource.getRepository(Answer)
    // 获取帮助数据
    async getAnswer(request: Request, response: Response, next: NextFunction) {
        let err = undefined
        const { id } = request.body
        let aid: number = 0
        try {
            aid = parseInt(id)
        } catch {
            aid = 0
        }
        let answers: Answer[] = []
        await this.AnswerRepository.find({
            where: {
                parentalId: id
            }
        }).then(res => {
            answers = res
        }, er => {
            err = er
        })
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetDataFail }
        }
        // 如果不是查询顶级就直接返回
        if (aid !== 0) {
            let data = {
                code: 200,
                message: MessageInfo.Success,
                data:{}
            }
            if (answers.length > 0) {
                data.data = answers[0]
            }else{
                data.data = answers
            }
            return { code: 200, message: MessageInfo.Success, data }
        }
        // 查询子级
        let ids = []
        answers.forEach(item => {
            ids.push(item.id)
        })
        let answersSon: Answer[] = []
        await this.AnswerRepository.findBy(
            {
                parentalId: In(ids)
            }
        ).then(res => {
            answersSon = res
        }, er => {
            err = er
        })
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetDataFail }
        }
        // 组装父子级数据
        for (let i = 0; i < answers.length; i++) {
            const e1 = answers[i];
            for (let j = 0; j < answersSon.length; j++) {
                const e2 = answersSon[j];
                if (e1.id === e2.parentalId) {
                    answers[i].answer.push(e2)
                }
            }
        }
        return { code: 200, message: MessageInfo.Success, data: answers }
    }
}

