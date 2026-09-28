import "./style.css";
import { addDays, isDateKey, localDate } from "./model";
import * as storage from "./storage";
import { ArchiveView } from "./views/archive";
import { DayView, type When } from "./views/day";

type Route = { name: "archive" } | { name: "day"; date: string; when: When };

const app = document.getElementById("app")!;
let today = localDate();

function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, "");
  if (path === "archive") return { name: "archive" };
  if (isDateKey(path) && path < today) return { name: "day", date: path, when: "past" };
  const tomorrow = addDays(today, 1);
  if (path === tomorrow) return { name: "day", date: tomorrow, when: "tomorrow" };
  return { name: "day", date: today, when: "today" };
}

function view(route: Route): HTMLElement {
  if (route.name === "archive") return ArchiveView({ days: storage.pastDays(today) });
  const { date, when } = route;
  return DayView({ date, when, day: storage.getDay(date), onChange: (day) => storage.saveDay(date, day) });
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
  const route = parseRoute(location.hash);
  if (route.name === "day" && route.when === "past") today = localDate();
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

const stack = [location.hash];
const previous = () => stack[stack.length - 2];
const sameRoute = (a?: string, b?: string) =>
  a !== undefined && b !== undefined && JSON.stringify(parseRoute(a)) === JSON.stringify(parseRoute(b));

window.addEventListener("hashchange", () => {
  if (sameRoute(location.hash, previous())) stack.pop();
  else stack.push(location.hash);
  render();
});

document.addEventListener("click", (e) => {
  const link = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!link || !sameRoute(link.hash || "#/", previous())) return;
  e.preventDefault();
  history.back();
});

window.addEventListener("focus", checkNewDay);
document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && checkNewDay());

const lastSeen = storage.getLastSeen();
render(!!lastSeen && lastSeen !== today);
scheduleMidnight();

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
  navigator.storage?.persist?.().catch(() => {});
}
