// NaN is number :) Also it is the only value which does not equal itself
export default function isNaN(value: any): boolean {
  return value !== value
}
