const router = require("express").Router()
const container = require("../container.js")
const { none, log, last } = require("./../fun.js")
const v = require("./../vector.js")

const dice = (d) => 1 + Math.floor(Math.random() * d)

var monster_id = 0

var max_hp = 16

const player = { max_hp: max_hp, hp: max_hp }

var max_stamina = 100
var stamina = max_stamina
var exhaustion = null
var illness = null

const character = ({ problem } = {}) => /*html*/ `
  ${problem ? `<p class="text-danger">${problem}</p>` : ""}
  <p>Health: ${player.hp}</p>
  <p>Stamina: ${stamina}</p>
  ${exhaustion ? `<p class="text-warning">Exhaustion: ${exhaustion}</p>` : ""}
  ${illness ? `<p class="text-danger">Illness: ${illness}</p>` : ""}
  <button hx-target="#popup" hx-swap="outerHTML" hx-get="hexcrawl/rest">Rest</button>
`

const empty_popup = () => /*html*/ `
<div id="popup">
  <div id="popup-inner">
  </div>
</div>
`

router.get("/empty-popup", (req, res) =>
  res
    .header("HX-Retarget", "#popup")
    .header("HX-Reswap", "outerHTML")
    .send(empty_popup())
)

const wrap_popup = (inner) => /*html*/ `
<div id="popup" class="show">
<div id="popup-inner">
${inner}
<button hx-get="hexcrawl/empty-popup">Close</button>
</div>
</div>
`

const rest = () =>
  wrap_popup(/*html*/ `
<div>
  <button disabled>Rent a room</button>
  <span class="text-danger">No known city or village nearby.</span>
</div>
<div>
  <button disabled>Sleep in a barn</button>
  <span class="text-danger">No farm nearby.</span>
</div>
<div>
  <button disabled>Raise your tent</button>
  <span class="text-danger">You don't have a tent.</span>
</div>
<div>
  <button hx-target="#popup" hx-swap="outerHTML" hx-get="hexcrawl/lay-down">Lay down on the cold, hard ground</button>
</div>
`)

const illnesses = ["a cold", "fever", "diarrhea", "death"]

const illness_table = (current_illness, i) =>
  current_illness == null
    ? i <= 6
      ? "a cold"
      : i <= 10
      ? "fever"
      : i <= 12
      ? "diarrhea"
      : err(`${i} should be between 1 and 12`)
    : current_illness == "a cold"
    ? i <= 6
      ? "fever"
      : i <= 11
      ? "diarrhea"
      : i <= 12
      ? "death"
      : err(`${i} should be between 1 and 12`)
    : current_illness == "fever"
    ? i <= 8
      ? "diarrhea"
      : i <= 12
      ? "death"
      : err(`${i} should be between 1 and 12`)
    : current_illness == "diarrhea"
    ? "death"
    : err(`${current_illness} is not a valid illness`)

const lay_down = () => {
  var recovery = 70 + dice(30)
  stamina += recovery
  stamina = Math.min(stamina, max_stamina)

  var ex = 30 + dice(40)
  exhaustion += ex

  var new_illness

  if (exhaustion >= 100) {
    new_illness = illness_table(illness, dice(12))
    illness = new_illness
    exhaustion = 0
  }

  return `${wrap_popup(/*html*/ `
    <p>You lay down.</p>
    <p>It's cold.</p>
    <p>It's hard.</p>
    <p>You fall into a restless sleep.</p>

    <p class="text-secondary">You recover ${recovery} stamina.</p>
    ${
      new_illness
        ? `<p class="text-danger">You got ${new_illness}.</p>`
        : exhaustion <= 50
        ? `<p>You're starting to feel exhausted.</p>`
        : `<p class="text-warning">You're not feeling too good...</p>`
    }
`)}
  <div hx-swap-oob="true" id="character">${character()}</div>
`
}

router.get("/rest", (req, res) => {
  res.send(rest())
})

router.get("/lay-down", (req, res) => {
  res.send(lay_down())
})

const size = 50

const hex_to_pixel = ([q, r]) => {
  let x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r)
  let y = size * ((3 / 2) * r)
  return [x, y]
}

let hexi = 0

const grid = []

const addhex = (pos) => {
  log("addhex")
  grid.push({ pos: pos, i: grid.length, npcs: [] })
  return last(grid)
}

addhex([1, 1])

const npcs = () => {
  if (none(curhex().npcs)) return ""

  return curhex().npcs.map((npc) => npc.render(npc))
}

grid.map((h, i) => (h.i = i))

const pos_to_i = (p) =>
  grid.findIndex(({ pos }) => p[0] == pos[0] && p[1] == pos[1])

const find_npc = (npc_id) => {
  for (const tile in grid) {
    const { npcs } = grid[tile]
    const res = npcs.find(({ id }) => id === npc_id)
    if (res) {
      return res
    }
  }
}

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

const L = [-1, 0]
const UL = [0, -1]
const UR = [1, -1]
const R = [1, 0]
const BR = [0, 1]
const BL = [-1, 1]
const dirs = [R, UR, UL, L, BL, BR]

const neighbours = (i) => dirs.map((d) => v.vadd([...grid[i].pos], d))

const exploration_cost = () => 20

