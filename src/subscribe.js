/**
 * 发布订阅模式
 */
const roomMap = new Map()
const subscribe = soleKey => {
    if (roomMap.has(soleKey) === false) {
        roomMap.set(soleKey, new Map())
    }
    const room = roomMap.get(soleKey)
    return {
        listener: (type, handle) => {
            if (room.has(type) === false) {
                room.set(type, new Set())
            }
            const queue = room.get(type)
            queue.add(handle)
        },
        un: (type, handle) => {
            if (room.has(type) === false) {
                throw new Error(`queue ${type} is undefiend `)
            }
            room.get(type).delete(handle)
        },
        trigger: (type, ...args) => {
            if (room.has(type) === false) { return null }
            const queue = room.get(type)
            queue.forEach(handle => {
                try{
                    handle(...args)
                    delete args
                } catch (e) {
                    console.error(e)
                }
            })
        }
    }    
}

module.exports = subscribe