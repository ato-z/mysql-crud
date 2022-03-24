import mysql2 from 'mysql2';
import { SpotTableResult, SQLSelectQuest } from "../tool/interface";
export declare const _DELETE: (tableName: string, quest?: SQLSelectQuest | undefined) => string;
export declare const biuldD: (pool: mysql2.Pool) => (spotTable: SpotTableResult) => (quest?: SQLSelectQuest | undefined) => Promise<mysql2.ResultSetHeader>;
