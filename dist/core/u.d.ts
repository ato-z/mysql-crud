import mysql2 from 'mysql2';
import { SpotTableResult, SQLSelectQuest } from '../tool/interface';
export declare const UPDATE: (tableName: string, updata: object, quest?: SQLSelectQuest | undefined) => string;
export declare const buildU: (pool: mysql2.Pool) => (spotTable: SpotTableResult) => (updata: object, query?: SQLSelectQuest | undefined) => Promise<mysql2.ResultSetHeader>;
