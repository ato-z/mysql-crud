export declare type QuestVal = string | number | null | string[] | number[];
export interface WhereQuest {
    [prop: string]: QuestVal | Array<QuestVal>;
}
export interface InitDbOption {
    host: string;
    user: string;
    password: string;
    port?: number;
    database: string;
    table_prefix?: string;
    connectionLimit?: number;
    queueLimit?: number;
}
export interface AttrJob {
    [prop: string]: (data: any, key: any, val: any) => any | Promise<unknown>;
}
export interface SpotTableProp {
    field: string | Array<string>;
    getAttr?: AttrJob;
    setAttr?: AttrJob;
}
export interface SpotTableResult extends SpotTableProp {
    tableName: string;
}
export interface SQLSelectWhere {
    and?: WhereQuest;
    or?: WhereQuest;
    join?: 'AND' | "OR";
}
