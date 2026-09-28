/** Tiny DOM helpers. A component is just a function (props) => HTMLElement. */

type Child = Node | string | null | false | undefined;
type Props = Record<string, string | boolean | undefined>;

/** Hyperscript: h("a", { href: "#/" }, "Today"). Falsy children and false/undefined props are skipped. */
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

/** Element from trusted static markup (icons). */
export function html(markup: string): Element {
  const t = document.createElement("template");
  t.innerHTML = markup.trim();
  return t.content.firstElementChild!;
}

/** Grow a textarea to fit its content. */
export function fit(t: HTMLTextAreaElement) {
  t.style.height = "auto";
  t.style.height = `${t.scrollHeight}px`;
}

/** Move focus to the next/previous `.field` inside `root`. */
export function focusSibling(root: ParentNode, from: Element, delta: number) {
  const fields = [...root.querySelectorAll<HTMLElement>(".field")];
  fields[fields.indexOf(from as HTMLElement) + delta]?.focus();
}
