export function assessLifeDrive({ access = null, correction = null, stopped = false } = {}) {
  const conditions = Object.entries({ access, correction });
  if (typeof stopped !== "boolean" || conditions.some(([, value]) => value !== null && typeof value !== "boolean")) {
    throw new TypeError("Expected true, false, or null for each observation and a Boolean for stop");
  }

  if (stopped) return { action: "pause", condition: null };

  const failure = conditions.find(([, value]) => value === false);
  if (failure) return { action: "propose", condition: failure[0] };

  const unknown = conditions.find(([, value]) => value === null);
  if (unknown) return { action: "verify", condition: unknown[0] };

  return { action: "observe", condition: null };
}
