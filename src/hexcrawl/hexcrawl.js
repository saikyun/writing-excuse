const router = require("express").Router()
const container = require("../container.js")

router.get("/", (req, res) => {
  res.send(
    container(/*html*/ `
    <!-- css from https://css-tricks.com/hexagons-and-beyond-flexible-responsive-grid-patterns-sans-media-queries/ -->
    <style>
      .outer {
        overflow: scroll;

        height: 500px;
      }

      .hex {
        width: 1000px;
        display: flex;
        --s: 100px;
        /* gap */
        --m: 1px;
        --f: calc(1.732 * var(--s) + 4 * var(--m) - 1px);
      }

      .hex-inner {
        font-size: 0;
      }

.hex-inner > div {
  width: var(--s);
  margin: var(--m);
  height: calc(var(--s)*1.1547);
  display: inline-block;
  font-size: initial;
  clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
  background: red;
  margin-bottom: calc(var(--m) - var(--s) * 0.2885);
}



.hex-inner > div > div {
    width: calc(var(--s) - 4px);
    height: calc(var(--s)*1.1547 - 4px);
    margin: 2px;
    display: block;
    font-size: initial;
    clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
    background: red;
  }

  .hex-inner > div:nth-child(odd), .hex-inner > div:nth-child(odd) > div {
  background: green;
}

      .hex-inner > div:hover {
        background: #fff;
      }

      .hex-inner::before {
        content: "";
        width: calc(var(--s)/2 + var(--m));
        float: left;
        height: 120%;
        shape-outside: repeating-linear-gradient(#0000 0 calc(var(--f) - 3px),
        #000  0 var(--f));
      }
    </style>
    <div class="outer">
    <div class="hex">
      <div class="hex-inner">
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
      <div><div></div></div>
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
