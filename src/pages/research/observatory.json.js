import {observatoryReport} from "../../lib/observatory-report.mjs";

export function GET() {
  return new Response(JSON.stringify(observatoryReport(), null, 2), {
    headers: {"Content-Type": "application/json; charset=utf-8"}
  });
}
