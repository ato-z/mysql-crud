# mysql-crud
基于 mysql2 二次封装的增删改查。以高阶函数的方式进行提取，并提供了 获取器 设置器 等...

## book表
```sql
mysql> SELECT * FROM az_book;
+----+----------------+-------------------------------------------------+----------------------+---------------------+-------------+
| id | title          | des                                             | author               | create_date         | delete_date |
+----+----------------+-------------------------------------------------+----------------------+---------------------+-------------+
|  1 | 房思琪的初恋乐园  | 令人心碎却无能为力的真实故事。                       | 林奕含                | 2021-10-27 16:01:21  | NULL        |
|  2 | 白夜行          | 东野圭吾万千书迷心中的无冕之王                       | 东野圭吾              | 2021-10-27 16:01:33  | NULL        |
|  3 | 追风筝的人       | 12岁的阿富汗富家少爷阿米尔与仆人哈桑情同手足。然而...   | 卡勒德·胡赛尼          | 2021-10-27 16:02:00  | NULL        |
+----+----------------+-------------------------------------------------+----------------------+---------------------+-------------+
3 rows in set (0.00 sec)
```

## image表
```sql
mysql> SELECT * FROM az_image;
+----+--------------------------------------------------------------+-------+--------+---------------------+------+
| id | path                                                         | width | height | create_date         | from |
+----+--------------------------------------------------------------+-------+--------+---------------------+------+
|  1 | view/subject/s/public/s29651121.jpg                          |   135 |    195 | 2021-10-27 15:57:11 | 1    |
|  2 | view/subject/s/public/s24514468.jpg                          |   135 |    195 | 2021-10-27 15:57:13 | 1    |
|  3 | https://img3.doubanio.com/view/subject/s/public/s1727290.jpg |   135 |    195 | 2021-10-27 15:57:15 | 0    |
+----+--------------------------------------------------------------+-------+--------+---------------------+------+
3 rows in set (0.00 sec)
```

### 链接数据库
```javascript
const {initDb, opEnum} = require('mysql-crud')

/**
 * initDb 初始化数据库，这时候不会去进行数据库链接。
 * 只有进行表操作的时候才会进行数据库链接
 */
const db = initDb({
    // 数据库地址
    host: 'localhost',
    // 数据库用户名
    user: 'root',
    // 数据库密码
    password: '',
    // 端口，可缺省默认 3306
    port: 3306,
    // 数据库名
    database: 'az_dbtest',
    // 表前缀
    table_prefix: 'az_',
    // 连接池数量, 可缺省
    connectionLimit: 16,
    // 队列数， 可缺省
    queueLimit: 0
})
```

