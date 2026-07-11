export function crimeAnswers(crimeId: string, all: Record<string, string>): Record<string, string> {
  const prefix = `${crimeId}:`
  const result: Record<string, string> = {}
  for (const [k, v] of Object.entries(all)) {
    if (k.startsWith(prefix)) result[k.slice(prefix.length)] = v
  }
  return result
}
