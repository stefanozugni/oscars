# AGENTS.md

## Project Overview

This is an Angular project currently called **OSCARS Archive**.

The current live product is an archive for Academy Awards / Oscars data. The goal is to evolve it gradually into a unified film-festival archive platform that can eventually contain:

* Oscars Archive
* Cannes Archive

The project must be evolved carefully and incrementally. Do **not** rewrite the application from scratch.

The current Oscars site already works and must not be broken.

---

## Current Stack

* Angular
* Standalone components
* TypeScript
* Local JSON files inside `src/assets/json/`
* Firebase Hosting for deployment
* Firebase Analytics via an existing `AnalyticsService`
* No backend for archive data
* No Firestore for archive data
* No external APIs for archive data

Do not introduce new libraries unless explicitly requested.

---

## Current Important Features

The current Oscars Archive already has:

* Home page
* Oscars year selector
* Decade selector
* Local search
* Statistics
* IMDb / Letterboxd switch
* Light / dark theme
* Scroll-to-top button
* Firebase Analytics events
* `YearDataComponent` for Oscars data
* `StatsComponent` for Oscars statistics
* `DataService` for Oscars JSON files

All of these must continue working unless the user explicitly asks to change them.

---

## Core Rule

Do not perform broad refactors.

Work in small, isolated steps.

Every task must be minimal, reversible, and buildable.

If a requested change requires touching many unrelated files, stop and explain the safer smaller steps before modifying the project.

---

## Non-Negotiable Rules

1. Do not rewrite the app.
2. Do not redesign the existing Oscars UI unless explicitly asked.
3. Do not break the existing Oscars experience.
4. Do not remove existing features.
5. Do not introduce new routes unless explicitly asked.
6. Do not introduce external APIs for archive data.
7. Do not introduce new dependencies unless explicitly asked.
8. Do not move many files at once unless explicitly asked.
9. Do not combine unrelated changes in one task.
10. Always keep the project buildable.

Before finishing any task, run:

```bash
npm run build
```

If the build fails, fix it before considering the task complete.

---

## Current Architecture Direction

The project is moving toward a multi-archive structure using:

```ts
archiveMode: 'oscars' | 'cannes'
```

The default mode must remain:

```ts
archiveMode = 'oscars'
```

The Oscars UI must remain the default user experience until a proper archive switch is intentionally implemented.

For now, Cannes must be added gradually as a parallel archive, not forced into the existing Oscars components.

---

## Important Architecture Decision

Do not try to make one universal `YearDataComponent` for both Oscars and Cannes.

Oscars and Cannes have different data models.

Use separate components:

```txt
Oscars:
- YearDataComponent
- StatsComponent
- existing Oscars search/statistics logic

Cannes:
- CannesYearDataComponent
- future Cannes search/statistics if requested later
```

Shared UI can be extracted only when clearly useful and safe, for example:

```txt
shared/
- year selector
- scroll to top
- archive switch
```

But do not extract shared components unless the task explicitly asks for it.

---

## Data Organization Goal

Current Oscars JSON files are currently in:

```txt
src/assets/json/{year}.json
```

The desired future structure is:

```txt
src/assets/json/oscars/{year}.json
src/assets/json/cannes/{year}.json
```

Do not move existing JSON files unless the task explicitly asks for it.

If asked to reorganize JSON files, update the data services carefully and verify the Oscars site still loads data correctly.

---

## Oscars Data Model

The current Oscars JSON rows use this structure:

```ts
export interface Nomination {
  Ceremony: number;
  Year: string | number;
  Class: string;
  CanonicalCategory: string;
  Category: string;
  Film: string;
  FilmId: string;
  Name: string;
  Nominees: string;
  NomineeIds: string;
  Winner: string;
  Detail: string;
  Note: string;
  Citation: string;
}
```

A nomination is a winner when:

```ts
nomination.Winner.trim()
```

Film links use:

```txt
FilmId
```

Person links use:

```txt
NomineeIds
```

In Oscars statistics, film identity should be based on `FilmId`, not just the film title.

In Oscars people statistics, person identity should be based on `NomineeIds`, not just the visible name.

---

## Cannes Data Model

Cannes data comes from a separate Python scraper and is already exported as refined JSON files.

Cannes JSON files should eventually be placed in:

```txt
src/assets/json/cannes/{year}.json
```

A Cannes year JSON has this approximate structure:

