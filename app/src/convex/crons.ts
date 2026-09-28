import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Pull newly approved stories from makinenabzi.com so push notifications can be
// fanned out without waiting for a reader to open the app.
crons.interval(
  "makinenabzi news sync",
  { minutes: 30 },
  internal.siteSync.syncFeed,
  { limit: 15 },
);

// Taze bir dağıtımda fuar takvimi ve kaynak dizini boştur; ilk turda doldurulur,
// sonraki turlarda hiçbir şeye dokunulmaz. Ayrıntı: src/convex/seed.ts
crons.interval(
  "makinenabzi content seed",
  { minutes: 15 },
  internal.seed.ensureSeeded,
);

export default crons;
