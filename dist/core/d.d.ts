import mysql2 from 'mysql2';
import { SpotTableResult, SQLSelectWhere } from "../tool/interface";
export declare const _DELETE: (tableName: string, where?: SQLSelectWhere | undefined, groupBy?: [string, "DESC" | "ASC"] | undefined, limit?: number | undefined) => string;
export declare const biuldD: (pool: mysql2.Pool) => (spotTable: SpotTableResult) => (where?: SQLSelectWhere | undefined, order?: [string, "DESC" | "ASC"] | undefined, limit?: number | undefined) => Promise<mysql2.ResultSetHeader>;
