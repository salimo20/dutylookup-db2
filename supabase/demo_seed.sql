-- Demo seed for DZ4/23 and DZ4/2X.
-- Safe to run after schema.sql.

insert into duty_books (code, garage, zone, routes, release_name, is_active, notes)
values ('DB2-DZ4-OCT-2025-DEMO', 'DB2', 'DZ4', array['E1','X1'], 'DB2 DZ4 E1/X1 Oct 2025 Demo', true, 'Demo data created from project discussion')
on conflict (code) do update set is_active = true;

do $$
declare
  book_id uuid;
  duty23 uuid;
  duty202 uuid;
begin
  select id into book_id from duty_books where code = 'DB2-DZ4-OCT-2025-DEMO';

  insert into duties (duty_book_id, garage, zone, day_type, roster_number, duty_number, display_duty_number, route, ticket_machine_number, shift_type, sign_on_time, sign_on_location, start_time, start_location, finish_time, finish_location, sign_off_time)
  values (book_id, 'DB2', 'DZ4', 'weekday', 'DZ4/23', '23', '23', 'E1', '000', 'EARLY', '06:00', 'Donnybrook Garage', '06:08', 'Donnybrook Garage', '13:55', 'Donnybrook Church', '13:55')
  on conflict (duty_book_id, day_type, roster_number) do update set display_duty_number = excluded.display_duty_number
  returning id into duty23;

  if duty23 is null then select id into duty23 from duties where duty_book_id = book_id and day_type='weekday' and roster_number='DZ4/23'; end if;

  delete from timeline_events where duty_id = duty23;
  insert into timeline_events (duty_id, sequence, event_type, event_time, location, from_duty_number, to_duty_number, notes) values
  (duty23, 1, 'SIGN_ON', '06:00', 'Donnybrook Garage', null, null, 'Report'),
  (duty23, 2, 'START', '06:08', 'Donnybrook Garage', null, null, 'GarageStart'),
  (duty23, 3, 'TIMING_POINT', '06:58', 'Northwood', null, null, null),
  (duty23, 4, 'TIMING_POINT', '08:03', 'Donnybrook Church', null, null, null),
  (duty23, 5, 'TIMING_POINT', '09:25', 'Ballywaltrim', null, null, null),
  (duty23, 6, 'BREAK_START', '10:25', 'Eglington Road', null, null, null),
  (duty23, 7, 'TAKE_OVER', '10:25', 'Eglington Road', '220', '23', 'Taking over from duty 220'),
  (duty23, 8, 'HAND_OVER', '10:25', 'Eglington Road', '23', '7', 'Handing over to duty 7'),
  (duty23, 9, 'RESUME', '11:35', 'Eglington Road', null, null, null),
  (duty23, 10, 'TIMING_POINT', '12:45', 'Northwood', null, null, null),
  (duty23, 11, 'TIMING_POINT', '13:50', 'Donnybrook Church', null, null, null),
  (duty23, 12, 'FINISH', '13:55', 'Donnybrook Church', null, null, 'END'),
  (duty23, 13, 'HAND_OVER', '13:55', 'Donnybrook Church', '23', '44', 'Final handover');

  insert into duties (duty_book_id, garage, zone, day_type, roster_number, duty_number, display_duty_number, route, ticket_machine_number, shift_type, sign_on_time, sign_on_location, start_time, start_location, finish_time, finish_location, sign_off_time)
  values (book_id, 'DB2', 'DZ4', 'weekday', 'DZ4/2X', '202', '202', 'E1/X1', '000', 'BOGEY', '06:30', 'Donnybrook Garage', '06:30', 'Donnybrook Garage', '19:30', 'Donnybrook Garage', '19:30')
  on conflict (duty_book_id, day_type, roster_number) do update set display_duty_number = excluded.display_duty_number;
end $$;
