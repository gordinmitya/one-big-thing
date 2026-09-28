import "./style.css";
import { addDays, isDateKey, localDate } from "./model";
import * as storage from "./storage";
import { ArchiveView } from "./views/archive";
import { DayView } from "./views/day";

type Route = { name: "today" } | { name: "tomorrow" } | { name: "archive" } | { name: "day"; date: string };

const app = document.getElementById("app")!;
let today = localDate();

function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, "");
  if (path === "archive") return { name: "archive" };
  if (isDateKey(path) && path === addDays(today, 1)) return { name: "tomorrow" };
  if (isDateKey(path) && path < today) return { name: "day", date: path };
  return { name: "today" };
}

function view(route: Route): HTMLElement {
  switch (route.name) {
    case "archive":
      return ArchiveView({ days: storage.pastDays(today) });
    case "today":
    case "tomorrow":
    case "day": {
      const date = route.name === "day" ? route.date : route.name === "tomorrow" ? addDays(today, 1) : today;
      return DayView({
        date,
        when: route.name === "day" ? "past" : route.name,
        day: storage.getDay(date),
        onChange: (day) => storage.saveDay(date, day),
      });
    }
  }
}

function render(wipe = false) {
  today = localDate();
  storage.prune(today);
  const page = view(parseRoute(location.hash));
  if (wipe) page.classList.add("wipe");
  app.replaceChildren(page);
  window.scrollTo(0, 0);
  storage.setLastSeen(today);
}

function checkNewDay() {
  if (localDate() === today) return;
  if (parseRoute(location.hash).name === "day") today = localDate();
  else render(true);
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

const lastSeen = storage.getLastSeen();
render(!!lastSeen && lastSeen !== today);
scheduleMidnight();

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
  navigator.storage?.persist?.().catch(() => {});
}
