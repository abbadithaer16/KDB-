import { useLayoutEffect, type DependencyList, type RefObject } from 'react'
import { gsap } from './scroll'

/** Runs GSAP setup inside a scoped context and reverts everything on unmount. */
export function useGsap(scope: RefObject<HTMLElement>, setup: (ctx: gsap.Context) => void, deps: DependencyList = []) {
  useLayoutEffect(() => {
    if (!scope.current) return
    const ctx = gsap.context((self) => setup(self), scope)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
