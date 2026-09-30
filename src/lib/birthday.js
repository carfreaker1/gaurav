import { useEffect, useState } from 'react';
import { content } from '../config';

export function birthdayDate(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: content.birthday.timeZone, day: '2-digit', month: '2-digit', year: 'numeric',
  }).formatToParts(now).map(part => [part.type, part.value]));
  return {
    year: Number(parts.year),
    isBirthday: Number(parts.day) === content.birthday.day && Number(parts.month) === content.birthday.month && Number(parts.year) >= content.birthday.startYear,
    key: parts.year + '-' + parts.month + '-' + parts.day,
  };
}

export function useAnnualBirthday(ready) {
  const [calendar, setCalendar] = useState(() => birthdayDate());
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!ready) return;
    let shown = '';
    const check = () => {
      const today = birthdayDate();
      setCalendar(previous => previous.key === today.key ? previous : today);
      const key = 'gaurav-birthday-seen-' + today.key;
      let seen = false;
      try { seen = sessionStorage.getItem(key) === 'true'; } catch { /* Session storage is optional. */ }
      if (today.isBirthday && !seen && shown !== key) {
        shown = key;
        setOpen(true);
        try { sessionStorage.setItem(key, 'true'); } catch { /* In-memory guard still works. */ }
      }
    };
    check();
    const timer = setInterval(check, 30000);
    document.addEventListener('visibilitychange', check);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', check); };
  }, [ready]);
  return { ...calendar, open, setOpen };
}
