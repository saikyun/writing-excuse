const some = (l) => l != null && l.length > 0
const none = (l) => !some(l)
const last = (l) => (some(l) ? l[l.length - 1] : null)

const log = (...args) => {
  console.log(...args)
  return last(args)
}

module.exports = { none, some, last, log }
