import { useEffect, useMemo, useState } from "react";
import "./App.css";

type ClassSlot = {
  day: number;
  start: string;
  end: string;
  code: string;
  title: string;
};

type PlaceFilter = "all" | "library" | "discussion";

type Room = {
  name: string;
  category: string;
  capacity: number;
  features: string[];
  timetable: ClassSlot[];
  openingHours: {
    open: string;
    close: string;
  };
  librarySeats?: {
    total: number;
    area: "study" | "computer";
  };
};

type Recommendation = {
  score: number;
  reasons: string[];
};

type AlternativeSlot = {
  date: string;
  startTime: string;
  endTime: string;
  room: Room;
  score: number;
  distanceMinutes: number;
};

type TimelineItem = {
  start: string;
  end: string;
  title: string;
  code?: string;
  status: "free" | "class" | "closed";
};

const roomNames = [
  "Auditorium 1 @ Level 7",
  "Auditorium 2 @ Level 6",
  "Auditorium 3 @ Block C Level 9",
  "Auditorium 4 @ Level 3",
  "Auditorium 5 @ Level 3",
  "Auditorium 6 @ Block C Level 3",
  "Auditorium 7 @ Block A Level 3",
  "B-01-GEOLOGY LAB",
  "B-01-RESERVOIR LAB",
  "B-02-01-Model Making Studio 1",
  "B-02-02-Clay Workshop",
  "B-02-03-3D Workshop",
  "B-02-06-Eco-Innovation Lab",
  "B-02-07 Model Making Studio 2",
  "B-03-CADCAM LAB",
  "B-03-Design-LAB",
  "B-03-Robotic LAB",
  "B-04-01",
  "Culinary Bar Theatre 1",
  "Culinary Bar Theatre 2",
  "Discussion Room 1 (4th floor Library)",
  "Discussion Room 2 (4th floor Library)",
  "Discussion Room 3 (4th floor Library)",
  "Discussion Room 4 (4th floor Library)",
  "Discussion Room 5 (4th floor Library)",
  "Discussion Room 6 (4th floor Library)",
  "Library Open Study Area",
  "Library Computer Zone",
  "E-05-01 (Architecture Studio)",
  "Presentation Room 1 @ Cyber range",
  "Presentation Room 2 @ Cyber range",
  "Presentation Room 3 @ Cyber range",
  "S-05-01 (Studio 1)",
  "S-05-03 (Architecture Studio)",
  "S-06-02 (Design Suite)",
  "S-07-01 (Studio 3)",
  "S-07-02 (Drawing Studio)",
  "Tech Lab 4-01",
  "Tech Lab 4-02",
  "Tech Lab 4-03",
  "Tech Lab 4-07",
  "Tech Lab 5-01 Financial Trading Centre",
  "Tech Lab 5-02 Cisco Lab",
  "Tech Lab 6-01",
  "Tech Lab 6-02",
  "Tech Lab 6-03",
  "Tech Lab 6-04",
  "Tech Lab 6-05",
  "Tech Lab 6-06",
  "Tech Lab 6-07",
  "Tech Lab 6-08",
  "Tech Lab 6-09",
  "Tech Lab 6-10 (ID Suite)",
  "Tech Lab 6-11",
  "Tech Lab 6-12 (Pixels Suite)",
  "Tech Lab 6-13",
  "Tech Lab 6-14",
  "Tech Lab 6-15 (CGI Suite)",
  "Tech Lab 6-16 (iMac Suite)",
  "Tech Lab 6-17 (Animation Suite)",
  "Tech Lab 6-18 (VFX Suite)",
  "Tech Lab 6-19 (Greenscreen)",
  "Tech Lab 7-01",
  "Tech Lab 7-02",
];

const facilityOptions = [
  "Whiteboard",
  "Projector",
  "Power outlets",
  "Video conferencing",
  "Quiet study",
];

const facilityPatterns = [
  ["Whiteboard", "Projector", "Power outlets"],
  ["Whiteboard", "Power outlets"],
  ["Projector", "Video conferencing"],
  ["Power outlets", "Quiet study"],
  ["Whiteboard", "Video conferencing"],
  ["Projector", "Power outlets", "Quiet study"],
];

const classBlocks = [
  { start: "08:30", end: "10:30" },
  { start: "10:30", end: "12:30" },
  { start: "13:00", end: "15:00" },
  { start: "15:00", end: "17:00" },
];

const demoSubjects = [
  "Sample lecture",
  "Sample tutorial",
  "Project workshop",
  "Group study booking",
  "Sample laboratory class",
];

const weekdays = [
  { day: 1, name: "Monday" },
  { day: 2, name: "Tuesday" },
  { day: 3, name: "Wednesday" },
  { day: 4, name: "Thursday" },
  { day: 5, name: "Friday" },
  { day: 6, name: "Saturday" },
  { day: 0, name: "Sunday" },
];

