let id = '0'

export default function iuid() {
  let lastDigit = Number(id[id.length - 1])

  if (++lastDigit === 10) {

  }

  return lastDigit
}
