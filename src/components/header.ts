import { h, html } from "../dom";

const svg = (body: string) =>
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICON_ARCHIVE = svg(`<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"/>`);
export const ICON_FORWARD = svg(`<path d="M9 5l7 7-7 7"/>`);
export const ICON_BACK = svg(`<path d="M15 5l-7 7 7 7"/>`);

type Link = { href: string; label: string; icon: string };
type Props = { title: string; subtitle: string; left: Link; right?: Link };

const IconLink = ({ href, label, icon }: Link) =>
  h("a", { class: "icon", href, "aria-label": label, title: label }, html(icon));

export function Header({ title, subtitle, left, right }: Props) {
  return h(
    "header",
    { class: "top" },
    IconLink(left),
    h("div", { class: "title" }, h("h1", {}, title), h("small", {}, subtitle)),
    right ? IconLink(right) : h("span", { class: "icon" }),
  );
}
