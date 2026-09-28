import { Header, ICON_ARCHIVE, ICON_BACK } from "../components/header";
import { Slot } from "../components/slot";
import { SmallList } from "../components/small-list";
import { focusSibling, h } from "../dom";
import { type Day, weekday } from "../model";

type Props = {
  date: string;
  isToday: boolean;
  day: Day;
  onChange: (day: Day) => void;
};

export function DayView({ date, isToday, day, onChange }: Props) {
  const save = () => onChange(day);
  const page = h("main", { class: "page" });
  const next = (from: HTMLElement, delta = 1) => focusSibling(page, from, delta);

  page.append(
    Header({
      title: date,
      subtitle: isToday ? `${weekday(date)} · today` : weekday(date),
      left: isToday
        ? { href: "#/archive", label: "Archive", icon: ICON_ARCHIVE }
        : { href: "#/archive", label: "Back to archive", icon: ICON_BACK },
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
    h("h2", {}, "Other things I might do"),
    SmallList({
      items: day.small,
      onChange: (small) => {
        day.small = small;
        save();
      },
      onNavigate: next,
    }),
  );
  if (!isToday) page.append(h("a", { class: "to-today", href: "#/" }, "Back to today →"));
  return page;
}
