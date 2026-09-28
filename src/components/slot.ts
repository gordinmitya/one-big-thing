import { autoFit, fit, h } from "../dom";
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
  const field = h("textarea", { class: "field", rows: "1", placeholder: " ", spellcheck: "false", "aria-label": hint });
  field.value = item.text;
  autoFit(field);
  field.addEventListener("input", () => {
    fit(field);
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
    h("span", { class: "hint" }, hint),
  );
  slot.append(DoneButton({ item, slot, field, onChange }));
  return slot;
}
