from datetime import date

start = date(year=2026, month=2, day=1)

for j in range(12):

    if start.month == 1:
        start = start.replace(year=start.year - 1, month=12)
    else:
        start = start.replace(month=start.month - 1)
    print(start)
