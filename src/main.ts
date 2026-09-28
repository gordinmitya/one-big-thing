import "./style.css";
import { type Day, type Item, emptyItem, getDay, items, localDate, pastDates, saveDay } from "./store";

const app = document.getElementById("app")!;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SEEN_KEY = "obt.lastSeen";

const ICON_ARCHIVE = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"/></svg>`;
const ICON_BACK = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`;

function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, string> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) el.setAttribute(k, v);
  el.append(...children);
  return el;
}

function weekday(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "long" });
}

function iconLink(href: string, label: string, svg: string): HTMLAnchorElement {
  const a = h("a", { class: "icon", href, "aria-label": label, title: label });
  a.innerHTML = svg;
  return a;
}

function header(left: Node, title: string, sub: string): HTMLElement {
  return h(
    "header",
    { class: "top" },
    left,
    h("div", { class: "title" }, h("h1", {}, title), h("small", {}, sub)),
    h("span", { class: "icon" }),
  );
}

/** Grow a textarea to fit its content. */
function fit(t: HTMLTextAreaElement) {
  t.style.height = "auto";
  t.style.height = `${t.scrollHeight}px`;
}

/** Focus the next/previous editable field on the page. */
function focusSibling(from: HTMLElement, delta: number) {
  const fields = [...app.querySelectorAll<HTMLElement>(".field")];
  const next = fields[fields.indexOf(from) + delta];
  if (next) next.focus();
}

// ---------- Done ----------

const CHEERS = ["Done", "Cool", "Nice", "Yes!", "Boom", "👍"];

/** Black bubble that pops over the tapped button, like a stamp. */
function celebrate(from: HTMLElement) {
  const r = from.getBoundingClientRect();
  const pop = h("div", { class: "cheer", "aria-hidden": "true" }, CHEERS[Math.floor(Math.random() * CHEERS.length)]);
  pop.style.left = `${r.left + r.width / 2}px`;
  pop.style.top = `${r.top + r.height / 2}px`;
  pop.addEventListener("animationend", () => pop.remove());
  document.body.append(pop);
}

function doneButton(slot: HTMLElement, field: HTMLTextAreaElement | HTMLInputElement, item: Item, save: () => void) {
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
    if (item.done) celebrate(btn);
    save();
  });
  sync();
  return btn;
}

// ---------- Day view ----------

function renderDay(date: string, isToday: boolean): HTMLElement {
  const day: Day = getDay(date);
  const rowItems = new WeakMap<Element, Item>();
  const save = () => {
    day.small = [...smalls.children].map((li) => rowItems.get(li)!).filter((i) => i.text.trim());
    saveDay(date, day);
  };

  const slot = (cls: string, hint: string, item: Item) => {
    const t = h("textarea", { class: "field", rows: "1", placeholder: " ", spellcheck: "false", "aria-label": hint });
    t.value = item.text;
    t.addEventListener("input", () => {
      fit(t);
      item.text = t.value;
      save();
    });
    t.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        focusSibling(t, 1);
      }
    });
    const el = h("label", { class: `slot ${cls}` }, t, h("span", { class: "plus", "aria-hidden": "true" }), h("span", { class: "hint" }, hint));
    el.append(doneButton(el, t, item, save));
    return el;
  };

  const smalls = h("ul", { class: "smalls" });

  const addSmall = (item: Item, animate: boolean): HTMLInputElement => {
    const input = h("input", { class: "field", placeholder: " ", spellcheck: "false", "aria-label": "Small thing" });
    input.value = item.text;
    const li = h("li", { class: animate ? "slot small new" : "slot small" }, input, h("span", { class: "plus", "aria-hidden": "true" }));
    li.append(doneButton(li, input, item, save));
    rowItems.set(li, item);
    const isLast = () => li === smalls.lastElementChild;

    input.addEventListener("input", () => {
      item.text = input.value;
      if (isLast() && input.value) addSmall(emptyItem(), true);
      save();
    });
    input.addEventListener("keydown", (e) => {
      if (e.isComposing) return;
      if (e.key === "Enter" && input.value.trim()) {
        e.preventDefault();
        focusSibling(input, 1);
      } else if (e.key === "Backspace" && !input.value && !isLast()) {
        e.preventDefault();
        focusSibling(input, -1);
        li.remove();
        save();
      }
    });
    input.addEventListener("blur", () => {
      if (!input.value.trim() && !isLast()) {
        li.remove();
        save();
      }
    });
    smalls.append(li);
    return input;
  };

  for (const s of day.small) addSmall(s, false);
  addSmall(emptyItem(), false);

  const page = h(
    "main",
    { class: "page" },
    header(
      isToday ? iconLink("#/archive", "Archive", ICON_ARCHIVE) : iconLink("#/archive", "Back to archive", ICON_BACK),
      date,
      isToday ? `${weekday(date)} · today` : weekday(date),
    ),
    h(
      "section",
      { class: "card" },
      slot("big", "One big thing", day.big),
      h("div", { class: "mediums" }, ...day.medium.map((m) => slot("medium", "Medium thing", m))),
    ),
    h("h2", {}, "Other things I might do"),
    smalls,
  );
  if (!isToday) page.append(h("a", { class: "to-today", href: "#/" }, "Back to today →"));
  return page;
}

// ---------- Archive view ----------

function renderArchive(today: string): HTMLElement {
  const dates = pastDates(today);
  const list = h("ul", { class: "days" });
  for (const date of dates) {
    list.append(
      h(
        "li",
        {},
        h("a", { href: `#/${date}` }, h("h3", {}, date, h("small", {}, weekday(date))), h(
            "p",
            {},
            ...items(getDay(date)).flatMap((it, i) => [
              ...(i ? ["; "] : []),
              it.done ? h("s", {}, it.text.trim()) : it.text.trim(),
            ]),
          )),
      ),
    );
  }
  return h(
    "main",
    { class: "page" },
    header(iconLink("#/", "Back to today", ICON_BACK), "Archive", `${dates.length} ${dates.length === 1 ? "day" : "days"}`),
    dates.length ? list : h("p", { class: "empty" }, "Nothing here yet. Past days will show up here."),
  );
}

