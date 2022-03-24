export type QuestVal = string|number|null|string[]|number[]
export interface WhereQuest {
    [prop: string]: QuestVal|Array<QuestVal>
}

export interface InitDbOption {
    // 数据库地址
    host: string
    // 数据库用户名
    user: string
    // 数据库密码
    password: string
    // 端口，可缺省默认 3306
    port?: number
    // 数据库名
    database: string
    // 表前缀
    table_prefix?: string
    // 连接池数量
    connectionLimit?: number
    // 队列数
    queueLimit?: number
}

export interface AttrJob{
    [prop: string]: (data: any, key: any, val: any) => any|Promise<unknown>
}

export interface SpotTableProp {
    field: string|Array<string>
    getAttr?: AttrJob
    setAttr?: AttrJob
}

export interface SpotTableResult extends SpotTableProp {
    tableName: string
}

export interface SQLSelectQuest{
    and?: WhereQuest
    or?: WhereQuest
    join?: 'AND'|"OR",
    order?: [string, 'ASC'|'DESC'],
    limit?: number
}

export interface SQLReadSelectQuest extends Pick<SQLSelectQuest, 'and'|'or'|'join'|'order'>{
    limit?: number|[number, number]
}