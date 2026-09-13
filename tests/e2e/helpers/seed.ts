export async function uniqueEmail(prefix = "e2e") {
  return `${prefix}+${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.local`;
}
