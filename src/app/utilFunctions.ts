export function timestr(dt:Date):string {
  return dt.toTimeString().split(' ')[0];
}

export function dtstr(dt:Date):string {
  let d=dt.getDate();
  let m=dt.getMonth()+1;
  let y=dt.getFullYear();
  let s=y.toString()+'-'+
    (m>9?m.toString():'0'+m)+'-'+
    (d>9?d.toString():'0'+d)+' ';
  return s+timestr(dt);
}

export function isInt(n) {
  return (n===parseInt(n,10));
}
