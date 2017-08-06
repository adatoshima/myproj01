export function timestr(dt:Date):string {
  return dt.toTimeString().split(' ')[0];
}