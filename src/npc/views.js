const wrap = require("../container.js")

const some = (l) => l != null && l.length > 0
const last = (l) => (some(l) ? l[l.length - 1] : null)

const log = (...args) => {
  console.log(...args)
  return last(args)
}

const add_npc_form = ({ hx_swap_oob } = {}) => /*html*/ `
<form ${
  hx_swap_oob ? `hx-swap-oob=${hx_swap_oob}` : ""
}} id="add-npc" hx-target="#all" hx-post="/npcs" hx-select="#all" hx-ext="json-enc">
    <div id="error"></div>
    <label for="name">Name</label>
    <input id="name" type="text" name="name" />
    <label for="description">Description</label>
    <textarea id="description" name="description"></textarea style="width: 100%">
    <input type="submit" value="Send" />
  </form>
`

module.exports = {
  add_npc_form: add_npc_form,
  all: (npcs, { select } = {}) =>
    wrap(/*html*/ `
  <div>
  <h2>Characters</h2>
  <div id="all">
    ${npcs
      .map(
        ({ id, name, description }) => /*html*/ `
        <div class="row flex-top">
        <div class="col col-1">
          <button class="padding-small" hx-delete="/npcs/${id}" hx-target="#all" hx-select="#all">x</button>
          </div>
          <div class="collapsible padding-small col-11">
            <input id="collapsible-${id}" type="checkbox" name="collapsible" ${
          log(select) == log(id) ? "checked=true" : ""
        } >
            <label for="collapsible-${id}">${name}</label>
            <div id="desc-${id}" class="collapsible-body col">
              <div class="row">${description}</div>
              <button class="padding-small" hx-get="/npcs/edit/${id}" hx-target="#desc-${id}">Edit</button>
            </div>
          </div>
        </div>
      `
      )
      .join("")}
  </div>
  <h3>Add another one</h3>
  ${add_npc_form()}
  </div>
`),
  edit: ({ id, description }) => /*html*/ `
  <form hx-target="#all" hx-put="/npcs" hx-select="#all" hx-ext="json-enc">
    <input type="hidden" name="id" value="${id}" />
    <textarea name="description" style="width: 100%" >${description}</textarea>
    <input type="submit" value="Save" />
  </form>`,
}
