const opEnum = require('./opEnum')
/**
 * 聚合查询
 */
const conjunctiveRMap = new Map()

/**
 * 初始化IN查询的数据结构
 * @param {func} RHandle 查询函数句柄
 */
const startHandle = RHandle => {
    const data = {
        timer: null, // 定时器的指针，用于取消上一次的定时器
        dataMap: new Map(), // 用于映射数据集
        conjunctiveKey: null, // 最终组合成in查询的字段
        conjunctiveWhere: null, // 最终的查询条件
        conjunctiveIn: [], // in 查询的值
        cbs: [], // 查询成功时的回调
    }
    conjunctiveRMap.set(RHandle, data)
}

/**
 * 匹配查询条件，如果是符合IN查询的。组装进IN查询去
 * @param {object} store    startHandle组装出来的数据结构 
 * @param {object} whereAnd IN查询仅支持 and 查询语句，且只允许 opEnum.EQ 查询
 * @returns null
 */
const inHandle = (store, whereAnd) => {
    if (store.conjunctiveWhere === null) {
        store.conjunctiveWhere = Object.assign({}, whereAnd)
        return
    }
    const conjunctiveWhere = store.conjunctiveWhere
    const entries = Object.entries(conjunctiveWhere)
    let len = entries.length
    if (len !== Object.keys(whereAnd).length) {
        throw new Error(`where格式不匹配: ${JSON.stringify(conjunctiveWhere)} => ${JSON.stringify(whereAnd)}`)
    }
    for (let i = 0; i < len; i++) {
        const [key, value] = entries[i]
        const newValue = whereAnd[key]
        // 
        // 值不可为undefined
        if (newValue === undefined) { throw new Error(`查询条件 ${key} 为 undefined, ${JSON.stringify(whereAnd)}`) }
        // 如果值相同的跳过
        if (value === newValue) { continue }
        // 将第一次遇到的key当做 in 查询的条件
        if (store.conjunctiveKey === null) {
            store.conjunctiveKey = key
            store.conjunctiveIn.push(value)
            store.conjunctiveWhere[key] = [opEnum.IN, store.conjunctiveIn]
        // 仅允许存在一个in查询
        } else if (store.conjunctiveKey !== key) { 
            console.log(key)
            throw new Error(`已存在IN查询的条件 ${store.conjunctiveKey}`)
        }
        store.conjunctiveIn.push(newValue)
    }
}

/**
 * 将可能重复的N个查询，合并成一个。比如 {id:1}, {id:2}, {id: 3} => {id: [opEnum.IN, [1, 2, 3]]}
 * @param {func}   RHandle   查询句柄 
 * @param {object} whereAnd  查询条件，仅支持and查询，且只允许 opEnum.EQ 查询
 * @returns RHandle()
 */
const conjunctiveR = (RHandle, whereAnd) => {
    if (conjunctiveRMap.has(RHandle) === false) {
        startHandle(RHandle)
    }
    const store = conjunctiveRMap.get(RHandle)
    inHandle(store, whereAnd)
    clearTimeout(store.timer)

    const promiseCb = {}
    const promise = new Promise((a, b) => {
        promiseCb.resolve = a
        promiseCb.reject = b
    })
    store.cbs.push([
        dataMap => {
            let data = null
            if (dataMap instanceof Map === false) {
                data = dataMap
            } else {
                const key = whereAnd[store.conjunctiveKey]
                data = dataMap.get(key)
            }
            promiseCb.resolve(data || null)
            delete whereAnd
        },
        e => promiseCb.reject(e)
    ])
    // 开始收集, 聚合查询条件
    store.timer = setTimeout(() => {
        RHandle(store.conjunctiveWhere, null, store.conjunctiveIn.length)
        .then(li => {
            if (Array.isArray(li) === false) { return store.cbs.forEach(cb => cb[0](li)) }
            const dataMap = store.dataMap
            const key = store.conjunctiveKey
            li.forEach(element => {
                dataMap.set(element[key], element)
            })
            store.cbs.forEach(cb => cb[0](dataMap))
        }).catch(e => {
            store.cbs.forEach(cb => cb[1](e))
        })
    }, 0)

    return promise
}

module.exports = conjunctiveR