### 查询
```javascript
/**
 * spotTable方法 会从初始化好的数据库中定位到指定表。并不会发生sql操作
 * @param {string} tableName 表名，如果初始化数据库传入了表前缀会加上表前缀。 book => az_book
 * @param {object} prop      可缺省的表辅助操作对象
 */
const {spotTable, R} = db
const tableBook = spotTable('book', { // 第二个参数是可以缺省的
    field: ['*'], // 对查询语句的字段嗮选， 可缺省
    order: ['id DESC'], // 查询结果根据id进行倒序， 可缺省
})

/**
 * R方法 根据spotTable去进行查询，通过返回数组的两个句柄函数。实现查询单条或者多条
 */
const [findBook, filterBook] = R(tableBook)

```
> findBook即单条查询，为空返回null，不为空返回一个对象
```javascript
// 查找id为1的数据
findBook({id: 1}).then(console.log)
/*
生成的Sql语句 => SELECT * FROM az_book WHERE `id` = 1 ORDER BY id DESC LIMIT 1
结果：{
  id: 1,
  title: '房思琪的初恋乐园',
  des: '令人心碎却无能为力的真实故事。',
  author: '林奕含',
  create_date: 2021-10-27T08:01:21.000Z,
  delete_date: null
}
*/


```
> 查询表达式, 以数组的形式可以支持更复杂的查询 
```javascript
// 等于 => SELECT * FROM az_book WHERE `id` = 1 ORDER BY id DESC LIMIT 1
findBook({id: [opEnum.EQ, 1]})

// 不等于 => SELECT * FROM az_book WHERE `id` <> 1 ORDER BY id DESC LIMIT 1
findBook({id: [opEnum.NEQ, 1]})

// 大于 => SELECT * FROM az_book WHERE `id` > 1 ORDER BY id DESC LIMIT 1
findBook({id: [opEnum.GT, 1]})

// 大于等于 => SELECT * FROM az_book WHERE `id` >= 1 ORDER BY id DESC LIMIT 1
findBook({id: [opEnum.EGT, 1]})

// 小于 => SELECT * FROM az_book WHERE `id` < 2 ORDER BY id DESC LIMIT 1
findBook({id: [opEnum.LT, 1]})

// 小于等于 => SELECT * FROM az_book WHERE `id` <= 2 ORDER BY id DESC LIMIT 1
findBook({id: [opEnum.ELT, 1]})

// 模糊查询 => SELECT * FROM az_book WHERE `title` LIKE '%乐园%' ORDER BY id DESC LIMIT 1
findBook({title: [opEnum.LIKE, '%乐园%']})

// 区间查询 => SELECT * FROM az_book WHERE `id` BETWEEN 1 AND 9 ORDER BY id DESC LIMIT 1
findBook({id: [opEnum.BETWEEN, [1,9]]})

// 不在区间内查询 => SELECT * FROM az_book WHERE `id` NOT BETWEEN 1 AND 9 ORDER BY id DESC LIMIT 1
findBook({id: [opEnum.NOT_BETWEEN, [1,9]]})

// in查询 SELECT * FROM az_book WHERE `id` IN (1,2,3) ORDER BY id DESC LIMIT 1
findBook({id: [opEnum.IN, [1, 2, 3]]})

// 非in查询 SELECT * FROM az_book WHERE `id` NOT IN (1,2,3) ORDER BY id DESC LIMIT 1
findBook({id: [opEnum.NOT_IN, [1, 2, 3]]})
```
> OR 查询
```javascript
const whereAnd = {
    id: 4
}
const whereOr = {
  author: '林奕含'
}
/**
 * 查看id不等于1或者author为 林奕含 的数据
 */
findBook(whereAnd, whereOr).then(console.log) 
/*
sql: SELECT * FROM az_book WHERE (`id` = 4) OR (`author` = '林奕含') ORDER BY id DESC LIMIT 1
结果：{
  id: 1,
  title: '房思琪的初恋乐园',
  des: '令人心碎却无能为力的真实故事。',
  author: '林奕含',
  create_date: 2021-10-27T08:01:21.000Z,
  delete_date: null
}
*/
```

> 查询多条
```javascript
const whereAnd = {delete_time: null}
const whereOr = null
const limit1 = 2 // 取2条数据
const limit2 = [1, 2] // 从下标为1的数据开始取出2条，一般用于分页

// 取2条
filterBook(whereAnd, whereOr, limit1).then(console.log)
/* sql: SELECT * FROM az_book WHERE `delete_date` IS NULL ORDER BY id DESC LIMIT 2
结果: [
  {
    id: 3,
    title: '追风筝的人',
    des: '12岁的阿富汗富家少爷阿米尔与仆人哈桑情同手足。然而...',
    author: '卡勒德·胡赛尼',
    create_date: 2021-10-27T08:02:00.000Z,
    delete_date: null
  },
  {
    id: 2,
    title: '白夜行',
    des: '东野圭吾万千书迷心中的无冕之王\r\n',
    author: '东野圭吾',
    create_date: 2021-10-27T08:01:33.000Z,
    delete_date: null
  }
]
*/
filterBook(whereAnd, whereOr, limit2).then(console.log)
/*
sql: SELECT * FROM az_book WHERE `delete_date` IS NULL ORDER BY id DESC LIMIT 1,2
结果：[
  {
    id: 2,
    title: '白夜行',
    des: '东野圭吾万千书迷心中的无冕之王\r\n',
    author: '东野圭吾',
    create_date: 2021-10-27T08:01:33.000Z,
    delete_date: null
  },
  {
    id: 1,
    title: '房思琪的初恋乐园',
    des: '令人心碎却无能为力的真实故事。',
    author: '林奕含',
    create_date: 2021-10-27T08:01:21.000Z,
    delete_date: null
  }
]
*/
```
