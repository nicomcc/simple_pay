

function parseDMY(s) {
  const b = s.split(/\D/);
  return new Date(b[2], b[1] - 1, b[0]);
}

function formatDMY(d) {
  function z(n) { return (n < 10 ? '0' : '') + n; }
  if (isNaN(+d)) return d.toString();
  return `${z(d.getDate())}/${ z(d.getMonth() + 1)}/${d.getFullYear()}`;
}

exports.getDate = () => {
  const today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();
  if (dd < 10) {
    dd = `0${dd}`;
  }
  if (mm < 10) {
    mm = `0${mm}`;
  }
  return `${dd}/${mm}/${yyyy}`;
};

exports.dateIsPast = (d1, d2) => {
  const date1 = parseDMY(d1);
  const date2 = parseDMY(d2);

  return (date1 >= date2);
}

exports.addDays = (s, days) => {
  const d = parseDMY(s);
  d.setDate(d.getDate() + Number(days));
  return formatDMY(d);
};