// ---------- Router ----------

let shownToday = localDate();

function render(transition: "fade" | "wipe" = "fade") {
  const today = (shownToday = localDate());
  const route = location.hash.replace(/^#\/?/, "");

  let page: HTMLElement;
  if (route === "archive") page = renderArchive(today);
  else if (DATE_RE.test(route) && route !== today) page = renderDay(route, false);
  else page = renderDay(today, true);

  page.classList.add(transition);
  app.replaceChildren(page);
  page.querySelectorAll("textarea").forEach(fit);
  window.scrollTo(0, 0);

  try {
    localStorage.setItem(SEEN_KEY, today);
  } catch {}
}

/** Re-render when the local date rolls over (midnight, or waking a sleeping tab). */
function checkNewDay() {
  if (localDate() === shownToday) return;
  const route = location.hash.replace(/^#\/?/, "");
  // A past day or the archive stays put; the today view gets a fresh page.
  if (route === "" || route === "archive") render("wipe");
  else shownToday = localDate();
}

function scheduleMidnight() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  setTimeout(() => {
    checkNewDay();
    scheduleMidnight();
  }, next.getTime() - now.getTime());
}

window.addEventListener("hashchange", () => render());
window.addEventListener("focus", checkNewDay);
document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && checkNewDay());
window.addEventListener("resize", () => app.querySelectorAll("textarea").forEach(fit));

let firstTransition: "fade" | "wipe" = "fade";
try {
  const seen = localStorage.getItem(SEEN_KEY);
  if (seen && seen !== localDate()) firstTransition = "wipe";
} catch {}
render(firstTransition);
scheduleMidnight();