function getCategory(name: string): string {
  const lower = name.toLowerCase();

  if (lower.includes("library open")) {
    return "Library · Open study";
  }
  if (lower.includes("computer zone")) {
    return "Library · Computer area";
  }
  if (lower.includes("discussion room")) {
    return "Library · Discussion room";
  }
  if (lower.includes("auditorium") || lower.includes("theatre")) {
    return "Auditorium";
  }
  if (lower.includes("tech lab")) {
    return "Technology lab";
  }
  if (lower.includes("presentation room")) {
    return "Meeting room";
  }
  if (lower.includes("studio")) {
    return "Studio";
  }
  if (lower.includes("workshop")) {
    return "Workshop";
  }
  if (lower.includes("lab")) {
    return "Laboratory";
  }

  return "Campus space";
}

function makeTimetable(
  roomName: string,
  index: number,
): ClassSlot[] {
  if (roomName === "B-04-01") {
    return [
      {
        day: 2,
        start: "08:30",
        end: "10:30",
        code: "CT044-3-1-IOOP-L-10",
        title: "Introduction to Object Oriented Programming",
      },
      {
        day: 4,
        start: "13:00",
        end: "15:00",
        code: "DEMO",
        title: "Sample scheduled class",
      },
    ];
  }

  const timetable: ClassSlot[] = [];

  for (const day of [1, 2, 3, 4, 5]) {
    if ((index + day) % 5 === 0) continue;

    const firstBlock =
      (index + day * 2) % classBlocks.length;

    const blocks = [firstBlock];

    if ((index + day) % 3 === 0) {
      blocks.push((firstBlock + 2) % classBlocks.length);
    }

    for (const blockIndex of blocks) {
      const block = classBlocks[blockIndex];

      timetable.push({
        day,
        start: block.start,
        end: block.end,
        code: `DEMO-${String(index + 1).padStart(2, "0")}`,
        title:
          demoSubjects[
            (index + day + blockIndex) % demoSubjects.length
          ],
      });
    }
  }

  return timetable;
}

const rooms: Room[] = roomNames.map((name, index) => {
  const category = getCategory(name);
  const isOpenLibrary = name === "Library Open Study Area";
  const isComputerLibrary = name === "Library Computer Zone";

  let capacity = 12;

  if (category === "Auditorium") {
    capacity = 120;
  } else if (isOpenLibrary) {
    capacity = 60;
  } else if (isComputerLibrary) {
    capacity = 24;
  } else if (category === "Library · Discussion room") {
    capacity = 6;
  } else if (category === "Technology lab") {
    capacity = 30;
  } else if (category === "Laboratory") {
    capacity = 24;
  } else if (category === "Studio" || category === "Workshop") {
    capacity = 20;
  }

  return {
    name,
    category,
    capacity,
    features: facilityPatterns[index % facilityPatterns.length],
    timetable: makeTimetable(name, index),
    openingHours: {
      open: "08:00",
      close: "18:00",
    },
    librarySeats: isOpenLibrary
      ? { total: 60, area: "study" }
      : isComputerLibrary
        ? { total: 24, area: "computer" }
        : undefined,
  };
});

