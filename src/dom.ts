type Child = Node | string | null | false | undefined;
type Props = Record<string, string | boolean | undefined>;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === true) el.setAttribute(k, "");
    else if (v !== false && v !== undefined) el.setAttribute(k, v);
  }
  for (const c of children) if (c) el.append(c);
  return el;
}

export function html(markup: string): Element {
  const t = document.createElement("template");
  t.innerHTML = markup.trim();
  return t.content.firstElementChild!;
}

function fit(t: HTMLTextAreaElement) {
  t.style.height = "auto";
  t.style.height = `${t.scrollHeight}px`;
}

const widths = new WeakMap<Element, number>();
const refit = new ResizeObserver((entries) => {
  for (const { target, contentRect } of entries) {
    if (widths.get(target) === contentRect.width) continue;
    widths.set(target, contentRect.width);
    fit(target as HTMLTextAreaElement);
  }
});

export function TextField(label: string, value: string): HTMLTextAreaElement {
  const field = h("textarea", { class: "field", rows: "1", placeholder: " ", spellcheck: "false", "aria-label": label });
  field.value = value;
  field.addEventListener("input", () => fit(field));
  refit.observe(field);
  return field;
}

export function focusSibling(root: ParentNode, from: Element, delta: number) {
  const fields = [...root.querySelectorAll<HTMLElement>(".field")];
  fields[fields.indexOf(from as HTMLElement) + delta]?.focus();
}
