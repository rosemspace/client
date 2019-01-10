import isNaN from './isNaN'

export default function isNumber(value: any): boolean {
  return !isNaN(value) && toString.call(value) === '[object Number]'
}
