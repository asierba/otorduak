# Otorduak — Architecture

## Stack
- **React + Vite + TypeScript** — single codebase, fast dev
- **PWA** — installable on mobile, works offline
- **localStorage** — simple persistence, no backend needed
- **Tailwind CSS** — rapid UI development

---

## Data Model

```typescript
interface Meal {
  id: string
  name: string
  tags: string[]
}

interface Rule {
  id: string
  dayOfWeek: number        // 0=Mon, 6=Sun
  mealType: "lunch" | "dinner"
  requiredTags: string[]   // meal must have at least one
}

interface DayPlan {
  lunch: Meal | null
  dinner: Meal | null
}

type WeekPlan = Record<DayName, DayPlan>
```

---

## Generation Algorithm

```
for each (day, mealType) slot:
  1. Find rules matching (day, mealType)
  2. candidates = meals satisfying rule constraints
  3. No rules → candidates = all meals
  4. Remove already-used meals (soft: if candidates remain)
  5. Pick random from candidates
```

---

## File Structure

```
src/
├── components/
│   ├── WeekGrid.tsx
│   ├── MealSlot.tsx
│   ├── RuleList.tsx
│   └── RuleForm.tsx
├── data/
│   └── meals.json
├── hooks/
│   └── useLocalStorage.ts
├── utils/
│   └── generator.ts
├── types.ts
├── App.tsx
└── main.tsx
```

---

## UI Structure

- **Week View** (default): 7-column grid (Mon-Sun) × 2 rows (Lunch/Dinner) + Generate button
- **Rules View**: List + Add/Edit/Delete
- **Navigation**: Tab bar `[Week] [Rules]`
