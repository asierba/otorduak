# Otorduak — Architecture

## Stack
- **React + Vite + TypeScript** — single codebase, fast dev
- **PWA** — installable on mobile, works offline
- **Tailwind CSS** — rapid UI development
- **No persistence** — v1 is generate → swap → copy to whiteboard

---

## Data Model

```typescript
interface Meal {
  id: string
  name: string
  tags: string[]
}

interface DayPlan {
  lunch: Meal | null
  dinner: Meal | null
}

type WeekPlan = Record<DayName, DayPlan>
```

Meals are tagged with a slot category (`weekday-lunch`, `weekday-dinner`, `weekend-lunch`, `weekend-dinner`, `general`) and optionally a food-type tag (`fish`, `legumes`) for frequency rules.

---

## Generation Algorithm

```
Phase 1 — Frequency rules:
  For each frequency rule (e.g. fish 2×/week dinner):
    1. Shuffle meals with that food-type tag
    2. Place them in random weekday slots of the matching mealType
    3. Stop when count is satisfied

Phase 2 — Fill remaining slots:
  For each (day, mealType) slot still empty:
    1. Derive slot category from day + mealType
    2. candidates = meals with that category tag (+ "general" for weekdays)
    3. Remove already-used meals
    4. Pick random from candidates
```

---

## File Structure

```
src/
├── components/
│   ├── WeekGrid.tsx
│   └── MealSlot.tsx
├── data/
│   ├── meals.json
│   └── rules.ts
├── utils/
│   └── generator.ts
├── types.ts
├── App.tsx
└── main.tsx
```

---

## UI Structure

- **Single view**: 7-column grid (Mon-Sun) × 2 rows (Lunch/Dinner)
- **Generate button**: Creates full week
- **Tap slot**: Swap meal from valid options
