const subscribe = require('./subscribe')
module.exports = pool => {
    const executeHandle = pool.execute.bind(pool)
    const room = subscribe(pool)

    /**
     * 监听链接事件
     * pool 的 connection建立新连接时，池将发出一个事件。
     */
    pool.on('connection', (...args) => {
        room.trigger('connection', ...args)
    })

    /**
     * 监听入队事件
     * enqueue当回调已排队等待可用连接时，pool将发出事件。
     */
    pool.on('enqueue', (...args) => {
        room.trigger('enqueue', ...args)
    })

    /**
     * 监听释放事件
     * release当连接被释放回池时，pool将发出一个事件。在对连接执行所有释放活动后调用此方法，因此在事件发生时该连接将被列为空闲。
     */
    pool.on('release', (...args) => {
        room.trigger('release', ...args)
    })

    /**
     * 执行查询去捕获
     */
    pool.execute = (...args) => {
        const sql = args[0]
        let handle = args[1]
        args[1] = (...handleArgs) => {
            handle(...handleArgs)
            if (handleArgs[0] instanceof Error) {
                room.trigger('error', handleArgs[0])
            }
            handle = null
        }
        if (/^SELECT/i.test(sql)) {
            room.trigger('select', sql)
        }
        if (/^INSERT/i.test(sql)) {
            room.trigger('insert', sql)
        }
        if (/^UPDATE/.test(sql)) {
            room.trigger('update', sql)
        }
        if (/^DELETE/.test(sql)) {
            room.trigger('delete', sql)
        }
        executeHandle(...args)
    }

    return room
}