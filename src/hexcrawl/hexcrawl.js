const router = require("express").Router()
const container = require("../container.js")
const { log, last } = require("./../fun.js")
const v = require("./../vector.js")

var stamina = 100

const character = ({ problem } = {}) => /*html*/ `
  ${problem ? `<p class="text-danger">${problem}</p>` : ""}
  Stamina: ${stamina}
`

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

const err = (e) => {
  throw Error(e)
}

const terrains = ["mountains", "hills", "plains", "swamp"]

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
      : err(`${i} should be between 1 and 12`)
    : current_terrain == "hills"
    ? i <= 4
      ? "mountains"
      : i <= 8
      ? "hills"
      : i <= 11
      ? "plains"
      : i <= 12
      ? "swamp"
      : err(`${i} should be between 1 and 12`)
    : current_terrain == "plains"
    ? i <= 1
      ? "mountains"
      : i <= 3
      ? "hills"
      : i <= 9
      ? "plains"
      : i <= 12
      ? "swamp"
      : err(`${i} should be between 1 and 12`)
    : current_terrain == "swamp"
    ? i <= 1
      ? "mountains"
      : i <= 2
      ? "hills"
      : i <= 8
      ? "plains"
      : i <= 12
      ? "swamp"
      : err(`${i} should be between 1 and 12`)
    : err(`${current_terrain} is not a valid terrain`)

const vegetations = ["dense_forest", "light_forest", "grassland", "barren"]

const vegetation = (current_vegetation, i) =>
  current_vegetation == "dense_forest"
    ? i <= 6
      ? "dense_forest"
      : i <= 10
      ? "light_forest"
      : i <= 11
      ? "grassland"
      : i <= 12
      ? "barren"
      : err(`${i} should be between 1 and 12`)
    : current_vegetation == "light_forest"
    ? i <= 4
      ? "dense_forest"
      : i <= 8
      ? "light_forest"
      : i <= 11
      ? "grassland"
      : i <= 12
      ? "barren"
      : err(`${i} should be between 1 and 12`)
    : current_vegetation == "grassland"
    ? i <= 1
      ? "dense_forest"
      : i <= 3
      ? "light_forest"
      : i <= 9
      ? "grassland"
      : i <= 12
      ? "barren"
      : err(`${i} should be between 1 and 12`)
    : current_vegetation == "barren"
    ? i <= 1
      ? "dense_forest"
      : i <= 2
      ? "light_forest"
      : i <= 6
      ? "grassland"
      : i <= 12
      ? "barren"
      : err(`${i} should be between 1 and 12`)
    : err(`${current_vegetation} is not a valid vegetation`)

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

const exploration_cost = () => 20

const explore = (from_terrain, from_vegetation, i) => {
  if (exploration_cost() > stamina) {
    return false
  }

  stamina -= exploration_cost()

  grid[i].terrain = terrain(from_terrain, dice(12))
  grid[i].vegetation = vegetation(from_vegetation, dice(12))
  grid[i].explored = true

  return neighbours(i)
    .map((p) => (pos_to_i(p) == -1 ? addhex(p) : null))
    .filter((o) => o)
}

const tile = (h, { oob } = {}) => {
  const [x, y] = hex_to_pixel(h.pos)
  return /*html*/ `
  <div
    id="tile-${h.i}"
    ${oob ? `hx-swap-oob="true"` : ""}
    hx-swap="outerHTML"
    hx-get="hexcrawl/explore/${h.i}" hx-trigger="click"
    class="
      ${h.terrain ? `terrain-${h.terrain}` : ""}
      ${h.vegetation ? `vegetation-${h.vegetation}` : ""}
      ${h.explored ? "explored" : "unexplored"}" style="position: absolute;
      left: ${Math.floor(x)}px;
      top: ${Math.floor(y)}px;">
    <div class="tile">
      <div class="inside-tile ${log(h === curhex()) ? "current" : ""}">
      </div>
    </div>
  </div>
  `
}

const map = () => {
  if (!curhex().explored) {
    explore(terrains[dice(4) - 1], vegetations[dice(4) - 1], hexi)
  }

  return grid.map(tile).join("")
}

router.get("/explore/:i", (req, res) => {
  const i = parseInt(req.params.i)

  const last_hex_i = hexi

  const new_ones = explore(curhex().terrain, curhex().vegetation, i)

  if (new_ones == false) {
    res
      .header("HX-Retarget", "#character")
      .send(character({ problem: "Not enough stamina." }))
    return
  }

  hexi = i
  res.send(
    `
    ${tile(grid[i])}
    ${tile(grid[last_hex_i], { oob: true })}
    ${new_ones
      .map((h) => `<div hx-swap-oob="beforeend:#map">${tile(h)}</div>`)
      .join("")}
    <div hx-swap-oob="true" id="character">
      ${character()}
    </div>
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

      .hex-inner > div:hover {
        background: #fff;
      }

      .unexplored, .unexplored > div {
        background: rgba(0,0,0,0.1);
      }

      .terrain-swamp > div {
        --terrain-bg: url("sprites/swamp.png");
        background-color: #6daa58;
      }

      .terrain-mountains > div {
        --terrain-bg: url("sprites/mountains.png");
        background-color: #bfd7d1;
      }

      .terrain-plains > div {
        --terrain-bg: url("sprites/plains.png");
        background-color: #f8f7a1;
      }

      .terrain-hills > div {
        --terrain-bg: url("sprites/hills.png");
        background-color: #a0df7f;
      }

      .terrain-swamp > div, .terrain-mountains > div, .terrain-plains > div, .terrain-hills > div {
        background-size: 100%;
      }

      .vegetation-dense_forest > div {
        --vegetation-bg: url("sprites/dense_forest.png");
      }

      .vegetation-light_forest > div {
        --vegetation-bg: url("sprites/light_forest.png");
      }

      .vegetation-grassland > div {
        --vegetation-bg: url("sprites/grassland.png");
      }

      .vegetation-barren > div {
        --vegetation-bg: url("sprites/barren.png");
      }

      .tile {
        background-image: var(--terrain-bg), var(--vegetation-bg);
        background-size: 100%;

        width: calc(var(--s) - 4px);
        height: calc(var(--s)*1.1547 - 4px);
        margin: 2px;
        display: block;
        font-size: initial;
        clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);

        display: flex;
        align-items: center;
        justify-content: center;
      }

      .inside-tile.current {
        width: 40px;
        height: 60px;
        background: url("sprites/meeple.png") no-repeat;
        background-size: 100%;
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
    <div id="character">
      ${character()}
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
