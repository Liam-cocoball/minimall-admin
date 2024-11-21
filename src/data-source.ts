import "reflect-metadata"
import { DataSource, DataSourceOptions } from "typeorm"
import { User } from "./entity/User"
import { SysUser } from "./entity/SysUser"
import { GoodsType, GoodsSpecs, GoodsSpecsInfo, Goods, GoodsInfo, GoodsTarg } from "./entity/Goods"
import { Answer } from "./entity/Answer"
import { Order } from "./entity/Order"
const hwmysql: DataSourceOptions = {
    type: "mysql",
    host: "122.9.117.69",
    port: 3306,
    username: "minimall",
    password: "Qwertyuiop123",
    database: "minimall",
    synchronize: true,
    logging: false,
    entities: [User, GoodsType, GoodsSpecs, GoodsSpecsInfo, Goods, GoodsInfo, GoodsTarg, Answer, SysUser, Order],
    migrations: [],
    subscribers: [],
    cache: {
        duration: 30000
    }
}
let mysqldb: DataSourceOptions = {
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "root-minimall",
    database: "minimall",
    synchronize: true,
    logging: false,
    entities: [User, GoodsType, GoodsSpecs, GoodsSpecsInfo, Goods, GoodsInfo, GoodsTarg, Answer, SysUser],
    migrations: [],
    subscribers: [],
    cache: {
        duration: 30000 // 30 seconds
    }
}

export const AppDataSource = new DataSource(hwmysql)
