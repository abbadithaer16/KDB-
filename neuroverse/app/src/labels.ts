/** DOM elements positioned each frame by the projector (no React state per frame). */
export const labelEls: Record<string, HTMLElement | null> = {}
/** Scene 5 threads: margin label, SVG line and end dot per annotation. */
export const threadEls: Record<string, { label: HTMLElement | null; line: SVGLineElement | null; dot: SVGCircleElement | null }> = {}
