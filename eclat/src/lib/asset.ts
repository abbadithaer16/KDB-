/** Resolves a public asset against the deployed base (works from any sub-path). */
export const asset = (p: string) => import.meta.env.BASE_URL + p.replace(/^\//, '')
