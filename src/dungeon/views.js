const wrap = require("../container.js")

var hp = 7

const stats = ({ damage } = {}) => /*html*/ `
${
  damage
    ? `<div class="damage-container"><div class="floating-damage">-${damage}</div></div>`
    : ""
}
<div>
HP: ${hp}
</div>
`

const first = () => /*html*/ `
  <div>
    <p class="fade-in">
    You enter a neato roomio. It's very neat and nice and so on. The fire is burning, it's warming you.
    </p>
    <button class="fade-in-2" id="choice" hx-select=".next" hx-get="first-dungeon/touch_the_fire" hx-swap="beforeend" hx-target="#text">Touch the fire</button>
  </div>
`

module.exports = {
  touch_the_fire: () => {
    hp -= 3
    return /*html*/ `
  <div class="next">
    <div class="fade-in-fast">
    <h2>Ouch!</h2>
    </div>
    <div class="fade-in" style="animation-delay: 0.5s">
    It's hot to the touch.
    </div>
    <div class="fade-in-2">
     <button class="fade-in-2" id="choice" hx-select=".next" hx-get="first-dungeon/look_around" hx-swap="beforeend" hx-target="#text">Look around</button>
    </div>
  </div>
  <div hx-swap-oob="true" id="choice"></div>
  <div hx-swap-oob="true" id="stats" class="col col-4">${stats({
    damage: 3,
  })}</div>
  `
  },
  look_around: () => /*html*/ `
  <div class="next">
  <p class="fade-in">
  There isn't much in way of cooling you here. There's a window though.
  </p>
  <div class="fade-in-2">
   <button class="fade-in-2" id="choice" hx-select=".next" hx-get="first-dungeon/look_outside" hx-swap="beforeend" hx-target="#text">Look out through the window</button>
  </div>
  </div>
  <div hx-swap-oob="true" id="choice"></div>
  `,
  look_outside: () => /*html*/ `
  <div class="next">
  <p class="fade-in">
  There's a well.
  </p>
  <div class="fade-in-2">
   <button class="fade-in-2" id="choice" hx-select=".next" hx-get="first-dungeon/draw_water" hx-swap="beforeend" hx-target="#text">Draw water, and put your hand in it</button>
  </div>
  </div>
  <div hx-swap-oob="true" id="choice"></div>
  `,
  draw_water: () => /*html*/ `
  <div class="next">
  <p class="fade-in">
  The water is cooling your sore, burnt hand.
  </p>
  </div>
  <div hx-swap-oob="true" id="choice"></div>
  `,
  first_dungeon: () =>
    wrap(/*html*/ `
      <style>
        .damage-container {
          position: relative;
        }

        .floating-damage {
          font-size: 2.5em;
          position: absolute;
          animation: floating-damage 2s forwards ease-out;
          color: red;
        }

        @keyframes floating-damage {
          0% { opacity: 1; top: 0px; }
          60% { opacity: 1; }
          100% { opacity: 0; top: -3em; }
        }

        .fade-in {
          animation: fade-in 1.5s forwards;
          opacity: 0;
        }

        .fade-in-fast {
          animation: fade-in 0.25s;
        }

        .fade-in-2 {
          animation: fade-in2 1.5s forwards;
          animation-delay: 1s;
          opacity: 0;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in2 {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      </style>
      <div class="row flex-bottom">
        <div class="col col-4" id="stats">
          ${stats()}
        </div>
        <div class="col col-8" id="text">
          ${first()}
        </div>
      </div>
  `),
}
