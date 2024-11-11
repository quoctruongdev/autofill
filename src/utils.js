const storage = {
  set: async (key, values) => {
    await chrome?.storage.local.set({
      [key]: values,
    });
  },
  get: async (key) => {
    const values = await chrome?.storage.local.get();
    if (values) {
      const res = values[key] ?? null;
      return res;
    }
    return null;
  },
  log: async () => {
    const values = await chrome?.storage.local.get();
    console.log('values', values);
  },
  clear: async () => {
    await chrome?.storage.local.clear();
  },
};

function isOpenOrderDay(openDate, targetDate) {
  console.log('targetDate1', targetDate);
  const [currentDay, currentMonth, currentYear] = parseDate(targetDate);
  console.log({ currentDay, currentMonth, currentYear });
  const firstDateMatch = openDate.match(/^\d{2}\.\d{2}\.\d{4}/);
  const firstDateString = firstDateMatch ? firstDateMatch[0] : null;
  if (!firstDateString) return false;
  const [day, month, year] = parseDate(firstDateString);
  if (year === currentYear && month === currentMonth && day === currentDay) {
    console.log('open day buy course', firstDateString);
    return true;
  }
  return false;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function parseDate(dateString) {
  const parts = dateString.split('.');
  if (parts.length !== 3) {
    throw new Error('Chuỗi ngày không hợp lệ. Định dạng mong đợi: dd.mm.yyyy');
  }
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) {
    throw new Error('Chuỗi ngày không hợp lệ');
  }
  return [date.getDate(), date.getMonth() + 1, date.getFullYear()];
}

function goBack() {
  window.history.go(-1);
}

export { storage, sleep, parseDate, goBack, isOpenOrderDay };
