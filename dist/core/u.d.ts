import mysql2 from 'mysql2';
import { SpotTableResult, SQLSelectWhere } from '../tool/interface';
export declare const UPDATE: (tableName: string, updata: object, where?: SQLSelectWhere | undefined, groupBy?: [string, "DESC" | "ASC"] | undefined, limit?: number | undefined) => string;
export declare const buildU: (pool: mysql2.Pool) => (spotTable: SpotTableResult) => (updata: object, where?: SQLSelectWhere | undefined, order?: [string, "DESC" | "ASC"] | undefined, limit?: number | undefined) => Promise<mysql2.ResultSetHeader>;
