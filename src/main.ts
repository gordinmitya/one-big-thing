import "./style.css";
import { fit } from "./dom";
import { addDays, isDateKey, localDate } from "./model";
import * as storage from "./storage";
import { ArchiveView } from "./views/archive";
import { DayView } from "./views/day";

type Route = { name: "today" } | { name: "tomorrow" } | { name: "archive" } | { name: "day"; date: string };
type Transition = "fade" | "wipe";

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

function render(transition: Transition = "fade") {
  today = localDate();
  storage.prune(today);
  const page = view(parseRoute(location.hash));
  page.classList.add(transition);
  app.replaceChildren(page);
  page.querySelectorAll("textarea").forEach(fit);
  window.scrollTo(0, 0);
  storage.setLastSeen(today);
}

function checkNewDay() {
  if (localDate() === today) return;
  if (parseRoute(location.hash).name === "day") today = localDate();
  else render("wipe");
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

const lastSeen = storage.getLastSeen();
render(lastSeen && lastSeen !== today ? "wipe" : "fade");
scheduleMidnight();

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
  navigator.storage?.persist?.().catch(() => {});
}
