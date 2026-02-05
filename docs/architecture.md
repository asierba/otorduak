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

Rules are hardcoded (see PRD for slot → tag mappings).

---

## Generation Algorithm

```
for each (day, mealType) slot:
  1. Get required tag for this slot (from hardcoded rules)
  2. candidates = meals with that tag
  3. No rule for slot → candidates = all meals
  4. Remove already-used meals (soft: if candidates remain)
  5. Pick random from candidates
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
