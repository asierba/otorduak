# Otorduak — PRD

## Problem
Planning weekly meals is tedious. The mental load of deciding "what to eat" while respecting family habits/constraints is the pain point.

## Solution
App that generates a weekly meal plan (Mon-Sun, lunch + dinner) based on:
- A catalog of meals the family rotates through
- Rules/constraints (e.g., "fish on Tuesdays", "legumes early in week")

## Target User
Single user, running locally. No accounts, no server, no sync.

---

## Functional Requirements

### Meal Catalog
- Hardcoded in a JSON file (no UI to manage)
- Each meal: name + tags
- **Tags** = categories that link meals to rules. E.g., "Lentils" has tag `legumes`, so it can fill the Tuesday lunch slot.

### Rules/Constraints (hardcoded for v1)
| Slot | Rule |
|------|------|
| Monday lunch | No rule (user picks manually — usually leftovers or frozen) |
| Tuesday lunch | Legumes |
| Tuesday dinner | Fish |
| Wednesday dinner | Superensalada |
| Thursday dinner | Fish |
| Friday dinner | TV food |
| Saturday lunch | Special (solomillo, entrecot) |
| Saturday dinner | TV food |
| Sunday lunch | Batch cook (paella, lasaña, fideuá) |
| Sunday dinner | TV food |

Additional considerations:
- Prep happens night before → prefer easy-prep meals on busy days

### Week Generation
- One-click full week generation
- Respects all rules
- Avoids repeating meals within the week (soft constraint)

### Manual Adjustments (key feature)
- **Swap meal** — tap a slot, pick a different meal from valid options (same tags)
- Regenerate single slot (random pick)
- Clear slot

### Persistence
- Not needed for v1 — generate, swap, copy to whiteboard in one session
- Meals and rules are hardcoded (no user data to save)

---

## Non-Functional Requirements
- Runs locally (no server)
- Installable on Android (PWA)
- Works offline
- Fast — instant generation

---

## Out of Scope (v1)
- Current Week plan persistence
- Grocery list
- Multiple users
- Meal history (for cross-week variety)
- Recipe details
- Son's meal planning (separate menu)
- Nursery menu integration
- Freezer inventory management
- Conditional rules (e.g., no prep Sunday night → Monday lunch is leftovers from Sunday's batch)
