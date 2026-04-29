# Kodey mascot artwork

The Little KODE Dev app loads the mascot photo from this folder.

## Default image

Drop the supplied artwork here as `source.png` (PNG with transparent or
black background both work):

    public/mascot/source.png

`MascotHybrid` picks it up automatically. Until it exists, the app renders
the inline-SVG fallback in `app/kids/components/Mascot.tsx`.

## Tuning the overlay positions

The hybrid mascot overlays live SVG eye/mouth shapes on top of the image
to drive talking / blink / cheering states. If the image proportions or
visor location differ from the default, edit:

    app/kids/lib/mascotConfig.ts

- `MASCOT_ASPECT` — width / height of the source image
- `MASCOT_VISOR.{leftEyeX, rightEyeX, eyesY, mouthX, mouthY, ...}` — given
  as percentages of the image; tweak so the overlay shapes land inside
  the visor.

## Optional: per-pose images

Future enhancement — if you generate alternate poses (e.g. `cheering.png`,
`sleeping.png`, `waving.png`) drop them in this folder and we'll wire them
into the state machine to swap the base image as well as overlay shapes.
