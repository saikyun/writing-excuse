const mag = (p) => {
  return Math.sqrt(p.x * p.x + p.y * p.y)
}

const mag2 = (p) => {
  return p.x * p.x + p.y * p.y
}

const vdiv = (p, v) => {
  p.x = p.x / v
  p.y = p.y / v
  return p
}

const vmul = (p, v) => {
  p.x = p.x * v
  p.y = p.y * v
  return p
}

const vmulv = (p1, p2) => {
  p1.x = p1.x * p2.x
  p1.y = p1.y * p2.y
  return p1
}

const vadd = (p1, p2) => {
  p1[0] = p1[0] + p2[0]
  p1[1] = p1[1] + p2[1]
  return p1
}

const vsub = (p1, p2) => {
  p1.x = p1.x - p2.x
  p1.y = p1.y - p2.y
  return p1
}

const vdir = (p1, p2) => normalize(vsub(p1, p2))

const vrot = (p, angle) => {
  var x = p.x
  var y = p.y
  p.x = x * Math.cos(angle) - y * Math.sin(angle)
  p.y = x * Math.sin(angle) + y * Math.cos(angle)
  return p
}

const normalize = (p) => {
  if (p.x == 0 && p.y == 0) {
    return p
  }
  return vdiv(p, mag(p))
}

const dist = (p1, p2) => mag(vsub({ ...p1 }, p2))

module.exports = {
  mag,
  mag2,
  vdiv,
  vmul,
  vmulv,
  vadd,
  vsub,
  vdir,
  vrot,
  normalize,
  dist,
}
