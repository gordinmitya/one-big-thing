import { Header, ICON_BACK } from "../components/header";
import { h } from "../dom";
import { type Day, filledItems, weekday } from "../model";

/** A day as one line: "big; medium; small", done items struck through. */
function Summary(day: Day) {
  const p = h("p");
  filledItems(day).forEach((item, i) => {
    if (i) p.append("; ");
    p.append(item.done ? h("s", {}, item.text.trim()) : item.text.trim());
  });
  return p;
}

export function ArchiveView({ days }: { days: [string, Day][] }) {
  return h(
    "main",
    { class: "page" },
    Header({
      title: "Archive",
      subtitle: `${days.length} ${days.length === 1 ? "day" : "days"}`,
      left: { href: "#/", label: "Back to today", icon: ICON_BACK },
    }),
    days.length
      ? h(
          "ul",
          { class: "days" },
          ...days.map(([date, day]) =>
            h("li", {}, h("a", { href: `#/${date}` }, h("h3", {}, date, h("small", {}, weekday(date))), Summary(day))),
          ),
        )
      : h("p", { class: "empty" }, "Nothing here yet. Past days will show up here."),
  );
}
