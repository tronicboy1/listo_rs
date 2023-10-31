const e = "listo-lists-manager";
class t extends HTMLElement {
  connectedCallback() {
    console.log("hello");
  }
}
customElements.get(e) || customElements.define(e, t);
export {
  t as ListoListManager,
  e as tagName
};
