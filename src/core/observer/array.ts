/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { TriggerOpTypes } from '../../v3'
import { def } from '../util/index'

const arrayProto = Array.prototype // 拿到数组原型方法
export const arrayMethods = Object.create(arrayProto) //

// 需要重写的数组方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  /* 对数组相关方法进行重写 */
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args) // 调用原数组方法并导出
    const ob = this.__ob__
    let inserted // 用于存储用户传进来的参数，例如 arr.push({a: 1})
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    /* 如果存在用户传进来的参数，则再次进行劫持 */
    if (inserted) ob.observeArray(inserted)
    // notify change
    if (__DEV__) {
      ob.dep.notify({
        type: TriggerOpTypes.ARRAY_MUTATION,
        target: this,
        key: method
      })
    } else {
      ob.dep.notify()
    }
    return result // 将结果返回
  })
})
