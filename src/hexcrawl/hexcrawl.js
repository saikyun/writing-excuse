const router = require("express").Router()
const container = require("../container.js")
const { log, last } = require("./../fun.js")
const v = require("./../vector.js")

const size = 50

const hex_to_pixel = ([q, r]) => {
  let x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r)
  let y = size * ((3 / 2) * r)
  return [x, y]
}

let hexi = 3

const grid = [
  { pos: [0, 1] },
  { pos: [2, 0] },
  { pos: [1, 0] },
  { pos: [1, 1] },
  { pos: [2, 1] },
  { pos: [0, 2] },
  { pos: [1, 2] },
]

grid.map((h, i) => (h.i = i))

const pos_to_i = (p) =>
  grid.findIndex(({ pos }) => p[0] == pos[0] && p[1] == pos[1])

const pos_to_hex = (p) => grid[pos_to_i(p)]

const curhex = () => grid[hexi]

const terrains = ["mountains", "hills", "plains", "swamp"]

const err = (e) => {
  throw Error(e)
}

const terrain = (current_terrain, i) =>
  current_terrain == "mountains"
    ? i <= 6
      ? "mountains"
      : i <= 10
      ? "hills"
      : i <= 11
      ? "plains"
      : i <= 12
      ? "swamp"
      : (() => {
          throw `${i} should be between 1 and 12`
        })()
    : current_terrain == "hills"
    ? i <= 4
      ? "mountains"
      : i <= 8
      ? "hills"
      : i <= 11
      ? "plains"
      : i <= 12
      ? "swamp"
      : (() => {
          throw `${i} should be between 1 and 12`
        })()
    : current_terrain == "plains"
    ? i <= 1
      ? "mountains"
      : i <= 3
      ? "hills"
      : i <= 9
      ? "plains"
      : i <= 12
      ? "swamp"
      : (() => {
          throw `${i} should be between 1 and 12`
        })()
    : current_terrain == "swamp"
    ? i <= 1
      ? "mountains"
      : i <= 2
      ? "hills"
      : i <= 8
      ? "plains"
      : i <= 12
      ? "swamp"
      : (() => {
          throw `${i} should be between 1 and 12`
        })()
    : err(`${current_terrain} is not a valid terrain`)

const dice = (d) => 1 + Math.floor(Math.random() * d)

const L = [-1, 0]
const UL = [0, -1]
const UR = [1, -1]
const R = [1, 0]
const BR = [0, 1]
const BL = [-1, 1]
const dirs = [R, UR, UL, L, BL, BR]

const neighbours = (i) => dirs.map((d) => v.vadd([...grid[i].pos], d))

const addhex = (pos) => {
  grid.push({ pos: pos, i: grid.length })
  return last(grid)
}

const explore = (from_terrain, i) => {
  grid[i].terrain = terrain(from_terrain, dice(12))
  grid[i].explored = true

  return neighbours(i)
    .map((p) => (pos_to_i(p) == -1 ? addhex(p) : null))
    .filter((o) => o)
}

const tile = (h, { oob } = {}) => {
  const [x, y] = hex_to_pixel(h.pos)
  return `
  <div
    hx-swap="outerHTML"
    hx-get="hexcrawl/explore/${h.i}" hx-trigger="click"
    class="${h.terrain ? `terrain-${h.terrain}` : ""}
      ${h.explored ? "explored" : "unexplored"}" style="position: absolute;
      left: ${Math.floor(x)}px;
      top: ${Math.floor(y)}px;">
    <div></div>
  </div>
  `
}

const map = () => {
  if (!curhex().explored) {
    explore(terrains[dice(4) - 1], hexi)
  }

  return grid.map(tile).join("")
}

router.get("/explore/:i", (req, res) => {
  const i = parseInt(req.params.i)
  const new_ones = explore(log("terrain", log(curhex()).terrain), i)
  hexi = i
  res.send(
    `
    ${tile(grid[i])}
    ${new_ones
      .map(
        (h) =>
          `<div hx-swap-oob="beforeend:#map">${tile(h, { oob: true })}</div>`
      )
      .join("")}
    `
  )
})

router.get("/", (req, res) => {
  res.send(
    container(/*html*/ `
    <!-- css from https://css-tricks.com/hexagons-and-beyond-flexible-responsive-grid-patterns-sans-media-queries/ -->
    <style>
      .outer {
        width: 500px;
        height: 500px;
      overflow: scroll;
            }

      .hex {
        --s: ${Math.sqrt(3) * size}px;
        /* gap */
        --m: 1px;
        --f: calc(1.732 * var(--s) + 4 * var(--m) - 1px);
      }


      .unexplored, .unexplored > div {
        background: rgba(0,0,0,0.1);
      }

      .terrain-swamp {
        background: #000;
      }

      .terrain-mountains {
        background: red;
      }

      .terrain-plains {
        background: yellow;
      }

      .terrain-hills {
        background: beige;
      }

      .hex-inner {
        position: relative;
        height: 1000px;
        width: 1000px;
      }

.hex-inner > div {
  width: var(--s);
  margin: var(--m);
  height: calc(var(--s)*1.1547);
  display: inline-block;
  font-size: initial;
  clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
  margin-bottom: calc(var(--m) - var(--s) * 0.2885);
}



.hex-inner > div > div {
    width: calc(var(--s) - 4px);
    height: calc(var(--s)*1.1547 - 4px);
    margin: 2px;
    display: block;
    font-size: initial;
    clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
  }

      .hex-inner > div:hover {
        background: #fff;
      }

      .explored {
      }


    </style>
    <div class="outer">
      <div class="hex">
        <div class="hex-inner" id="map">
        ${map()}
        </div>
      </div>
    </div>


    <script>
      // code from https://stackoverflow.com/questions/67962715/how-to-make-drag-to-scroll-work-smoothly-with-scroll-snapping
    const parent = document.querySelector(".outer");

    let startX;
    let startY;
    let scrollTop;
    let scrollLeft;
let isDown;
let speed = 1;

parent.addEventListener("mousedown", (e) => mouseIsDown(e));
parent.addEventListener("mouseup", (e) => mouseUp(e));
parent.addEventListener("mouseleave", (e) => mouseLeave(e));
parent.addEventListener("mousemove", (e) => mouseMove(e));

function mouseIsDown(e) {
  console.log("huh")
isDown = true;
startY = e.pageY - parent.offsetTop;
startX = e.pageX - parent.offsetLeft;
scrollTop = parent.scrollTop;
scrollLeft = parent.scrollLeft;
}
function mouseUp(e) {
isDown = false;
}
function mouseLeave(e) {
isDown = false;
}
function mouseMove(e) {
if (isDown) {
e.preventDefault();
//Move vertcally
const y = e.pageY - parent.offsetTop;
const x = e.pageX - parent.offsetLeft;
const walkY = (y - startY);
const walkX = (x - startX);
parent.scrollTop = scrollTop - walkY * speed;
parent.scrollLeft = scrollLeft - walkX * speed;
}
}
    </script>
    `)
  )
})

module.exports = {
  router,
}
