export const routeInfo = {
  E1: {
    controllerRoutes: 'E1 • X1 • X2',
    controllerPhone: '01 703 1167',
    facilities: [
      {
        place: 'Northwood',
        lines: ['Use Northwood Medical Clinic toilet.', 'No access code required.']
      },
      {
        place: 'Ballywaltrim',
        lines: ['Toilet available.', 'Access: press 1 + 4 together, then turn 5 clockwise.']
      }
    ]
  },

  X1: {
    controllerRoutes: 'E1 • X1 • X2',
    controllerPhone: '01 703 1167',
    facilities: [
      {
        place: 'X1 termini',
        lines: ['No driver facilities available at either terminus.']
      }
    ]
  },

  '7': {
    controllerRoutes: '7 • 7A • 7B • 7E • 47',
    controllerPhone: '01 703 1122',
    facilities: [
      {
        place: 'Mountjoy Square',
        lines: ['Use Summerhill Garage driver facilities.']
      },
      {
        place: "Bride's Glen",
        lines: ['Use SPAR shop toilet facilities.']
      }
    ]
  },

  '7A': {
    controllerRoutes: '7 • 7A • 7B • 7E • 47',
    controllerPhone: '01 703 1122',
    facilities: [
      {
        place: 'Mountjoy Square',
        lines: ['Use Summerhill Garage driver facilities.']
      },
      {
        place: 'Loughlinstown',
        lines: ['Use Leisure Centre / Gym driver facilities.']
      }
    ]
  },

  '7B': {
    controllerRoutes: '7 • 7A • 7B • 7E • 47',
    controllerPhone: '01 703 1122',
    facilities: [
      {
        place: 'Mountjoy Square',
        lines: ['Use Summerhill Garage driver facilities.']
      },
      {
        place: 'Shankill',
        lines: ['Use nearby shops or pub facilities.']
      }
    ]
  },

  '7E': {
    controllerRoutes: '7 • 7A • 7B • 7E • 47',
    controllerPhone: '01 703 1122',
    routeNote: 'Staff transfer / ghost bus. Collects drivers from Dalkey and brings them to the garage.',
    facilities: [
      {
        place: 'Dalkey',
        lines: ['Staff transfer pickup point.']
      },
      {
        place: 'Garage',
        lines: ['Use Dublin Bus garage driver facilities.']
      }
    ]
  },

  '47': {
    controllerRoutes: '7 • 7A • 7B • 7E • 47',
    controllerPhone: '01 703 1122',
    facilities: [
      {
        place: 'Mountjoy Square',
        lines: ['Use Summerhill Garage driver facilities.']
      },
      {
        place: 'Belarmine',
        lines: ['No official driver facilities available.']
      }
    ]
  },

  L25: {
    controllerRoutes: 'L25',
    controllerPhone: '01 703 1143',
    facilities: [
      {
        place: 'Dundrum',
        lines: ['Dublin Bus driver facility.', 'Access code: 1916']
      },
      {
        place: 'Dún Laoghaire Train Station',
        lines: ['Driver toilet available.', 'Access code: 2626']
      }
    ]
  }
};

export function getRouteInfo(route) {
  return routeInfo[String(route || '').toUpperCase()] || null;
}