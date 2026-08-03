export type DurationFields = {
  hours: string;
  minutes: string;
};

export class DurationFieldsError extends Error {
  constructor(
    public readonly fieldErrors: Partial<
      Record<keyof DurationFields, string[]>
    >,
  ) {
    super("Informe uma duração válida.");
  }
}

export function durationFieldsToMinutes({
  hours,
  minutes,
}: DurationFields): number | undefined {
  if (hours === "" && minutes === "") {
    return undefined;
  }

  const parsedHours = hours === "" ? 0 : Number(hours);
  const parsedMinutes = minutes === "" ? 0 : Number(minutes);
  const fieldErrors: Partial<Record<keyof DurationFields, string[]>> = {};

  if (hours !== "" && (!/^\d+$/.test(hours) || parsedHours > 24)) {
    fieldErrors.hours = ["Informe horas entre 0 e 24."];
  }
  if (minutes !== "" && (!/^\d+$/.test(minutes) || parsedMinutes > 59)) {
    fieldErrors.minutes = ["Informe minutos entre 0 e 59."];
  }
  if (parsedHours === 24 && parsedMinutes !== 0) {
    fieldErrors.minutes = ["Com 24 horas, os minutos devem ser 0."];
  }
  if (parsedHours === 0 && parsedMinutes === 0) {
    fieldErrors.hours = ["Informe uma duração maior que zero."];
    fieldErrors.minutes = ["Informe uma duração maior que zero."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new DurationFieldsError(fieldErrors);
  }

  return parsedHours * 60 + parsedMinutes;
}
