import { Header, ICON_ARCHIVE, ICON_BACK, ICON_FORWARD } from "../components/header";
import { Slot } from "../components/slot";
import { SmallList } from "../components/small-list";
import { focusSibling, h } from "../dom";
import { addDays, type Day, weekday } from "../model";

export type When = "past" | "today" | "tomorrow";

const BACK = {
  past: { href: "#/archive", label: "Back to archive", icon: ICON_BACK },
  today: { href: "#/archive", label: "Archive", icon: ICON_ARCHIVE },
  tomorrow: { href: "#/", label: "Back to today", icon: ICON_BACK },
};

type Props = {
  date: string;
  when: When;
  day: Day;
  onChange: (day: Day) => void;
};

export function DayView({ date, when, day, onChange }: Props) {
  const save = () => onChange(day);
  const page = h("main", { class: "page" });
  const next = (from: HTMLElement, delta = 1) => focusSibling(page, from, delta);

  page.append(
    Header({
      title: date,
      subtitle: when === "past" ? weekday(date) : `${weekday(date)} · ${when}`,
      left: BACK[when],
      right: when === "today" ? { href: `#/${addDays(date, 1)}`, label: "Tomorrow", icon: ICON_FORWARD } : undefined,
    }),
    h(
      "section",
      { class: "card" },
      Slot({ kind: "big", hint: "One big thing", item: day.big, onChange: save, onEnter: next }),
      h(
        "div",
        { class: "mediums" },
        ...day.medium.map((item) => Slot({ kind: "medium", hint: "Medium thing", item, onChange: save, onEnter: next })),
      ),
    ),
    SmallList({
      items: day.small,
      onChange: (small) => {
        day.small = small;
        save();
      },
      onNavigate: next,
    }),
  );
  if (when === "past") page.append(h("a", { class: "to-today", href: "#/" }, "Back to today →"));
  return page;
}
