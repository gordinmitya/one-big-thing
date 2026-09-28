import { h, TextField } from "../dom";
import type { Item } from "../model";
import { DoneButton } from "./done";

type Props = {
  kind: "big" | "medium";
  hint: string;
  item: Item;
  onChange: () => void;
  onEnter: (from: HTMLElement) => void;
};

export function Slot({ kind, hint, item, onChange, onEnter }: Props) {
  const field = TextField(hint, item.text);
  field.addEventListener("input", () => {
    item.text = field.value;
    onChange();
  });
  field.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      onEnter(field);
    }
  });

  const slot = h(
    "label",
    { class: `slot ${kind}` },
    field,
    h("span", { class: "plus", "aria-hidden": "true" }),
    h("span", { class: "hint", "aria-hidden": "true" }, hint),
  );
  slot.append(DoneButton({ item, slot, field, onChange }));
  return slot;
}
