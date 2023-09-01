let id = 1;

export function genId(): string {
  const value = `i${id}`;
  id += 1;
  return value;
}
