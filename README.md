# mysql-crud
基于 mysql2 二次封装的增删改查。以高阶函数的方式进行提取，并提供了 获取器 设置器 等...

## book表
```sql
mysql> SELECT * FROM az_book;
+----+-------+----------------+-------------------------------------------------+----------------------+---------------------+-------------+
| id | cover |  title          | des                                             | author               | create_date         | delete_date |
+----+-------+----------------+-------------------------------------------------+----------------------+---------------------+-------------+
|  1 |     1 | 房思琪的初恋乐园  | 令人心碎却无能为力的真实故事。                       | 林奕含                | 2021-10-27 16:01:21  | NULL        |
|  2 |     2 | 白夜行          | 东野圭吾万千书迷心中的无冕之王                       | 东野圭吾              | 2021-10-27 16:01:33  | NULL        |
|  3 |     3 | 追风筝的人       | 12岁的阿富汗富家少爷阿米尔与仆人哈桑情同手足。然而...   | 卡勒德·胡赛尼          | 2021-10-27 16:02:00  | NULL        |
+----+-------+----------------+-------------------------------------------------+----------------------+---------------------+-------------+
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
const {spotTable, R} = db
/**
 * spotTable方法 会从初始化好的数据库中定位到指定表。并不会发生sql操作
 * @param {string} tableName 表名，如果初始化数据库传入了表前缀会加上表前缀。 book => az_book
 * @param {object} prop      可缺省的表辅助操作对象
 */
const tableBook = spotTable('book', { // 第二个参数是可以缺省的
    field: ['*'], // 对查询语句的字段嗮选， 可缺省
    order: ['id DESC'], // 查询结果根据id进行倒序， 可缺省
})

/**
 * R方法 根据spotTable去进行查询，通过返回数组的两个句柄函数。实现查询单条或者多条
 * @param {object} tableObj spotTable返回值
 * @returns [findBook 查询单条数据，返回对象。空为null, filterBook 查询多条数据，返回数组。空为null]
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
  cover:1,
  title: '房思琪的初恋乐园',
  des: '令人心碎却无能为力的真实故事。',
  author: '林奕含',
  create_date: 2021-10-27T08:01:21.000Z,
  delete_date: null
}
*/
```
> 聚合查询
```javascript
  /*
    在for循环中将发起10次查询
    SELECT * FROM az_book WHERE `id` = 1 ORDER BY id DESC LIMIT 1
    SELECT * FROM az_book WHERE `id` = 2 ORDER BY id DESC LIMIT 1
    SELECT * FROM az_book WHERE `id` = 3 ORDER BY id DESC LIMIT 1
    SELECT * FROM az_book WHERE `id` = 4 ORDER BY id DESC LIMIT 1
    SELECT * FROM az_book WHERE `id` = 5 ORDER BY id DESC LIMIT 1
    SELECT * FROM az_book WHERE `id` = 6 ORDER BY id DESC LIMIT 1
    SELECT * FROM az_book WHERE `id` = 7 ORDER BY id DESC LIMIT 1
    SELECT * FROM az_book WHERE `id` = 8 ORDER BY id DESC LIMIT 1
    SELECT * FROM az_book WHERE `id` = 9 ORDER BY id DESC LIMIT 1
    SELECT * FROM az_book WHERE `id` = 10 ORDER BY id DESC LIMIT 1
  */
  for (let i = 1, count = 10; i <= count; i++) {
    findBook({id: i}).then(console.log)
  }

  /* 
    使用 conjunctiveR 方法，最终只会发起一次查询
    SELECT * FROM az_book WHERE `id` IN (1,2,3,4,5,6,7,8,9,10) ORDER BY id DESC LIMIT 10  
  */
  const {conjunctiveR} = require('mysql-crud')
  for (let i = 1, count = 10; i <= count; i++) {
    conjunctiveR(findBook, {id: i}).then(console.log)
  }
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
  cover:1,
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
    cover: 3,
    title: '追风筝的人',
    des: '12岁的阿富汗富家少爷阿米尔与仆人哈桑情同手足。然而...',
    author: '卡勒德·胡赛尼',
    create_date: 2021-10-27T08:02:00.000Z,
    delete_date: null
  },
  {
    id: 2,
    cover: 2,
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
    cover: 2,
    title: '白夜行',
    des: '东野圭吾万千书迷心中的无冕之王\r\n',
    author: '东野圭吾',
    create_date: 2021-10-27T08:01:33.000Z,
    delete_date: null
  },
  {
    id: 1,
    cover: 1,
    title: '房思琪的初恋乐园',
    des: '令人心碎却无能为力的真实故事。',
    author: '林奕含',
    create_date: 2021-10-27T08:01:21.000Z,
    delete_date: null
  }
]
*/
```

