// 内部利用：オブジェクトの配列化
export function makeArray(values, types) {
  if (types === null || types === undefined) {
    types = 'object'
  }
  if (Array.isArray(values)) {
    return values
  } else if (checkType(values, types)) {
    return [values]
  } else {
    return []
  }
}
export function makeSingle(value, types) {
  if (types === null || types === undefined) {
    types = 'string'
  }
  if (checkType(value, types)) {
    return value
  } else {
    return null
  }
}

function myTypeOf(obj) {
  var toString = Object.prototype.toString
  return toString.call(obj).slice(8, -1).toLowerCase()
}
export function checkType(obj, types) {
  return myTypeOf(obj) === types.toLowerCase()
}

export function myIsNaN(obj) {
  // return typeof obj === 'number' && obj !== obj
  return typeof obj === 'number' && isNaN(obj)
}

export function generateUUID() {
  var d = new Date().getTime()
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now() // use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    // var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    // return v.toString(16)
  })
}

function decodeBase64(base64string) {
  let missingPadding = base64string.length % 4
  if (missingPadding !== 0) {
    base64string = base64string + Array(1 + 4 - missingPadding).join('=')
  }
  return new Buffer(base64string, 'base64').toString()
}

export function readJwtPayload(jwtToken) {
  var base64Url = jwtToken.split('.')[1]
  var jsonString = decodeBase64(base64Url)
  return JSON.parse(jsonString)
}

export function numberFormat(value, decimals) {
  var digitsRE = /(\d{3})(?=\d)/g
  value = parseFloat(value)
  if (!isFinite(value) || (!value && value !== 0)) return ''
  decimals = decimals != null ? decimals : 2
  var stringified = Math.abs(value).toFixed(decimals)
  var _int = decimals
    ? stringified.slice(0, -1 - decimals)
    : stringified
  var i = _int.length % 3
  var head = i > 0
    ? (_int.slice(0, i) + (_int.length > 3 ? ',' : ''))
    : ''
  var _float = decimals
    ? stringified.slice(-1 - decimals)
    : ''
  var sign = value < 0 ? '-' : ''
  return sign + head +
    _int.slice(i).replace(digitsRE, '$1,') +
    _float
}