function localDate(date: Date): string {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

function getToday(): string {
  return localDate(new Date());
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(value: number): string {
  const minutes = ((value % 1440) + 1440) % 1440;

  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
    minutes % 60,
  ).padStart(2, "0")}`;
}

function mondayOf(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return localDate(date);
}

function shiftDate(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDate(date);
}

function prettyDate(value: string): string {
  return new Date(`${value}T12:00:00`).toLocaleDateString(
    "en-MY",
    {
      day: "numeric",
      month: "short",
    },
  );
}

function formattedDate(value: string): string {
  return new Date(`${value}T12:00:00`).toLocaleDateString(
    "en-MY",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}

function isWithinOpeningHours(
  room: Room,
  startTime: string,
  duration: number,
): boolean {
  const start = toMinutes(startTime);
  const end = start + duration;

  return (
    start >= toMinutes(room.openingHours.open) &&
    end <= toMinutes(room.openingHours.close)
  );
}

function hasClassConflict(
  room: Room,
  weekday: number,
  start: number,
  end: number,
): boolean {
  return room.timetable.some(
    (slot) =>
      slot.day === weekday &&
      start < toMinutes(slot.end) &&
      end > toMinutes(slot.start),
  );
}

function getAvailableCapacity(
  room: Room,
  occupancy: {
    study: number;
    computer: number;
  },
  useCurrentOccupancy: boolean,
): number {
  if (!room.librarySeats) {
    return room.capacity;
  }

  if (!useCurrentOccupancy) {
    return room.librarySeats.total;
  }

  const occupied =
    room.librarySeats.area === "study"
      ? occupancy.study
      : occupancy.computer;

  return Math.max(0, room.librarySeats.total - occupied);
}

function recommendRoom(
  room: Room,
  people: number,
  facilities: string[],
  availableCapacity: number,
): Recommendation {
  let score = 0;
  const reasons: string[] = [];

  const extraSeats = availableCapacity - people;

  if (extraSeats < 0) {
    return {
      score: 0,
      reasons: ["Insufficient capacity"],
    };
  }

  if (extraSeats <= 2) {
    score += 50;
    reasons.push("Excellent capacity fit");
  } else if (extraSeats <= 6) {
    score += 40;
    reasons.push("Good capacity fit");
  } else if (extraSeats <= 15) {
    score += 25;
    reasons.push("Extra space available");
  } else {
    score += 10;
    reasons.push("Larger than required");
  }

  if (facilities.length === 0) {
    score += 30;
  } else {
    const matches = facilities.filter((facility) =>
      room.features.includes(facility),
    );

    score += Math.round(
      (matches.length / facilities.length) * 30,
    );

    if (matches.length === facilities.length) {
      reasons.push("All facilities matched");
    }
  }

  if (
    people <= 6 &&
    room.category === "Library · Discussion room"
  ) {
    score += 20;
    reasons.push("Ideal for group discussion");
  } else if (
    people <= 2 &&
    (room.category === "Library · Open study" ||
      room.category === "Library · Computer area")
  ) {
    score += 20;
    reasons.push("Suitable for individual study");
  } else if (
    people >= 20 &&
    (room.category === "Technology lab" ||
      room.category === "Auditorium")
  ) {
    score += 20;
    reasons.push("Suitable for large groups");
  } else {
    score += 10;
  }

  return {
    score: Math.min(score, 100),
    reasons,
  };
}

// NEW: Find alternative times without relaxing search requirements.
function findAlternativeSlots(options: {
  date: string;
  startTime: string;
  durationMinutes: number;
  roomQuery: string;
  placeFilter: PlaceFilter;
  capacity: number;
  selectedFacilities: string[];
  now: Date;
}): AlternativeSlot[] {
  const {
    date,
    startTime,
    durationMinutes,
    roomQuery,
    placeFilter,
    capacity,
    selectedFacilities,
    now,
  } = options;

  const query = roomQuery.trim().toLowerCase();

  const requested = new Date(
    `${date}T${startTime}:00`,
  ).getTime();

  const current = now.getTime();

  const candidates = rooms.filter((room) => {
    const matchesText =
      !query ||
      room.name.toLowerCase().includes(query) ||
      room.category.toLowerCase().includes(query);

    const isLibrary =
      room.category === "Library · Open study" ||
      room.category === "Library · Computer area";

    const matchesPlace =
      placeFilter === "all" ||
      (placeFilter === "library" && isLibrary) ||
      (placeFilter === "discussion" &&
        room.category === "Library · Discussion room");

    return (
      matchesText &&
      matchesPlace &&
      selectedFacilities.every((feature) =>
        room.features.includes(feature),
      ) &&
      room.capacity >= capacity
    );
  });

  if (candidates.length === 0) return [];

  const alternatives: AlternativeSlot[] = [];

  for (let offset = 0; offset < 7; offset++) {
    const candidateDate = shiftDate(date, offset);

    const day = new Date(
      `${candidateDate}T12:00:00`,
    ).getDay();

    for (
      let minute = 8 * 60;
      minute + durationMinutes <= 18 * 60;
      minute += 30
    ) {
      const candidateStart = fromMinutes(minute);

      const candidateTimestamp = new Date(
        `${candidateDate}T${candidateStart}:00`,
      ).getTime();

      if (
        candidateTimestamp <= current ||
        candidateTimestamp === requested
      ) {
        continue;
      }

      for (const room of candidates) {
        if (
          !isWithinOpeningHours(
            room,
            candidateStart,
            durationMinutes,
          )
        ) {
          continue;
        }

        if (
          hasClassConflict(
            room,
            day,
            minute,
            minute + durationMinutes,
          )
        ) {
          continue;
        }

        const score = recommendRoom(
          room,
          capacity,
          selectedFacilities,
          room.capacity,
        ).score;

        alternatives.push({
          date: candidateDate,
          startTime: candidateStart,
          endTime: fromMinutes(minute + durationMinutes),
          room,
          score,
          distanceMinutes:
            Math.abs(candidateTimestamp - requested) / 60000,
        });
      }
    }
  }

  alternatives.sort(
    (a, b) =>
      a.distanceMinutes - b.distanceMinutes ||
      b.score - a.score ||
      a.room.name.localeCompare(b.room.name),
  );

  const seen = new Set<string>();

  return alternatives
    .filter((item) => {
      const key = `${item.date}-${item.startTime}`;

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

function timelineFor(
  room: Room,
  day: number,
): TimelineItem[] {
  const opening = toMinutes(room.openingHours.open);
  const closing = toMinutes(room.openingHours.close);

  const slots = room.timetable
    .filter((slot) => slot.day === day)
    .sort(
      (a, b) =>
        toMinutes(a.start) - toMinutes(b.start),
    );

  const timeline: TimelineItem[] = [];

  if (opening > 0) {
    timeline.push({
      start: "00:00",
      end: room.openingHours.open,
      title: "Outside demo operating hours",
      status: "closed",
    });
  }

  let cursor = opening;

  for (const slot of slots) {
    const start = Math.max(opening, toMinutes(slot.start));
    const end = Math.min(closing, toMinutes(slot.end));

    if (end <= start || end <= cursor) continue;

    if (start > cursor) {
      timeline.push({
        start: fromMinutes(cursor),
        end: fromMinutes(start),
        title: "No scheduled demo class",
        status: "free",
      });
    }

    timeline.push({
      start: fromMinutes(Math.max(start, cursor)),
      end: fromMinutes(end),
      title: slot.title,
      code: slot.code,
      status: "class",
    });

    cursor = end;
  }

  if (cursor < closing) {
    timeline.push({
      start: fromMinutes(cursor),
      end: room.openingHours.close,
      title: "No scheduled demo class",
      status: "free",
    });
  }

  if (closing < 1440) {
    timeline.push({
      start: room.openingHours.close,
      end: "24:00",
      title: "Outside demo operating hours",
      status: "closed",
    });
  }

  return timeline;
}

const durationOptions = Array.from(
  { length: 12 },
  (_, index) => (index + 1) * 30,
);

function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return remaining
    ? `${hours} hr ${remaining} min`
    : `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

function App() {
  
  const today = getToday();

  const [viewMode, setViewMode] = useState<"browse" | "matches">("browse");
  const [date, setDate] = useState(today);
  const [roomQuery, setRoomQuery] = useState("");
  const [placeFilter, setPlaceFilter] =
    useState<PlaceFilter>("all");
  const [startTime, setStartTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] =
    useState(120);
  const [capacity, setCapacity] = useState(2);

  const [
    selectedFacilities,
    setSelectedFacilities,
  ] = useState<string[]>([]);

  const [selectedRoom, setSelectedRoom] =
    useState<Room | null>(null);

  const [weekStart, setWeekStart] =
    useState(mondayOf(today));

  const [sortMode, setSortMode] =
    useState<"best" | "name">("best");

  const [libraryOccupancy, setLibraryOccupancy] =
    useState({
      study: 38,
      computer: 17,
    });

  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(new Date());

      setLibraryOccupancy((current) => ({
        study: Math.max(
          0,
          Math.min(
            60,
            current.study +
              (Math.random() < 0.5 ? -1 : 1),
          ),
        ),
        computer: Math.max(
          0,
          Math.min(
            24,
            current.computer +
              (Math.random() < 0.5 ? -1 : 1),
          ),
        ),
      }));
    }, 10000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedRoom(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );
  }, [selectedRoom]);

  const weekday = new Date(
    `${date}T12:00:00`,
  ).getDay();

  const startMinutes = toMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;

  const selectedStart = new Date(`${date}T${startTime}:00`);
  const isPastTime = selectedStart.getTime() < clock.getTime();
  const endTimeText =
    endMinutes >= 1440
      ? `${fromMinutes(endMinutes)} (+1 day)`
      : fromMinutes(endMinutes);

  const nowMinutes =
    clock.getHours() * 60 + clock.getMinutes();

  const isCurrentSearch =
    date === localDate(clock) &&
    startMinutes <= nowMinutes &&
    nowMinutes < endMinutes;

  const libraryFreeSeats =
    84 -
    libraryOccupancy.study -
    libraryOccupancy.computer;

  const discussionCount = rooms.filter(
    (room) =>
      room.category === "Library · Discussion room",
  ).length;

  const matchingRooms = useMemo(() => {
    const query = roomQuery.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesText =
        !query ||
        room.name.toLowerCase().includes(query) ||
        room.category.toLowerCase().includes(query);

      const isLibrary =
        room.category === "Library · Open study" ||
        room.category === "Library · Computer area";

      const isDiscussion =
        room.category === "Library · Discussion room";

      const matchesPlace =
        placeFilter === "all" ||
        (placeFilter === "library" && isLibrary) ||
        (placeFilter === "discussion" && isDiscussion);

      const matchesFacilities = selectedFacilities.every(
        (facility) => room.features.includes(facility),
      );

      const availableCapacity = getAvailableCapacity(
        room,
        libraryOccupancy,
        isCurrentSearch,
      );

      return (
      !isPastTime &&
      matchesText &&
      matchesPlace &&
      matchesFacilities &&
      availableCapacity >= capacity &&
        isWithinOpeningHours(
          room,
          startTime,
          durationMinutes,
        ) &&
        !hasClassConflict(
          room,
          weekday,
          startMinutes,
          endMinutes,
        )
      );
    });
  }, [
    roomQuery,
    placeFilter,
    selectedFacilities,
    capacity,
    startTime,
    durationMinutes,
    weekday,
    startMinutes,
    endMinutes,
    libraryOccupancy,
    isCurrentSearch,
    isPastTime,
  ]);

  const recommendedRooms = useMemo(() => {
    const results = matchingRooms.map((room) => {
      const availableCapacity = getAvailableCapacity(
        room,
        libraryOccupancy,
        isCurrentSearch,
      );

      return {
        room,
        recommendation: recommendRoom(
          room,
          capacity,
          selectedFacilities,
          availableCapacity,
        ),
        availableCapacity,
      };
    });

    return results.sort((a, b) => {
      if (sortMode === "name") {
        return a.room.name.localeCompare(b.room.name);
      }

      return (
        b.recommendation.score -
          a.recommendation.score ||
        a.room.name.localeCompare(b.room.name)
      );
    });
  }, [
    matchingRooms,
    capacity,
    selectedFacilities,
    libraryOccupancy,
    isCurrentSearch,
    sortMode,
  ]);

  const displayedRooms = viewMode === "browse"
    ? rooms.filter((room) => {
        const query = roomQuery.trim().toLowerCase();
        const matchesName = !query || room.name.toLowerCase().includes(query) || room.category.toLowerCase().includes(query);
        const isLibrary = room.category === "Library · Open study" || room.category === "Library · Computer area";
        const matchesCategory = placeFilter === "all" ||
          (placeFilter === "library" && isLibrary) ||
          (placeFilter === "discussion" && room.category === "Library · Discussion room");
        return matchesName && matchesCategory;
      }).map((room) => ({
        room,
        recommendation: recommendRoom(room, capacity, selectedFacilities, room.capacity),
        availableCapacity: room.capacity,
      })).sort((a, b) => a.room.name.localeCompare(b.room.name))
    : recommendedRooms;

  const bestScore =
    recommendedRooms.length > 0
      ? Math.max(
          ...recommendedRooms.map(
            (item) => item.recommendation.score,
          ),
        )
      : 0;

  // NEW: Calculate alternatives only when there are no matches.
  const alternativeSlots = useMemo(() => {
    if (viewMode === "browse" || recommendedRooms.length > 0) return [];

    return findAlternativeSlots({
      date,
      startTime,
      durationMinutes,
      roomQuery,
      placeFilter,
      capacity,
      selectedFacilities,
      now: clock,
    });
  }, [
    viewMode,
    recommendedRooms.length,
    date,
    startTime,
    durationMinutes,
    roomQuery,
    placeFilter,
    capacity,
    selectedFacilities,
    clock,
  ]);

  // NEW: Apply a suggested time without resetting the filters.
  function showBrowse() {
    setViewMode("browse");
    scrollToResults();
  }

  function showMatches() {
    setViewMode("matches");
    scrollToResults();
  }

  function applyAlternative(slot: AlternativeSlot) {
    setViewMode("matches");
    setDate(slot.date);
    setStartTime(slot.startTime);

    document
      .getElementById("spaces")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleFacility(facility: string) {
    setSelectedFacilities((current) =>
      current.includes(facility)
        ? current.filter((item) => item !== facility)
        : [...current, facility],
    );
  }

  function choosePlace(filter: PlaceFilter) {
    setPlaceFilter(filter);
    setRoomQuery("");
    setViewMode("browse");

    document
      .getElementById("spaces")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  function scrollToResults() {
    document
      .getElementById("spaces")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  function openRoom(room: Room) {
    setSelectedRoom(room);
    setWeekStart(mondayOf(date));
  }

  function clearFilters() {
    setRoomQuery("");
    setPlaceFilter("all");
    setSelectedFacilities([]);
    setCapacity(2);
    setStartTime("09:00");
    setDurationMinutes(120);
    setDate(getToday());
    setSortMode("best");
    setViewMode("browse");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#home"
          aria-label="SpaceLens home"
        >
          <span className="brand-mark">◈</span>
          <span>
            Space<span className="brand-accent">Lens</span>
          </span>
        </a>

        <nav className="nav-links">
          <a href="#home">Overview</a>
          <a href="#finder">Space finder</a>
            <a href="#spaces">Spaces &amp; matches</a>
        </nav>

        <div className="header-right">
          <span className="demo-status">
            <span className="status-dot" />
            DEMO SYSTEM
          </span>
          <span className="campus-label">
            APU CAMPUS
          </span>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <span className="hero-kicker">
            <span className="kicker-line" />
            SMART CAMPUS INTELLIGENCE
          </span>

          <h1>
            Every space.
            <br />
            <span>One smart search.</span>
          </h1>

          <p className="hero-copy">
            Discover study spaces, compare
            availability, and find the right
            room with transparent,
            rule-based recommendations.
          </p>

          <div className="hero-actions">
            <button
              className="hero-primary"
              type="button"
              onClick={showBrowse}
            >
              Explore spaces <span>↗</span>
            </button>

            <span className="hero-caption">
              ◉ Prototype data environment
            </span>
          </div>
        </div>

        <div
          className="hero-visual"
          aria-hidden="true"
        >
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />

          <div className="radar-center">
            <span className="radar-symbol">◈</span>
            <strong>SPACE</strong>
            <small>INTELLIGENCE</small>
          </div>

          <span className="radar-node node-one" />
          <span className="radar-node node-two" />
          <span className="radar-node node-three" />

          <div className="floating-tag tag-one">
            ◉ SPACE MATCH
          </div>
          <div className="floating-tag tag-two">
            ◇ SMART SEARCH
          </div>
        </div>
      </section>

      <section
        className="dashboard-stats"
        aria-label="Demo campus overview"
      >
        <div className="stat-card">
          <div className="stat-top">
            <span>CATALOGUED SPACES</span>
            <span className="stat-icon">▦</span>
          </div>
          <strong>{rooms.length}</strong>
          <small>Rooms in demo dataset</small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>SEARCH MATCHES</span>
            <span className="stat-icon">◎</span>
          </div>
          <strong>{viewMode === "browse" ? displayedRooms.length : recommendedRooms.length}</strong>
          <small>{viewMode === "browse" ? "Spaces in catalogue" : "Matching selected criteria"}</small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>LIBRARY SEATS</span>
            <span className="stat-icon">◫</span>
          </div>
          <strong>{libraryFreeSeats}</strong>
          <small>Simulated free seats now</small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>BEST MATCH SCORE</span>
            <span className="stat-icon">✧</span>
          </div>
          <strong>
            {viewMode === "browse" ? "—" : bestScore}
            <span className="stat-unit">/100</span>
          </strong>
          <small>Rule-based suitability</small>
        </div>
      </section>

      <section className="finder-section" id="finder">
        <div className="section-heading">
          <div>
            <span className="section-kicker">
              01 / SPACE DISCOVERY
            </span>
            <h2>Find your next space</h2>
            <p>
              Set your requirements and let
              SpaceLens rank suitable rooms.
            </p>
          </div>

          <span className="section-indicator">
            ◈ SMART FILTER ENGINE
          </span>
        </div>

        <div className="search-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-icon">⌕</span>
              <strong>Space search console</strong>
            </div>

            <button
              className="reset-button"
              type="button"
              onClick={clearFilters}
            >
              ↺ Reset filters
            </button>
          </div>

          <div className="quick-space-links">
            <button
              className={`quick-space-button ${
                placeFilter === "all" ? "selected" : ""
              }`}
              type="button"
              onClick={() => choosePlace("all")}
            >
              <span className="quick-space-icon">▦</span>
              <span className="quick-space-copy">
                <strong>All campus spaces</strong>
                <small>Explore the full catalogue</small>
              </span>
              <span className="quick-space-arrow">↗</span>
            </button>

            <button
              className={`quick-space-button library ${
                placeFilter === "library" ? "selected" : ""
              }`}
              type="button"
              onClick={() => choosePlace("library")}
            >
              <span className="quick-space-icon">◫</span>
              <span className="quick-space-copy">
                <strong>Library seats</strong>
                <small>
                  {libraryFreeSeats} simulated free seats
                </small>
              </span>
              <span className="quick-space-arrow">↗</span>
            </button>

            <button
              className={`quick-space-button discussion ${
                placeFilter === "discussion" ? "selected" : ""
              }`}
              type="button"
              onClick={() => choosePlace("discussion")}
            >
              <span className="quick-space-icon">◇</span>
              <span className="quick-space-copy">
                <strong>Discussion rooms</strong>
                <small>{discussionCount} demo rooms</small>
              </span>
              <span className="quick-space-arrow">↗</span>
            </button>
          </div>

          <form
            className="room-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              showBrowse();
            }}
          >
            <label
              className="field-label"
              htmlFor="room-query"
            >
              SEARCH BY NAME OR CATEGORY
            </label>

            <div className="room-search-controls">
              <div className="room-search-input">
                <span>⌕</span>
                <input
                  id="room-query"
                  type="search"
                  placeholder="Search Tech Lab, Auditorium, Library..."
                  value={roomQuery}
                  onChange={(event) => {
                    setRoomQuery(event.target.value);
                    setPlaceFilter("all");
                  }}
                />
              </div>

              <button
                className="room-search-button"
                type="submit"
              >
                Browse spaces <span>↗</span>
              </button>
            </div>
          </form>

          <div className="filter-fields">
            <div className="filter-field">
              <label htmlFor="date">DATE</label>
              <input
                id="date"
                type="date"
                min={today}
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
              />
            </div>

            <div className="filter-field">
              <label htmlFor="start-time">
                START TIME
              </label>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(event) =>
                  setStartTime(event.target.value)
                }
              />
            </div>

            <div className="filter-field">
              <label htmlFor="duration">DURATION</label>
              <select
                id="duration"
                value={durationMinutes}
                onChange={(event) =>
                  setDurationMinutes(
                    Number(event.target.value),
                  )
                }
              >
                {durationOptions.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {durationLabel(minutes)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="capacity">PEOPLE</label>
              <select
                id="capacity"
                value={capacity}
                onChange={(event) =>
                  setCapacity(Number(event.target.value))
                }
              >
                {[1, 2, 4, 6, 10, 20, 50, 100].map(
                  (count) => (
                    <option key={count} value={count}>
                      {count}+ people
                    </option>
                  ),
                )}
              </select>
            </div>

            <button
              className="search-button"
              type="button"
                onClick={showMatches}
            >
              Find matches ↗
            </button>
          </div>

          <div className="facility-row">
            <span className="filter-caption">
              REQUIRED FACILITIES
            </span>

            <div className="facility-options">
              {facilityOptions.map((facility) => (
                <label
                  className="facility-check"
                  key={facility}
                >
                  <input
                    type="checkbox"
                    checked={selectedFacilities.includes(
                      facility,
                    )}
                    onChange={() =>
                      toggleFacility(facility)
                    }
                  />
                  <span className="custom-check">✓</span>
                  {facility}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="results-section" id="spaces">
        <div className="section-heading results-heading">
          <div>
            <span className="section-kicker">
              {viewMode === "browse" ? "02 / SPACE CATALOGUE" : "02 / INTELLIGENT MATCHING"}
            </span>
            <h2>{viewMode === "browse" ? "Explore campus spaces" : "Recommended spaces"}</h2>
            <p>
              {viewMode === "browse"
                ? "Browse every demo room, including occupied and closed spaces."
                : "Ranked by capacity, facilities, and room suitability."}
            </p>
          </div>

          <div className="results-actions">
            <span className="result-count">
              <span className="status-dot" />
              {displayedRooms.length} {viewMode === "browse" ? "spaces" : "matches"}
            </span>

            {viewMode === "matches" && <select
              className="sort-select"
              aria-label="Sort rooms"
              value={sortMode}
              onChange={(event) =>
                setSortMode(
                  event.target.value as "best" | "name",
                )
              }
            >
              <option value="best">Best match first</option>
              <option value="name">Name A–Z</option>
            </select>}
          </div>
        </div>
        {viewMode === "matches" && isPastTime && (
  <div
    role="alert"
    style={{
      padding: "14px 18px",
      marginBottom: 16,
      border: "1px solid #e5a54b",
      borderRadius: 10,
      background: "rgba(229, 165, 75, 0.1)",
      color: "#e5a54b",
    }}
  >
    ⚠ The selected time has already passed.
    Please choose a future date or time.
  </div>
)}
        <div className="results-context">
          <div className="results-context-main">
            <span className="context-icon">◷</span>
            <span>
              <strong>
                {startTime} – {endTimeText}
              </strong>
              <small>{formattedDate(date)}</small>
            </span>
          </div>

          <span className="demo-pill">
            ◉ SIMULATED AVAILABILITY
          </span>
        </div>

        <p className="demo-live-note">
          Demo only: schedules, operating hours,
          facilities, and capacities are not
          verified APU data.
          {isCurrentSearch
            ? " Library occupancy is simulated, not measured."
            : " Future library occupancy is unknown; seat capacity is not a reservation guarantee."}
        </p>

        {displayedRooms.length > 0 ? (
          <div className="room-grid">
            {displayedRooms.map(
              (
                {
                  room,
                  recommendation,
                  availableCapacity,
                },
                index,
              ) => {
                const isTop =
                  viewMode === "matches" && sortMode === "best" && index === 0;

                const occupied =
                  room.librarySeats?.area === "study"
                    ? libraryOccupancy.study
                    : room.librarySeats?.area === "computer"
                      ? libraryOccupancy.computer
                      : 0;

                const roomStatus = !isWithinOpeningHours(room, startTime, durationMinutes)
                  ? "Outside opening hours"
                  : hasClassConflict(room, weekday, startMinutes, endMinutes)
                    ? "Scheduled class"
                    : isPastTime
                      ? "Past time slot"
                      : "No scheduled class";

                return (
                  <article
                    className={`room-card ${
                      isTop ? "top-match" : ""
                    }`}
                    key={room.name}
                  >
                    <div className="card-topline">
                      <span
                        className={`match-label ${
                          isTop ? "highlight" : ""
                        }`}
                      >
                        {viewMode === "browse"
                          ? `◇ ${roomStatus.toUpperCase()}`
                          : isTop
                            ? "✧ TOP RECOMMENDATION"
                            : "◇ SPACE MATCH"}
                      </span>

                      {viewMode === "matches" && <span className="score-value">
                        {recommendation.score}
                        <small>/100</small>
                      </span>}
                    </div>

                    {viewMode === "matches" && <div
                      className="score-track"
                      role="progressbar"
                      aria-label={`Match score for ${room.name}`}
                      aria-valuenow={recommendation.score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="score-fill"
                        style={{
                          width: `${recommendation.score}%`,
                        }}
                      />
                    </div>}

                    <div className="room-title-row">
                      <div>
                        <p className="room-category">
                          {room.category}
                        </p>
                        <h3>{room.name}</h3>
                      </div>
                    </div>

                    <div className="room-metadata">
                      <span className="capacity-badge">
                        ♙ {room.capacity}{" "}
                        {room.librarySeats
                          ? "total seats"
                          : "people"}
                      </span>

                      <span className="room-hours">
                        ◷ 08:00–18:00
                      </span>
                    </div>

                    {room.librarySeats && (
                      <div className="occupancy-box">
                        <strong>
                          {viewMode === "matches" && isCurrentSearch
                            ? `${availableCapacity} simulated seats free`
                            : `${room.librarySeats.total} total seats`}
                        </strong>
                        <span>
                          {viewMode === "matches" && isCurrentSearch
                            ? `${occupied} simulated occupied now`
                            : "Future seat availability not verified"}
                        </span>
                      </div>
                    )}

                    <div className="feature-list">
                      {room.features.map((feature) => (
                        <span
                          className="feature"
                          key={feature}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {viewMode === "matches" && <div className="recommendation-reasons">
                      {recommendation.reasons.map(
                        (reason) => (
                          <span key={reason}>
                            <span className="reason-check">
                              ✓
                            </span>
                            {reason}
                          </span>
                        ),
                      )}
                    </div>}

                    <button
                      className="details-button"
                      type="button"
                      onClick={() => openRoom(room)}
                    >
                      View weekly timetable
                      <span>↗</span>
                    </button>
                  </article>
                );
              },
            )}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-symbol">◇</div>

            <h3>No matching spaces found</h3>

            <p>
              Your search may conflict with a demo
              class, exceed operating hours, or
              require unavailable facilities.
            </p>

            {/* NEW: Alternative time suggestions */}
            {alternativeSlots.length > 0 ? (
              <div
                style={{
                  width: "100%",
                  maxWidth: 720,
                  margin: "24px auto 0",
                  textAlign: "left",
                }}
              >
                <h4 style={{ marginBottom: 8 }}>
                  Suggested alternative times
                </h4>

                <p style={{ marginBottom: 16 }}>
                  These demo slots keep your room,
                  capacity, facilities, and duration
                  requirements.
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: 10,
                  }}
                >
                  {alternativeSlots.map((slot) => (
                    <div
                      key={`${slot.date}-${slot.startTime}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 12,
                        padding: 16,
                        borderRadius: 12,
                        border:
                          "1px solid rgba(125, 170, 180, 0.3)",
                        background:
                          "rgba(14, 39, 49, 0.65)",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            display: "block",
                            marginBottom: 4,
                          }}
                        >
                          {slot.room.name}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            opacity: 0.8,
                            fontSize: 13,
                          }}
                        >
                          {formattedDate(slot.date)} ·{" "}
                          {slot.startTime}–
                          {slot.endTime}
                        </span>

                        <small style={{ opacity: 0.7 }}>
                          Match score: {slot.score}/100
                          {" · "}Simulated timetable
                        </small>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          applyAlternative(slot)
                        }
                      >
                        Use this time ↗
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ marginTop: 16 }}>
                No alternative time matches all
                requirements within the next
                seven days.
              </p>
            )}

            <button
              type="button"
              onClick={clearFilters}
              style={{ marginTop: 18 }}
            >
              Reset search ↗
            </button>
          </div>
        )}
      </section>

      <section className="system-info">
        <div>
          <span className="section-kicker">
            PROTOTYPE ARCHITECTURE
          </span>

          <h2>
            Designed for smarter campus decisions.
          </h2>

          <p>
            SpaceLens combines timetable conflict
            checks, demo operating hours, capacity
            filtering, and explainable room ranking
            in one interface.
          </p>
        </div>

        <div className="system-steps">
          <span>
            <b>01</b> Filter requirements
          </span>
          <span>
            <b>02</b> Validate time slots
          </span>
          <span>
            <b>03</b> Rank suitable rooms
          </span>
        </div>
      </section>

      <footer className="footer">
        <a className="footer-brand" href="#home">
          ◈ SpaceLens
        </a>

        <p>
          APU smart-campus concept · Hackathon
          prototype. Room data and occupancy
          are simulated. No live timetable,
          sensor, or booking integration.
        </p>
      </footer>

      {selectedRoom && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedRoom(null)}
        >
          <section
            className="timetable-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="timetable-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close timetable"
              onClick={() => setSelectedRoom(null)}
            >
              ×
            </button>

            <span className="section-kicker">
              ROOM INTELLIGENCE / TIMETABLE
            </span>

            <h2 id="timetable-title">
              {selectedRoom.name}
            </h2>

            <p className="modal-description">
              {selectedRoom.category} ·
              Demonstration weekly timetable
            </p>

            <div className="timeline-legend">
              <span>
                <i className="legend-free" />
                Unscheduled
              </span>
              <span>
                <i className="legend-class" />
                Demo class
              </span>
              <span>
                <i className="legend-closed" />
                Closed hours
              </span>
            </div>

            <div className="week-toolbar">
              <button
                className="week-arrow"
                type="button"
                aria-label="Previous week"
                onClick={() =>
                  setWeekStart(
                    shiftDate(weekStart, -7),
                  )
                }
              >
                ←
              </button>

              <strong>
                Week of {prettyDate(weekStart)}
              </strong>

              <button
                className="week-arrow"
                type="button"
                aria-label="Next week"
                onClick={() =>
                  setWeekStart(
                    shiftDate(weekStart, 7),
                  )
                }
              >
                →
              </button>
            </div>

            <div className="week-list">
              {weekdays.map(
                ({ day, name }, index) => (
                  <section
                    className="day-section"
                    key={name}
                  >
                    <div className="day-heading">
                      <strong>{name}</strong>
                      <span>
                        {prettyDate(
                          shiftDate(weekStart, index),
                        )}
                      </span>
                    </div>

                    {timelineFor(
                      selectedRoom,
                      day,
                    ).map((item, itemIndex) => (
                      <div
                        className={`timeline-item ${item.status}`}
                        key={`${day}-${item.start}-${itemIndex}`}
                      >
                        <span className="timeline-time">
                          {item.start}–{item.end}
                        </span>

                        <div>
                          <strong>{item.title}</strong>

                          {item.code && (
                            <span className="timeline-sub">
                              {item.code}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </section>
                ),
              )}
            </div>

            <p className="modal-note">
              This timetable is generated sample
              data. Unscheduled periods do not
              guarantee physical access or
              permission to use a room.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;