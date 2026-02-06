# Otorduak

Weekly meal planner with fixed rules and easy swapping.

## Run

```bash
npm install
npm run dev
```

## How it works

1. Click **Generate Week** to create a meal plan
2. Tap any slot to swap meals or regenerate
3. Copy the result to your whiteboard

## Meal Categories

| Category | Slots | Description |
|----------|-------|-------------|
| `weekday-lunch` | Mon–Fri lunch | Everyday lunch meals |
| `weekday-dinner` | Mon–Fri dinner | Everyday dinner meals |
| `weekend-lunch` | Sat–Sun lunch | Special weekend meals |
| `weekend-dinner` | Sat–Sun dinner | TV / casual dinners |
| `general` | Any weekday slot | Flexible meals for any weekday |

### Frequency Rules

Meals can also have food-type tags (`fish`, `legumes`) that enforce weekly variety:

| Tag | Frequency | Slot |
|-----|-----------|------|
| `fish` | 2× per week | Weekday dinner |
| `legumes` | 1× per week | Weekday lunch |

## Edit meals

Modify `src/data/meals.json` to add/remove meals.

## Build for production

```bash
npm run build
```

Output in `dist/` — deploy to any static host.
