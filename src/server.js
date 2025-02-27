delete require.cache[
  "/Users/saikyun/Skapande/js/writing-excuse/src/npc/views.js"
]
delete require.cache["/Users/saikyun/Skapande/js/writing-excuse/src/fun.js"]
delete require.cache["/Users/saikyun/Skapande/js/writing-excuse/src/vector.js"]
delete require.cache[
  "/Users/saikyun/Skapande/js/writing-excuse/src/dungeon/views.js"
]
delete require.cache[
  "/Users/saikyun/Skapande/js/writing-excuse/src/container.js"
]
delete require.cache[
  "/Users/saikyun/Skapande/js/writing-excuse/src/hexcrawl/hexcrawl.js"
]

const express = require("express")
const { DatabaseSync } = require("node:sqlite")

const nocache = require("nocache")

globalThis.should_reload = false

const npc_views = require("./npc/views.js")
const dungeon_views = require("./dungeon/views.js")
const hexcrawl = require("./hexcrawl/hexcrawl.js")

const { some } = require("./fun.js")

const db = new DatabaseSync(":memory")

if (globalThis.server) {
  globalThis.server.close()
}

const app = express()
const port = 3000

const exists = (table) =>
  some(
    db
      .prepare("SELECT * FROM sqlite_master WHERE type='table' AND tbl_name=?")
      .all(table)
  )

if (!exists("npc")) {
  db.exec(`
  CREATE TABLE npc(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
  ) STRICT
  `)
}

//db.prepare("INSERT INTO npc (name) VALUES (?)").run()

console.log(db.prepare("SELECT * FROM npc").all())

app.use(express.json())

app.use(nocache())

app.get("/first-dungeon", (req, res) => {
  res.send(dungeon_views.first_dungeon())
})

app.get("/first-dungeon/:area", (req, res) => {
  console.log(req.params.area)
  res.send(dungeon_views[req.params.area]())
})

const all_npcs = (opts) =>
  npc_views.all(db.prepare("SELECT * FROM npc").all(), log(opts))

app.get("/npcs", (req, res) => {
  res.send(all_npcs())
})

app.get("/npcs/edit/:id", (req, res) => {
  res.send(
    npc_views.edit(
      db.prepare("SELECT * FROM npc WHERE id=?").get(req.params.id)
    )
  )
})

app.post("/npcs", (req, res) => {
  console.log(req.body)
  try {
    db.prepare("INSERT INTO npc (name, description) VALUES(?,?)").run(
      req.body.name,
      req.body.description
    )
  } catch (e) {
    console.error(e)
    res
      .header("HX-Retarget", "#error")
      .header("HX-Reselect", "#error")
      .send(`<div id="error" class="alert alert-danger">${e}</div>`)
    return
  }
  res.send(all_npcs() + npc_views.add_npc_form({ hx_swap_oob: true }))
})

app.put("/npcs", (req, res) => {
  console.log(req.body)
  db.prepare("UPDATE npc SET description=? WHERE id=?").run(
    req.body.description,
    req.body.id
  )
  res.send(all_npcs({ select: parseInt(req.body.id) }))
})

app.delete("/npcs/:id", (req, res) => {
  db.prepare("DELETE FROM npc WHERE id=?").run(req.params.id)
  res.send(all_npcs())
})

app.use("/hexcrawl", hexcrawl.router)
//app.get("/hexcrawl", (req, res) => res.send("blabla"))

app.get("/refresh", (req, res) => {
  res.send(should_reload)
  globalThis.should_reload = false
})

app.get("/", (req, res) => {
  res.redirect("/hexcrawl")
})

app.use(express.static("public"))

globalThis.server = app.listen(port, () => {
  console.log(`server up on http://127.0.0.1:${port}`)
})

/*
setTimeout(() => {
  fetch(`http://127.0.0.1:${port}`)
    .then((x) => x.text())
    .then(console.log)
}, 10)
*/

globalThis.rl = () => {
  const path = "/Users/saikyun/Skapande/js/writing-excuse/src/server.js"
  delete require.cache[path]
  require(path)
  globalThis.should_reload = true
}
