import { Header, ICON_BACK } from "../components/header";
import { h } from "../dom";
import { type Day, filledItems, weekday } from "../model";

function Summary(day: Day) {
  const p = h("p");
  filledItems(day).forEach((item, i) => {
    if (i) p.append("; ");
    p.append(item.done ? h("s", {}, item.text.trim()) : item.text.trim());
  });
  return p;
}

async function forceUpdate() {
  await caches
    ?.keys()
    .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    .catch(() => {});
  await navigator.serviceWorker?.getRegistration().then((r) => r?.update()).catch(() => {});
  location.reload();
}

function onTaps(el: HTMLElement, count: number, action: () => void) {
  let taps: number[] = [];
  el.addEventListener("click", () => {
    const now = Date.now();
    taps = [...taps.filter((t) => now - t < 2000), now];
    if (taps.length >= count) action();
  });
}

export function ArchiveView({ days }: { days: [string, Day][] }) {
  const header = Header({
    title: "Archive",
    subtitle: `${days.length} ${days.length === 1 ? "day" : "days"}`,
    left: { href: "#/", label: "Back to today", icon: ICON_BACK },
  });
  onTaps(header.querySelector(".title")!, 5, () => {
    header.querySelector(".title small")!.textContent = "Updating…";
    forceUpdate();
  });
  return h(
    "main",
    { class: "page" },
    header,
    ...(days.length
      ? [
          h(
            "ul",
            { class: "days" },
            ...days.map(([date, day]) =>
              h("li", {}, h("a", { href: `#/${date}` }, h("h3", {}, date, h("small", {}, weekday(date))), Summary(day))),
            ),
          ),
          h("p", { class: "note" }, "Days older than two weeks are deleted."),
        ]
      : [h("p", { class: "empty" }, "Nothing here yet. Past days stay here for two weeks.")]),
  );
}
