# DutyLookup DB2 Parsing Rules

## Driver lookup
- Driver types roster number only.
- Driver chooses day type: weekday, saturday, sunday.
- Resolver maps roster to the duty number used on the ticket machine.

## DZ4 duty rules
- DZ4/01 to DZ4/64 => duties 01 to 64.
- DZ4/1X to DZ4/26X => bogey duties 201 to 226.
- DZ4/71 to DZ4/77 => night duties 71 to 77.

Examples:
- DZ4/23 => duty 23.
- DZ4/2X => duty 202.
- DZ4/26X => duty 226.

## Fallback rule
All routes have roster numbers, but not all routes have separate duty numbers.
If no duty number exists in the table, use the roster number as display_duty_number.

## Shift categories
- EARLY: 04:00–16:00, early week.
- BOGEY: morning and evening peaks, long 3–4 hour break, early/late week.
- RELIEF: 10:00–22:00, early/late week.
- LATE: 14:00–02:00, late week.
- NIGHT: 19:00–07:00, late week.

## Embedded duty headers
Recognize patterns like:
- 205-14:00g
- 205-14:00G
- 026-06:13

Interpretation:
- 205 = duty number
- 14:00 = report/start time
- g/G = garage

## Driver exchange
Every exchange event must preserve:
- time
- location
- taking over from duty number
- handing over to duty number

Example:
- TAKE_OVER from duty 220 to duty 23 at Eglington Road 10:25
- HAND_OVER from duty 23 to duty 7 at Eglington Road 10:25

## Ignore fields
Ignore operational IDs that are not useful to driver duty lookup unless later requested:
- bus IDs
- long block numbers like 02441065
- miscellaneous bus identifiers like Bus 43B
