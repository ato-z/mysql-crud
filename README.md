<h1 align="center">mysql-curd</h1>
<p align="center">
    <a href=".">
        <img src="https://img.shields.io/badge/Node-6.0.0%2B-green" alt="node-6+">
    </a>
    <a>
        <img src="https://img.shields.io/badge/mysql2-%5E2.3.3-yellowgreen" alt="mysql2" />
    </a>
    <a href=".">
        <img src="https://img.shields.io/badge/yarn-v1.22.17-blue" alt="yarn">
    </a>
    <a href=".">
        <img src="https://img.shields.io/badge/LANG-TS-brightgreen" alt="lang:ts">
    </a>
</p>

* 适用于前端开发人员进行的mysql数据库读写， 以函数式的方式来调用。

* 目前已实现了增删查改/获取器/设置器

* 支持仅输出sql语句方便调试

* 文档写得丑陋，建议直接看ts提示


## 准备工作
** 使用npm或yarn安装 **
1. npm切换阿里镜像源
```sh
npm config set registry https://registry.nlark.com
```

2. 使用 npm
```sh
npm install mysql-curd
```

3. yarn 安装
```sh
yarn add mysql-curd
```
## 目录
> 
> [开始使用](#开始使用)
> - [初始化数据库](#初始化数据库)
> - [定位表](#定位表)
> - [R 查询](#r-查询)
> - [where条件](#where条件)
>   - [一个简单查询](#一个简单查询)
>     - [OP.EQ 等于](#opeq-等于)
>     - [OP.NEQ 不等于](#opneq-不等于)
>     - [OP.GT 大于](#opgt-大于)
>     - [OP.EGT 大于](#opegt-大于)
>     - [OP.LT 小于](#oplt-小于)
>     - [OP.ELT 小于等于](#opelt-小于等于)
>     - [OP.LIKE 模糊查询](#oplike-模糊查询)
>     - [OP.BETWEEN 区间查询](#opbetween-区间查询)
>     - [OP.NOT_BETWEEN 区间查询](#opnot_between-区间查询)
>     - [OP.IN in查询](#opin-in查询)
>     - [OP.NOT_IN not in查询](#opnot_in-not-in查询)
>   - [复合查询](#复合查询)
>     - [and条件](#and条件)
>     - [or条件](#or条件)
>     - [and 与 or 组合使用](#and-与-or-组合使用)
> - [orderby-排序](#orderby-排序)
> - [limit 获取指定条目](#limit-获取指定条目)
> - [C 新增](#c-新增)
> - [U 更新数据](#u-更新数据)
> - [删除数据](#删除数据)
> - [getAttr 获取器](#getattr-获取器)
>   - [连表查询](#连表查询)
> - [setAttr 设置器](#setattr-设置器)
> - [自订SQL执行](#自订sql执行)

## 开始使用
### 初始化数据库
initDb 初始化数据库，这时候不会去进行数据库链接。只有进行表操作的时候才会进行数据库链接
```typescript
import {initDb} from 'mysql-curd'

/**
 * 链接配置
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

### 定位表
在进行增删查改之前，需要定位到具体的某一个张表。用于后续的数据库操作。
spotTable方法 会从初始化好的数据库中定位到指定表。并不会执行sql操作。
```typescript
/**
 * @param {string} tableName 表名，如果初始化数据库传入了表前缀会加上表前缀。 book => az_book
 * @param {object} prop      可缺省的表辅助操作对象
 */
const tableBook = spotTable('book', { // 第二个参数是可以缺省的
    field: ['*'], // 对查询语句的字段嗮选， 可缺省
})

```

### R 查询
查询操作是最基本的，查询方法同样适用于更新与删除。 <br />
R函数接受 spotTable 的结果，返回一个查询spotTable定位表的函数。
```typescript
import {SELECT} from 'mysql-curd'
const {R} = db
const qusetBookList = R(tableBook)

// 查询所有
qusetBookList().then(list => {
    //  如果为空返回 null
    if (list !== null) {
        // 反之返回列表数据
        console.log('bookList', list)
    }
})

// 输出查询的sql语句
const field = '*' // 所有字段
const tableName = 'az_book' // 表名

console.log(SELECT(field, tableName)) // SELECT * FROM az_book
```

### where条件
查询条件可以是复杂的，可以是用and查询或or查询
#### 一个简单查询
```typescript
// 查询id等于1的书本数据
const where = {
    and: {
        id: 1
    }
}
qusetBookList(where).then(list => {
    //  如果为空返回 null
    if (list !== null) {
        // 反之返回列表数据
        console.log('book', list[0])
    }
})
```
#### 使用操作符号
##### OP.EQ 等于
```typescript
import {OP} from 'mysql-curd'
const where = {
    and: {
        id: [OP.EQ, 1]
    }
}
qusetBookList(where).then(console.log)
```

##### OP.NEQ 不等于
```typescript
import {OP} from 'mysql-curd'
const where = {
    and: {
        id: [OP.NEQ, 1]
    }
}
qusetBookList(where).then(console.log)
```

##### OP.GT 大于
```typescript
import {OP} from 'mysql-curd'
const where = {
    and: {
        id: [OP.GT, 1]
    }
}
qusetBookList(where).then(console.log)
```

##### OP.EGT 大于
```typescript
import {OP} from 'mysql-curd'
const where = {
    and: {
        id: [OP.EGT, 1]
    }
}
qusetBookList(where).then(console.log)
```

##### OP.LT 小于
```typescript
import {OP} from 'mysql-curd'
const where = {
    and: {
        id: [OP.LT, 1]
    }
}
qusetBookList(where).then(console.log)
```

##### OP.ELT 小于等于
```typescript
import {OP} from 'mysql-curd'
const where = {
    and: {
        id: [OP.ELT, 1]
    }
}
qusetBookList(where).then(console.log)
```

##### OP.LIKE 模糊查询
```typescript
import {OP} from 'mysql-curd'
const where = {
    and: {
        title: [OP.LIKE, '%花园%']
    }
}
qusetBookList(where).then(console.log)
```

##### OP.BETWEEN 区间查询
```typescript
import {OP} from 'mysql-curd'
const where = {
    and: {
        // 查询 id为 1～10之间对数据
        id: [OP.BETWEEN, [1, 10]]
    }
}
qusetBookList(where).then(console.log)
```

##### OP.NOT_BETWEEN 区间查询
```typescript
import {OP} from 'mysql-curd'
const where = {
    and: {
        // 查询 id不在 1～10之间对数据
        id: [OP.NOT_BETWEEN, [1, 10]]
    }
}
qusetBookList(where).then(console.log)
```

##### OP.IN in查询
```typescript
import {OP} from 'mysql-curd'
const where = {
    and: {
        // 查询id为1 3 5 7
        id: [OP.IN, [1, 3, 5, 7]]
    }
}
qusetBookList(where).then(console.log)
```

##### OP.NOT_IN not in查询
```typescript
import {OP} from 'mysql-curd'
const where = {
    and: {
        // 查询id不为1 3 5 7
        id: [OP.NOT_IN, [1, 3, 5, 7]]
    }
}
qusetBookList(where).then(console.log)
```

#### 复合查询
对于复杂的查询条件可以交叉使用 and 或 or 查询， 支持仅输出sql语句模式。
##### and条件
> and 须所有条件都满足
```typescript
import { SELECT, OP } from 'mysql-curd'
// id为 1 3 5 7 9 且 delet_date 为 NULL的数据
const field = '*'
const tableName = 'az_book'
const quest = {
    id: [ OP.IN, [1, 3, 5, 7, 9] ],
    delete_date: null
}
const where = { and: quest }

// 输出sql语句
const sql = SELECT('az_book', '*', where)
console.log(sql) // SELECT * FROM az_book WHERE `id` IN (1,3,5,7,9) AND `delete_date` IS NULL

// 执行查询
qusetBookList(where).then(console.log)
```

##### or条件
> or 仅需满足任意一个条件
```typescript
import { SELECT, OP } from 'mysql-curd'
// id为 1 3 5 7 9 或者 delet_date 为 NULL的数据
const field = '*'
const tableName = 'az_book'
const quest = {
    id: [ OP.IN, [1, 3, 5, 7, 9] ],
    delete_date: null
}
const where = { or: quest }

// 输出sql语句
const sql = SELECT('az_book', '*', where)
console.log(sql) // SELECT * FROM az_book WHERE `id` IN (1,3,5,7,9) OR `delete_date` IS NULL

// 执行查询
qusetBookList(where).then(console.log)
```

##### and 与 or 组合使用
```typescript
import { SELECT, OP } from 'mysql-curd'
const field = '*'
const tableName = 'az_book'
const questAnd = {
    delete_date: null,
    cover: [OP.NEQ, null]
}
const questOr = {
    title: [OP.LIKE, '%花园'],
    id: [OP.GT, 5]
}

// (delete_date必须为null， cover不能为null)，且（title包含‘花园’二字 或者 id 大于 5）
const where1 = {
    and: questAnd,
    or: questOr,
    join: 'AND'
}
const sql = SELECT(field, tableName, where1)
console.log(sql) // SELECT * FROM az_book WHERE (`delete_date` IS NULL AND `cover` IS NOT NULL) AND (`title` LIKE '%花园' OR `id` > 5)

// 执行查询
qusetBookList(where1).then(console.log)


//(delete_date必须为null， cover不能为null)，或者（title包含‘花园’二字 或者 id 大于 5）
const where2 = {
    and: questAnd,
    or: questOr,
    join: 'OR'
}
const sql2 = SELECT(field, tableName, where1)
console.log(sql2) // SELECT * FROM az_book WHERE (`delete_date` IS NULL AND `cover` IS NOT NULL) OR (`title` LIKE '%花园' OR `id` > 5)

// 执行查询
qusetBookList(where2).then(console.log)
```

### orderBy 排序
```typescript
// id 倒序
qusetBookList({}, ['id', 'DESC']).then(console.log)

// id 正序
qusetBookList({}, ['id', 'ASC']).then(console.log)
```

### limit 获取指定条目
```typescript
// 获取5条
qusetBookList({}, ['id', 'DESC'], 5).then(console.log)

// 从第5条开始再获取5条
qusetBookList({}, ['id', 'DESC']. [5,5]).then(console.log)
```

### C 新增
新增数据允许新增一条或新增多条，当接受一个对象时新增一条。当接受数组时新增多条
```typescript
import { INSERT } from 'mysql-curd'
const {C} = db
// 新增数据用的函数
const insertBook = C(tableBook)

// 新增用的数据
const data = {
    title: '房思琪的初恋乐园',
    cover: 1,
    des: '令人心碎却无能为力的真实故事。',
    author: '林奕含',
    create_date: '2022-03-21 00:00:00'
}

// 打印sql
console.log(INSERT('az_book', data)) // INSERT INTO `az_book` (`title`,`cover`,`des`,`author`,`create_date`) VALUES ('房思琪的初恋乐园',1,'令人心碎却无能为力的真实故事。','林奕含','2022-03-21 00:00:00')

// 新增一条
insertBook(data).then(console.log)

// 新增多条
insertBook([data, data, data]).then(console.log)
```

### U 更新数据
可根据where条件 order排序 limit来更新数据， limit只接受一个数字<b style="color: red">不接受数组</b>
```typescript
import { UPDATE } from 'mysql-curd'
const {U} = db
const updataBook = U(tableBook)

// 更新的数据
const updata = {
    title: '新标题'
}
// 更新条件 可缺省
const where = {
    and: {
        title: '房思琪的初恋乐园'
    }
}
// 排序 可缺省
const order = ['id', 'DESC']
// 条目 可缺省
const limit = 2

// 打印SQL
console.log(UPDATE('az_book', update, where, order, limit)) // UPDATE az_book SET `title`='新标题' WHERE `title` = '房思琪的初恋乐园' ORDER BY id DESC LIMIT 2

// 执行
updataBook(update, where, order, limit).then(console.log)
```

### 删除数据
可根据where条件 order排序 limit来删除数据， limit只接受一个数字<b style="color: red">不接受数组</b>。 一般项目里是不会删除数据的，只是打上标记软删除
```typescript
import { _DELETE } from 'mysql-curd'
const {D} = db
const delBook = U(tableBook)

// 删除条件 可缺省
const where = {
    and: {
        id: 1
    }
}
// 排序 可缺省
const order = ['id', 'DESC']
// 条目 可缺省
const limit = 2

// 打印sql语句
console.log(_DELETE('az_book', where, order, limit)) // DELETE FROM `az_book` WHERE `id` = 1 ORDER BY id DESC LIMIT 2

// 执行
delBook(where, order, limit).then(console.log)
```

### getAttr 获取器
获取器是查询结束时，对输出结果的处理。也可以在这里进行连表查询。
> 在az_image表中，from为1证明不需要额外处理。form为2时需要拼接上一段域名地址。 az_image 表如图所示：  

| id | path | from | create_date | delete_date |
| :-----| :---- | :----: | :-- | --: |
| 1 | https://img3.doubanio.com/view/subject/s/public/s29651121.jpg                           | 1    | 2022-03-21 00:00:00 | NULL        |
| 2 | view/subject/s/public/s29651121.jpg                           | 2    | 2022-03-21 00:00:00 | NULL        |
| 3 | view/subject/s/public/s29651121.jpg                           | 2    | 2022-03-21 00:00:00 | NULL        |
| 4 | view/subject/s/public/s29651121.jpg                           | 2    | 2022-03-21 00:00:00 | NULL        |

```typescript
// 图片表
const imageTable = spotTable('image', {
    getAttr: {
        path (data, key, value) {
            if (data.from == 2) {
                return 'https://img3.doubanio.com/' + value
            }
            return value
        }
    }
})
const selectImg = R(imageTable)

// 执行查询
selectImg({
    and: {delete_date: null}
}).then(console.log)
```

#### 连表查询
> 下表为 book表 cover是图片表的外建，每次查询拿到结果时都从图片表查一次拿到path字段

| id | cover | title | des | author | create_date | delete_date |
| :-----| :---- | :---- | :-- | :-- | :-- | --: |
|  1 |     1 | 房思琪的初恋乐园         | 令人心碎却无能为力的真实故事。                | 林奕含    | 2022-03-21 00:00:00 | NULL     |
|  2 |     2 | 房思琪的初恋乐园         | 令人心碎却无能为力的真实故事。                | 林奕含    | 2022-03-21 00:00:00 | NULL     |
|  3 |     3 | 房思琪的初恋乐园         | 令人心碎却无能为力的真实故事。                | 林奕含    | 2022-03-21 00:00:00 | NULL     |
```typescript
// 图片表
const imageTable = spotTable('image', {
    getAttr: {
        path (data, key, value) {
            if (data.from == 2) {
                return 'https://img3.doubanio.com/' + value
            }
            return value
        }
    }
})
const selectImg = R(imageTable)

// 书本表
const bookTable = spotTable('book', {
    getAttr: {
        cover (data, key, value) {
            return selectImg({
                and: {id: value}
            }).then(result => {
                if (result === null) { return '默认图片地址' }
                const img = result[0]
                return img.path
            })
        }
    }
})
const selectBook = R(bookTable)
// 查询列表， 当查询时是一个列表这里会出现并发。请手动处理并发问题
selectBook().then(console.log)
```

### setAttr 设置器
设置器刚好和获取器相反，触发的时机为每次新增数据前会先调用一次 setAttr 内的方法
```typescript
// 图片表
const imageTable = spotTable('image', {})
const insertImg = C(imageTable)

// 书本表
const bookTable = spotTable('book', {
    setAttr: {
        cover: (data, key, value) => {
            // 如果是一个图片id则不需要处理
            if (typeof value === 'number') { return value }
            
            // 先添加到图片表再把新增id返回
            return insertImg({
                path: value,
                from: 2,
                create_date: '2022-03-21 00:00:00'
            }).then(result => result.insertId)
        }
    }
})
const insertBook = C(bookTable)

// 需要新增的数据
const data = {
    title: '房思琪的初恋乐园',
    cover: 'view/subject/s/public/s29651121.jpg',
    des: '令人心碎却无能为力的真实故事。',
    author: '林奕含',
    create_date: '2022-03-21 00:00:00'
}
insertBook(data).then(console.log)
```

### 自订SQL执行
```typescript
import { SELECT } from 'mysql-curd'
const {SQLexecute} = db
const sql = SELECT('*', 'az_book', {and: {delete_date: null}}, ['id', 'DESC'], [5, 5])

// 执行
SQLexecute(sql).then(console.log)
```