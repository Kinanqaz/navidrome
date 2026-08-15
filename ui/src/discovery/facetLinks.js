export const buildFacetSongUrl = (filterField, id) => {
  const filter = encodeURIComponent(JSON.stringify({ [filterField]: [id] }))
  return `/song?filter=${filter}`
}
