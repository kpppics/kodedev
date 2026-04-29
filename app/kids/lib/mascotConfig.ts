/**
 * Mascot image config. Drop the supplied artwork at `/public/mascot/source.png`
 * (or any of the alt paths below) and the hybrid mascot will render it with
 * SVG-overlaid expressions for talking / thinking / cheering states.
 *
 * If no image is available, the app falls back to the inline-SVG mascot.
 */
export const MASCOT_IMAGE_SRC = '/mascot/source.png'

/**
 * Aspect ratio (width / height) of the source image.
 * Adjust if the user's PNG has different proportions.
 */
export const MASCOT_ASPECT = 9 / 16

/**
 * Where the robot's visor sits within the image, expressed as percentages
 * (0..100) of the image. These drive the overlay SVG so eye/mouth shapes
 * land in the right place over the rendered photo.
 */
export const MASCOT_VISOR = {
  // bounding box of the dark visor (face screen)
  left: 26,
  right: 74,
  top: 10,
  bottom: 30,
  // eye centers (smiling arcs in the source image)
  leftEyeX: 39,
  rightEyeX: 61,
  eyesY: 19,
  eyeHalfWidth: 5,
  // mouth center
  mouthX: 50,
  mouthY: 26,
  mouthHalfWidth: 4,
  // visor fill colour (used to "patch over" the source eyes/mouth when
  // overlaying a different expression)
  fill: '#0a141a',
}
