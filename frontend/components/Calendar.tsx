export function Calendar({ dueDates }: { dueDates: Record<string, string[]> }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const rows = [] as JSX.Element[];
  let day = 1 - firstDay;
  for (let i = 0; i < 6; i++) {
    const cells = [] as JSX.Element[];
    for (let j = 0; j < 7; j++, day++) {
      if (day < 1 || day > daysInMonth) {
        cells.push(<td key={j}></td>);
      } else {
        const dateStr = new Date(year, month, day).toISOString().slice(0, 10);
        cells.push(
          <td key={j} className="border p-1 align-top" style={{ minWidth: 80 }}>
            <div>{day}</div>
            <ul>
              {(dueDates[dateStr] || []).map((t, idx) => (
                <li key={idx} style={{ fontSize: '0.8em' }}>{t}</li>
              ))}
            </ul>
          </td>
        );
      }
    }
    rows.push(<tr key={i}>{cells}</tr>);
  }

  return (
    <table className="border-collapse">
      <thead>
        <tr>
          <th>Sun</th>
          <th>Mon</th>
          <th>Tue</th>
          <th>Wed</th>
          <th>Thu</th>
          <th>Fri</th>
          <th>Sat</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}
