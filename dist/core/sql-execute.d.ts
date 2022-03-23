import mysql2 from 'mysql2';
declare const _default: <T>(pool: mysql2.Pool, sql: string) => Promise<T>;
export default _default;
