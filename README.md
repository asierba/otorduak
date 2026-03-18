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

## Rules

| Slot | Tag |
|------|-----|
| Monday lunch | frozen/leftovers |
| Tuesday lunch | weekday-lunch |
| Tuesday dinner | fish |
| Wednesday dinner | salad |
| Thursday dinner | fish |
| Friday dinner | tv-food |
| Saturday lunch | special |
| Saturday dinner | outdoor |
| Sunday lunch | batch |
| Sunday dinner | tv-food |

**Weekly rules:** At least 1 legumes lunch per week (any day).

## Edit meals

Modify `src/data/meals.json` to add/remove meals.

## Build for production

```bash
npm run build
```

Output in `dist/` — deploy to any static host.
