"""Demo importer placeholder.

Next step: replace this with the real Excel-to-Supabase importer.
It will read DZ4, DZ5, L25 workbooks, create a new duty_book version,
parse duties and timeline_events, verify, then activate.
"""

from pathlib import Path

print("DutyLookup DB2 importer scaffold")
print("Put Excel files in importer/input/")
print("Planned files:")
for name in ["DB2-Z4-Routes E1-X1 Oct 2025.xlsx", "DZ5 Final.xlsx", "L25 New MH 24.xlsx"]:
    print(f" - {name}")
Path("importer/input").mkdir(parents=True, exist_ok=True)
