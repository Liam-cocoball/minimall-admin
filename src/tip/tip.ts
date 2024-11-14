export const enum MessageInfo {
    // 通用提示
    Success = "操作成功",
    Fail = "操作失败",
    ParamsFail = "参数错误",
    GetDataFail = "获取数据错误",

    // 用户错误提示
    UserNotFoundFail = '用户错误',
    
    SysUserMatcFail = '用户或密码错误',
    SysUserLoginFail = '登录失败,请稍后再试',
    SysUserPasswordFail = '密码错误,修改失败',

    LoginSuccess = '登录成功',
    RegisterSuccess = '注册成功',
    RegisterFail = '注册失败',
    AccountRepeate = '账号重复,无法注册',
    PasswordDifferent = '密码和确认密码不一致',


    PlayFun = "支付模式错误",
    MchId = "商户错误",
    
    GetGoodsFail = "获取商品失败",
   
    GetGoodsTypeFail = "获取商品分类失败",
    GetGoodsTargFail = "获取商品标签失败",
    GetSpecialTargFail = "获取商品规格失败",
        
    Inventory = "购买数量不能大于库存",


    OrderCreateFail = "订单创建失败,请稍后再试",
    OrderNotFont = "订单错误",
    OrderCreateSuccess = "订单创建成功,请尽快支付"


}