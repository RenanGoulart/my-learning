import { TZDate } from "@date-fns/tz";
import { addDays, format } from "date-fns";

export const CALENDAR_TIME_ZONE = "America/Sao_Paulo";

export const toSaoPauloLocalDate = (instant: Date) =>
  format(new TZDate(instant.getTime(), CALENDAR_TIME_ZONE), "yyyy-MM-dd");

export function previousLocalDate(localDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    throw new Error("localDate must use the YYYY-MM-DD format");
  }

  const [yearText = "", monthText = "", dayText = ""] = localDate.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  return format(
    addDays(
      new TZDate(year, Number(month) - 1, day, 12, CALENDAR_TIME_ZONE),
      -1,
    ),
    "yyyy-MM-dd",
  );
}