### 新增数据
```javascript
const {C} = db
/**
 * C方法 根据spotTable来添加数据，
 * @param {object} tableObj spotTable返回值
 * @param {array} inserFields 本次新增的字段
 * @returns  [insertBook添加单条数据, insertBookList 添加多条数据]
 */
const inserFields =  ['cover', 'title', 'des', 'author', 'create_date']
const [insertBook, insertBookList] = C(tableBook, inserFields)
const saveData = {
  title: '新增标题',
  cover: 3,
  des: '描述...',
  author: '测试作者',
  create_date: '2021-10-27 08:01:21',
}
insertBook(saveData).then(console.log)
/*
sql: INSERT INTO `az_book` (`title`,`des`,`author`,`create_date`) VALUES ('新增标题','描述...','测试作者','2021-10-27 08:01:21')
结果： 
ResultSetHeader {
  fieldCount: 0,
  affectedRows: 1, // 影响的条目
  insertId: 4, // 插入的id
  info: '',
  serverStatus: 2,
  warningStatus: 0
}
*/

/* 上同 */
insertBookList([saveData, saveData, saveData]).then(console.log)
```

### 修改数据
```javascript
/**
 * U方法 根据spotTable来更新数据
 * @param {object} tableObj spotTable返回值
 * @returns  [upBook批量更新数据]
 */
const {U} = db
const [upBook] = U(tableBook)
const upData = {
  title: '更新后的标题',
}
// and 的更新条件，同R查询是一样的
const whereAnd = {
  title: '新增标题'
}
// or 的更新条件
const whereOr = null
// 更新的条目，同R的使用方式
const limit = 3
upBook(upData, whereAnd, whereOr, limit)
/*
sql: UPDATE  `az_book` SET `title` = '更新后的标题' WHERE `title` = '新增标题' ORDER BY id DESC LIMIT 3
结果：ResultSetHeader {
  fieldCount: 0,  
  affectedRows: 3,
  insertId: 0,
  info: 'Rows matched: 3  Changed: 3  Warnings: 0',
  serverStatus: 34,
  warningStatus: 0,
  changedRows: 3
}
*/
```

### 删除数据
```javascript
/**
 * D方法 根据spotTable来更新数据
 * @param {object} tableObj spotTable返回值
 * @returns  [deleteBook删除数据]
 */
const {D} = db
const [deleteBook] = D(tableBook)
// and 的更新条件，同R查询是一样的
const whereAnd = {
  title: '新增标题'
}
// or 的更新条件
const whereOr = null
// 更新的条目，同R的使用方式
const limit = 3
deleteBook(whereAnd, whereOr, limit)
/*
sql: DELETE FROM  `az_book` WHERE `title` = '新增标题' ORDER BY id DESC LIMIT 3
结果：ResultSetHeader {
  fieldCount: 0,
  affectedRows: 3,
  insertId: 0,
  info: '',
  serverStatus: 34,
  warningStatus: 0
}
*/
```

