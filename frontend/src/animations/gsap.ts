export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const isSmall = () => typeof window !== 'undefined' && window.innerWidth < 768

/** GSAP + ScrollTrigger + SplitText are loaded lazily so the admin never downloads them. */
export async function loadGsap() {
  const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
    import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText'),
  ])
  gsap.registerPlugin(ScrollTrigger, SplitText)
  return { gsap, ScrollTrigger, SplitText }
}

/** Resolves once fonts are ready so SplitText measures real line breaks (max 1.2s wait). */
export const fontsReady = () =>
  Promise.race([
    (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready ?? Promise.resolve(),
    new Promise((r) => setTimeout(r, 1200)),
  ])