```ts
export interface CannesYear {
  festival: string;
  year: number;
  edition: number | null;
  source: CannesSources;
  poster: CannesPoster;
  selection: CannesSelectionItem[];
  juries: CannesJuryItem[];
  awards: CannesAwardItem[];
}

export interface CannesSources {
  poster: string;
  selection: string;
  juries: string;
  awards: string;
}

export interface CannesPoster {
  sourceUrl?: string;
  image?: string;
  alt?: string;
  caption?: string;
  title?: string;
  text?: string;
  rawLines?: string[];
}

export interface CannesSelectionItem {
  section: string;
  subsection: string;
  film: string;
  mainTitle?: string;
  directors: string[];
  directorText: string;
  tags: string[];
  filmUrl?: string;
  image?: string;
  imageAlt?: string;
  sourceUrl?: string;
}

export interface CannesJuryItem {
  section: string;
  name: string;
  role: string;
  description?: string;
  personUrl?: string;
  sourceUrl?: string;
}

export interface CannesAwardItem {
  section: string;
  subsection: string;
  award: string;
  type: 'film' | 'person' | 'award' | string;
  film: string;
  directors: string[];
  directorText: string;
  person: string;
  forFilm: string;
  filmUrl?: string;
  personUrl?: string;
  image?: string;
  imageAlt?: string;
  sourceUrl?: string;
}
```

Cannes data must not be forced into the Oscars nomination model.

---

## Cannes Display Logic

When Cannes is implemented, it should show:

1. Poster

   * poster image
   * caption/title
   * text

2. Selection

   * grouped by `section`
   * grouped by `subsection`
   * film title
   * directorText
   * tags if present

3. Juries

   * grouped by `section`
   * name
   * role
   * description

4. Awards

   * grouped by `section`
   * grouped by `subsection`
   * award
   * if `type === 'film'`: show film and director
   * if `type === 'person'`: show person and optional `forFilm`
   * if `type === 'award'`: show award only

This UI should start minimal. Do not attempt the final Cannes design immediately.

---

## Design Rules

The existing Oscars design is minimal and should remain intact.

When adding Cannes, keep it visually coherent with the current project:

* use existing CSS variables
* avoid random colors
* avoid heavy cards unless requested
* avoid big visual redesigns
* avoid new animation libraries
* keep the layout readable and responsive

Possible future design direction:

```txt
Oscars: black / gold / cinema archive feeling
Cannes: red / ivory / festival editorial feeling
```

But do not implement this unless explicitly asked.

---

## Archive Switch

A future UI archive switch is planned.

It should not be a simple ugly toggle.

Desired future feel:

```txt
Academy Awards     Festival de Cannes
```

with a nice editorial animated transition.

Do not implement the final switch unless explicitly requested.

For now, if archiveMode is needed for testing, it can be changed manually in TypeScript.

---

## Working Method

Always work in small tasks.

Preferred task order:

1. Prepare internal structure
2. Update data path
3. Add model
4. Add service
5. Add component
6. Connect component
7. Add switch UI
8. Add animations
9. Add search/stats for Cannes
10. Add cross-archive search/stats

Never do all of these in one task.

---

## How To Handle Requested Changes

When receiving a task:

1. Read this file first.
2. Inspect the existing project structure before editing.
3. Identify the smallest safe change.
4. Modify only necessary files.
5. Do not touch unrelated files.
6. Run `npm run build`.
7. Report exactly what changed.

If the request is ambiguous, ask for clarification before making broad changes.

---

## Do Not Touch Unless Asked

Do not modify these areas unless the user specifically requests it:

* existing Oscars visual layout
* existing Oscars search logic
* existing Oscars statistics logic
* existing theme logic
* existing IMDb / Letterboxd switch
* existing Firebase Analytics setup
* deployment config
* scraper code, unless the task is specifically about scraping
* JSON data contents

---

## Current Safe Next Steps

The next safe implementation steps should be one of these, one at a time:

### Step A — Only update JSON paths

Move or prepare Oscars JSON path from:

```txt
assets/json/{year}.json
```

to:

```txt
assets/json/oscars/{year}.json
```

and update only the Oscars data service.

### Step B — Only add Cannes model

Create `cannes.model.ts`.

Do not connect it to the UI.

### Step C — Only add Cannes data service

Create `CannesDataService`.

Do not connect it to the UI.

### Step D — Only create CannesYearDataComponent

Create a minimal component that can render a passed/mock Cannes JSON structure.

Do not connect it to the home yet.

### Step E — Connect Cannes manually

Render Cannes only when:

```ts
archiveMode === 'cannes'
```

Do not create the final archive switch yet.

---

## Final Reminder

The current Oscars site is valuable and must remain stable.

The goal is not to replace it.

The goal is to grow it into a broader archive platform carefully.
