export const demoDuties = [
  {
    duty_book_code: 'DB2-DZ4-OCT-2025-DEMO',
    garage: 'DB2',
    zone: 'DZ4',
    day_type: 'weekday',
    roster_number: 'DZ4/23',
    duty_number: '23',
    display_duty_number: '23',
    route: 'E1',
    ticket_machine_number: '000',
    shift_type: 'EARLY',
    sign_on_time: '06:00',
    sign_on_location: 'Donnybrook Garage',
    start_time: '06:08',
    start_location: 'Donnybrook Garage',
    finish_time: '13:55',
    finish_location: 'Donnybrook Church',
    sign_off_time: '13:55',
    events: [
      { event_type: 'SIGN_ON', event_time: '06:00', location: 'Donnybrook Garage', notes: 'Report' },
      { event_type: 'START', event_time: '06:08', location: 'Donnybrook Garage', notes: 'GarageStart' },
      { event_type: 'TIMING_POINT', event_time: '06:58', location: 'Northwood' },
      { event_type: 'TIMING_POINT', event_time: '08:03', location: "Donnybrook Church" },
      { event_type: 'TIMING_POINT', event_time: '09:25', location: 'Ballywaltrim' },
      { event_type: 'BREAK_START', event_time: '10:25', location: 'Eglington Road' },
      { event_type: 'TAKE_OVER', event_time: '10:25', location: 'Eglington Road', from_duty_number: '220', to_duty_number: '23', notes: 'Taking over from duty 220' },
      { event_type: 'HAND_OVER', event_time: '10:25', location: 'Eglington Road', from_duty_number: '23', to_duty_number: '7', notes: 'Handing over to duty 7' },
      { event_type: 'RESUME', event_time: '11:35', location: 'Eglington Road' },
      { event_type: 'TIMING_POINT', event_time: '12:45', location: 'Northwood' },
      { event_type: 'TIMING_POINT', event_time: '13:50', location: 'Donnybrook Church' },
      { event_type: 'FINISH', event_time: '13:55', location: 'Donnybrook Church', notes: 'END' },
      { event_type: 'HAND_OVER', event_time: '13:55', location: 'Donnybrook Church', from_duty_number: '23', to_duty_number: '44', notes: 'Final handover' }
    ]
  },
  {
    duty_book_code: 'DB2-DZ4-OCT-2025-DEMO',
    garage: 'DB2',
    zone: 'DZ4',
    day_type: 'weekday',
    roster_number: 'DZ4/2X',
    duty_number: '202',
    display_duty_number: '202',
    route: 'E1/X1',
    ticket_machine_number: '000',
    shift_type: 'BOGEY',
    sign_on_time: '06:30',
    sign_on_location: 'Donnybrook Garage',
    start_time: '06:30',
    start_location: 'Donnybrook Garage',
    finish_time: '19:30',
    finish_location: 'Donnybrook Garage',
    sign_off_time: '19:30',
    events: [
      { event_type: 'SIGN_ON', event_time: '06:30', location: 'Donnybrook Garage', notes: 'Bogey example. Replace with parsed CTT data.' },
      { event_type: 'BREAK_START', event_time: '10:00', location: 'City Centre', notes: 'Long bogey break example' },
      { event_type: 'RESUME', event_time: '14:00', location: 'Donnybrook Garage', notes: 'Embedded duty header example 202-14:00g' },
      { event_type: 'FINISH', event_time: '19:30', location: 'Donnybrook Garage' }
    ]
  }
];

export function findDemoDuty(roster, dayType) {
  return demoDuties.find(
    (d) => d.roster_number === roster && d.day_type === dayType
  );
}
