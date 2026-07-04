\# DutyLookup Driver Rules



\*\*Project:\*\* DutyLookup



\*\*Author:\*\* Salim Ouafi



\*\*Operational Knowledge:\*\* Dublin Bus Driver



\*\*Purpose:\*\* Capture the real operational rules used by Dublin Bus drivers so the parser behaves exactly like the official duty book and real-world operation.



> Designed by a Dublin Bus driver, for Dublin Bus drivers.



\# DutyLookup

\## Driver Operational Rules

\### Designed by a Dublin Bus driver, for Dublin Bus drivers.



\---



\# Purpose



This document records the operational rules used by the DutyLookup parser.



These rules do not come from Excel.



They come from real Dublin Bus operating practice and ensure the application behaves exactly as a driver expects.



\---



\# Rule DB001

\## "g" always means Garage



Example



09:30g



16:20g



20:55g



Meaning



Garage.



The suffix "g" always represents a garage movement.



The parser must remove the "g" and create a Garage event.



\---



\# Rule DB002

\## Break has priority



If a Break occurs at the same time and place as a timing point,



only the Break is shown.



Never display both.



Incorrect



08:42 D'Brook Church



Break



08:42 D'Brook Church



Correct



08:42 D'Brook Church



Break



\---



\# Rule DB003

\## Resume has priority



Exactly the same rule.



Resume replaces any identical timing point.



\---



\# Rule DB004

\## End of Duty



The final operational location becomes



End of Duty.



Example



13:50 D'Brook Church



End of Duty



\---



\# Rule DB005

\## Sign Off



Sign Off is always separate.



Example



13:55



Sign Off



Sign Off never displays a location.



\---



\# Rule DB006

\## Two-part duties



A normal duty consists of



Part 1



Break



Part 2



The second part may come from the first CTT table or the second CTT table.



The parser must search both.



\---



\# Rule DB007

\## Timing points



Major timing points are shown.



Minor timing points may be hidden.



Duplicate timing points are never shown.



\---



\# Rule DB008

\## X1 vertical route pattern



Unlike standard routes,



X1 is described vertically inside the trip column.



Morning example



07:00



X1



from



Kilcoole to



Hawkins St.



09:00



Evening example



17:50



X1



from



Hawkins St.



Kilcoole



19:40



The parser must read the column instructions instead of using the normal timing-point rows.



\---



\# Rule DB009

\## Route instructions have priority



If a trip column contains route instructions,



those instructions override the standard timing-point rows.



This applies to X1 and any future routes using the same workbook layout.



\---



\# Rule DB010

\## Parser philosophy



The workbook stores data.



Drivers understand operations.



The parser must convert workbook data into the way a Dublin Bus driver actually works a duty.



\---



\## Future Rules



DB011



DB012



DB013



…

\# DutyLookup

\## Driver Operational Rules

\### Designed by a Dublin Bus driver, for Dublin Bus drivers.



\---



\# Purpose



This document records the operational rules used by the DutyLookup parser.



These rules do not come from Excel.



They come from real Dublin Bus operating practice and ensure the application behaves exactly as a driver expects.



\---



\# Rule DB001

\## "g" always means Garage



Example



09:30g



16:20g



20:55g



Meaning



Garage.



The suffix "g" always represents a garage movement.



The parser must remove the "g" and create a Garage event.



\---



\# Rule DB002

\## Break has priority



If a Break occurs at the same time and place as a timing point,



only the Break is shown.



Never display both.



Incorrect



08:42 D'Brook Church



Break



08:42 D'Brook Church



Correct



08:42 D'Brook Church



Break



\---



\# Rule DB003

\## Resume has priority



Exactly the same rule.



Resume replaces any identical timing point.



\---



\# Rule DB004

\## End of Duty



The final operational location becomes



End of Duty.



Example



13:50 D'Brook Church



End of Duty



\---



\# Rule DB005

\## Sign Off



Sign Off is always separate.



Example



13:55



Sign Off



Sign Off never displays a location.



\---



\# Rule DB006

\## Two-part duties



A normal duty consists of



Part 1



Break



Part 2



The second part may come from the first CTT table or the second CTT table.



The parser must search both.



\---



\# Rule DB007

\## Timing points



Major timing points are shown.



Minor timing points may be hidden.



Duplicate timing points are never shown.



\---



\# Rule DB008

\## X1 vertical route pattern



Unlike standard routes,



X1 is described vertically inside the trip column.



Morning example



07:00



X1



from



Kilcoole to



Hawkins St.



09:00



Evening example



17:50



X1



from



Hawkins St.



Kilcoole



19:40



The parser must read the column instructions instead of using the normal timing-point rows.



\---



\# Rule DB009

\## Route instructions have priority



If a trip column contains route instructions,



those instructions override the standard timing-point rows.



This applies to X1 and any future routes using the same workbook layout.



\---



\# Rule DB010

\## Parser philosophy



The workbook stores data.



Drivers understand operations.



The parser must convert workbook data into the way a Dublin Bus driver actually works a duty.



\---



\## Future Rules



DB011



DB012



DB013



…



Source



Operational knowledge provided by a Dublin Bus driver.

Source



DB2 October 2025 Duty Book.

docs/

├── DRIVER\_RULES.md          ⭐ Operational knowledge

├── VALIDATION.md            ⭐ Duty validation log

├── PARSER\_ARCHITECTURE.md   ⭐ How the parser works

├── PROJECT\_ROADMAP.md       ⭐ Future development

├── CHANGELOG.md             ⭐ Version history

└── next-steps.md            (temporary)

