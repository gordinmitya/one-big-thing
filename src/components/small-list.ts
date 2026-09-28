import { h } from "../dom";
import { type Item, emptyItem } from "../model";
import { DoneButton } from "./done";

type Props = {
  items: Item[];
  /** Called with the current non-blank items after every edit. */
  onChange: (items: Item[]) => void;
  onNavigate: (from: HTMLElement, delta: 1 | -1) => void;
};

/** Growing list of small things. There is always one empty row at the end to type into. */
export function SmallList({ items, onChange, onNavigate }: Props) {
  const list = h("ul", { class: "smalls" });
  const rows = new Map<Element, Item>();
  const emit = () => onChange([...list.children].map((li) => rows.get(li)!).filter((i) => i.text.trim()));

  const addRow = (item: Item, animate: boolean) => {
    const field = h("input", { class: "field", placeholder: " ", spellcheck: "false", "aria-label": "Small thing" });
    field.value = item.text;
    const li = h("li", { class: animate ? "slot small new" : "slot small" }, field, h("span", { class: "plus", "aria-hidden": "true" }));
    li.append(DoneButton({ item, slot: li, field, onChange: emit }));
    rows.set(li, item);

    const isLast = () => li === list.lastElementChild;
    const remove = () => {
      rows.delete(li);
      li.remove();
      emit();
    };

    field.addEventListener("input", () => {
      item.text = field.value;
      if (isLast() && field.value) addRow(emptyItem(), true);
      emit();
    });
    field.addEventListener("keydown", (e) => {
      if (e.isComposing) return;
      if (e.key === "Enter" && field.value.trim()) {
        e.preventDefault();
        onNavigate(field, 1);
      } else if (e.key === "Backspace" && !field.value && !isLast()) {
        e.preventDefault();
        onNavigate(field, -1);
        remove();
      }
    });
    field.addEventListener("blur", () => {
      if (!field.value.trim() && !isLast()) remove();
    });

    list.append(li);
  };

  for (const item of items) addRow(item, false);
  addRow(emptyItem(), false);
  return list;
}