> 获取器。可以对返回的数据进行一次处理，还能进行联表查询
```javascript
const tableImage = spotTable('image', {
    // 过滤返回对象的字段
    hiddenAttr: ['width', 'height', 'from', 'create_date'],
    // getAttr
    getAttr: {
        path: (val, data) => {
            // 如果是 form 等于，表示存储在线上oss的
            if (data.from == 1) {
                return 'https://img3.doubanio.com/' + val
            }
            // 其他不处理
            return val
        }
    }
})
const [findImg, filerImgs] = R(tableImage)

// 不传查询条件获取全部
filerImgs().then(console.log)
/*
所有的path都被处理了
[
  {
    id: 1,
    path: 'https://img3.doubanio.com/view/subject/s/public/s29651121.jpg',
  },
  {
    id: 2,
    path: 'https://img3.doubanio.com/view/subject/s/public/s24514468.jpg',
  },
  {
    id: 3,
    path: 'https://img3.doubanio.com/view/subject/s/public/s1727290.jpg',
  }
]
*/


/* 联表查询  */
const tableBook2 = spotTable('book', { // 第二个参数是可以缺省的
    field: ['*'], // 对查询语句的字段嗮选， 可缺省
    order: ['id DESC'], // 查询结果根据id进行倒序， 可缺省
    getAttr: {
        cover: (val, data) => {
            // return findImg({id: val}) // 会一次性发起多次请求，不推荐 
            return conjunctiveR(findImg, {id: val}) // findImg的多次查询会被conjunctiveR聚合成一次
        }
    }
})
const [findBook, filterBook] = R(tableBook2)
findBook({delete_date: null}).then(console.log)
/*
{
  id: 16,
  cover: {
    id: 3,
    path: 'https://img3.doubanio.com/view/subject/s/public/s1727290.jpg'
  },
  title: '更新后的标题',
  des: '描述...',
  author: '测试作者',
  create_date: 2021-10-28T08:23:41.000Z,
  delete_date: null
}
*/
```

### 设置器
```javascript
const {C} = db
// 准备image表的添加
const [insertImg] = C(tableImage, ['path', 'from', 'width', 'height', 'create_date'])
const tableBook3 = spotTable('book', {
    setAttr: { // 如果拿到cover是一个路径，则先添加到 image表中
        cover: (val, data) => {
            const insertData = {
                path: val,
                from: 0,
                width: 135,
                height: 135,
                create_date: ' 2021-10-27 07:57:15'
            }
            // 添加成功返回新增的id
            return insertImg(insertData).then(result => result.insertId)
        }
    }
})

// 准备添加到 book表
const [insertBook] = C(tableBook3, ['cover', 'title', 'des', 'author', 'create_date'])
insertBook({
    title: '新增标题',
    cover: 'view/subject/s/public/s1727290.jpg',
    des: '描述...',
    author: '测试作者',
    create_date: '2021-10-27 08:01:21',
}).then(console.log)
/*
sql: INSERT INTO `az_image` (`path`,`from`,`width`,`height`,`create_date`) VALUES ('view/subject/s/public/s1727290.jpg',0,135,135,' 2021-10-27 07:57:15')
拿到cover等于4 => INSERT INTO `az_book` (`cover`,`title`,`des`,`author`,`create_date`) VALUES (4,'新增标题','描述...','测试作者','2021-10-27 08:01:21')

结果： ResultSetHeader {
  fieldCount: 0,
  affectedRows: 1,
  insertId: 17,
  info: '',
  serverStatus: 2,
  warningStatus: 0
}
*/
```

### 生命周期
```javascript
/**
 * 可监听的类型
 * connection  监听数据库连接事件，数据库开始建立连接时发起
 * enqueue     监听连接池pool回调已排队等待可用连接时，pool将发出事件
 * release     监听释放事件， release当连接被释放回池时，pool将发出一个事件。在对连接执行所有释放活动后调用此方法，因此在事件发生时该连接将被列为空闲。
 * error       数据库操作发生异常时
 * select      每次发生查询时触发
 * insert      每次写入数据触发
 * update      每次更新数据触发
 * delete      每次删除数据触发
*/
db.lifetime.listener('insert', console.log)
```