const render_biter = (biter) => {
  return /*html*/ `
    <div>
      ${
        biter.hp > 0
          ? /*html*/ `
        <p>A Biter is here.</p>
        <button hx-target="#popup" hx-swap="outerHTML" hx-get="hexcrawl/fight/${biter.id}">Fight</button>
      `
          : "The corpse of a Biter lies on the ground."
      }
    </div>
  `
}

const biter_attack = (biter, opponent) => {
  var dmg = dice(4)
  opponent.hp -= dmg
  return /*html*/ `
  <div>
    ${
      dmg == 0
        ? "The Biter seems to sense you, hesitantly."
        : `The Biter bites you! You lose ${dmg} health.`
    }
  </div>
  `
}

const is_alive = (npc) => npc.hp > 0

const add_terrain = (from_terrain, from_vegetation, i) => {
  grid[i].terrain = terrain(from_terrain, dice(12))
  grid[i].vegetation = vegetation(from_vegetation, dice(12))

  if (dice(6) == 1) {
    grid[i].npcs.push({
      id: monster_id++,
      hp: 4,
      name: "biter",
      attack: biter_attack,
      render: render_biter,
      visible: is_alive,
    })
  }
}

const explore_neighbours = (i, depth = 1) => {
  return neighbours(i)
    .flatMap((p) => {
      var tile_i = pos_to_i(p)
      var tile = grid[tile_i]
      if (tile_i == -1) {
        const new_tile = addhex(p)
        add_terrain(grid[i].terrain, grid[i].vegetation, new_tile.i)
        tile = new_tile
      }

      if (grid[i].terrain == "mountains" && depth == 1) {
        return [tile, ...explore_neighbours(tile.i, depth - 1)]
      }
      return tile
    })
    .filter((o) => o)
}

const explore = (i) => {
  console.log("explore")
  if (exploration_cost() > stamina) {
    return false
  }

  stamina -= exploration_cost()

  grid[i].explored = true

  return explore_neighbours(i)
}

const tile = (h, { oob } = {}) => {
  const [x, y] = hex_to_pixel(h.pos)

  const inside = [
    ...h.npcs
      .filter((npc) => npc.visible(npc))
      .map((npc) => `<div class="${npc.name}"></div>`),
  ]

  h === curhex() ? inside.push(`<div class="current"></div>`) : null

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
      <div class="inside-tile x${inside.length}">
        ${inside.join("\n")}
      </div>
    </div>
  </div>
  `
}

if (!curhex().explored) {
  add_terrain(terrains[dice(4) - 1], vegetations[dice(4) - 1], hexi)
  explore(hexi)
}

const map = () => {
  return grid.map(tile).join("")
}

router.get("/fight/:id", (req, res) => {
  var npc_id = parseInt(req.params.id)
  var dmg = 1 + dice(6)
  var npc = find_npc(npc_id)

  if (!npc) err(`Npc with ID ${npc_id} not found.`)

  npc.hp -= dmg

  const npc_attack = npc.attack(npc, player)

  var died = false
  if (npc.hp <= 0) {
    died = true
  }

  log(npc)

  res.send(/*html*/ `
    ${wrap_popup(/*html*/ `
      ${npc_attack}
      <div>
        You punch it. You deal ${dmg} to the ${npc.name}.
      </div>
      ${died ? `<div>The ${npc.name} falls to the ground. Lifeless.</div>` : ""}
    `)}

    ${tile(curhex(), { oob: true })}
    <div hx-swap-oob="true" id="character">
      ${character()}
    </div>
    <div hx-swap-oob="true" id="npcs">
      ${npcs()}
    </div>
    `)
})

router.get("/explore/:i", (req, res) => {
  const i = parseInt(req.params.i)

  const last_hex_i = hexi

  const new_ones = explore(i)

  if (new_ones == false) {
    res.header("HX-Retarget", "#character").send(
      `<div id="character">${character({
        problem: "Not enough stamina.",
      })}</div>`
    )
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
      <div hx-swap-oob="true" id="npcs">
        ${npcs()}
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
        /*background: rgba(0,0,0,0.1);*/
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

      #popup {
        display: none;
        position: absolute;
        top: 50px;
        left: 0;
        width: 100%;
        height: 400px;
      }

      #popup.show {
        display: block;
      }

      #popup-inner {
        height: 100%;
        margin: 30px;
        padding: 30px;
        border-radius: 20px;
        background: rgba(20, 20, 20, 0.8);
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

      .inside-tile {
        width: 100%;
        height: 100%;
        padding: 13px;
        display: grid;
      }

      .x1 {
        padding: 25px;
        grid-template-columns: 1fr;
      }

      .x2 {
        grid-template-columns: 1fr 1fr;
      }

      .x3, .x4 {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
      }

      .current {
        background: url("sprites/meeple.png") no-repeat;
        background-size: contain;
      }

      .biter {
        background: url("sprites/biter.png") no-repeat;
        background-size: contain;
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
    <div class="row">
      <div class="col-6">
        <div id="character">
          ${character()}
        </div>
      </div>
      <div class="col-6">
        <div id="npcs">
          ${npcs()}
        </div>
      </div>
    </div>

    ${empty_popup()}


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
