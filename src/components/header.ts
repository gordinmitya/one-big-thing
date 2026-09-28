import { h, html } from "../dom";

export const ICON_ARCHIVE = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"/></svg>`;
export const ICON_BACK = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`;

type Props = { title: string; subtitle: string; left: { href: string; label: string; icon: string } };

export function Header({ title, subtitle, left }: Props) {
  return h(
    "header",
    { class: "top" },
    h("a", { class: "icon", href: left.href, "aria-label": left.label, title: left.label }, html(left.icon)),
    h("div", { class: "title" }, h("h1", {}, title), h("small", {}, subtitle)),
    h("span", { class: "icon" }),
  );
}
