import path from 'path'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs' // commonjs模块转换插件
import ts from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import packageJSON from './package.json'

const getPath = _path => path.resolve(__dirname, _path)

// ts
const tsPlugin = ts({
  tsconfig: getPath('./tsconfig.json'),
  extensions: ['.js', '.ts', '.tsx']
})


// 基础配置
const commonConf = {

  input: getPath('./src/app.ts'),

  plugins:[
    resolve({
      preferBuiltins: false
    }),
    commonjs(),
    tsPlugin,
    json()
  ]
}
// 导出模块类型
const outputMap = [
  {
    file: packageJSON.main, // 通用模块
    format: 'umd',
  },
  // {
  //   file: packageJSON.module, // es6模块
  //   format: 'es',
  // }
]

export default outputMap.map(option => Object.assign({}, commonConf, option))