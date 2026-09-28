import { h } from "../dom";
import type { Item } from "../model";

const CHEERS = ["Done", "Cool", "Nice", "Yes!", "Boom", "👍"];

function cheer(from: HTMLElement) {
  const r = from.getBoundingClientRect();
  const pop = h("div", { class: "cheer", "aria-hidden": "true" }, CHEERS[Math.floor(Math.random() * CHEERS.length)]);
  pop.style.left = `${r.left + r.width / 2}px`;
  pop.style.top = `${r.top + r.height / 2}px`;
  pop.addEventListener("animationend", () => pop.remove());
  document.body.append(pop);
}

type Props = {
  item: Item;
  slot: HTMLElement;
  field: HTMLTextAreaElement;
  onChange: () => void;
};

export function DoneButton({ item, slot, field, onChange }: Props) {
  const btn = h("button", { class: "done", type: "button" });
  const sync = () => {
    slot.classList.toggle("is-done", item.done);
    field.readOnly = item.done;
    btn.textContent = item.done ? "Undo" : "✓ Done";
  };
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    item.done = !item.done;
    sync();
    if (item.done) cheer(field);
    onChange();
  });
  sync();
  return btn;
}
