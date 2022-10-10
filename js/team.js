import { TEAMS } from './teams.js'

export default class Team {
  constructor (name, city = 'City', abrv = 'FBG') {
    // Allow passing Team objects or objects from TEAMS
    if (typeof (name) === 'object') {
      abrv = name.abrv
      city = name.city
      name = name.name
    } else {
      const index = name
      city = TEAMS[index].city
      abrv = TEAMS[index].abrv
      name = TEAMS[index].name
    }
    this.name = name
    this.city = city
    this.abrv = abrv
  }

  get print () {
    return this.city + ' ' + this.name
  }
}

// get(attr) {
//     return this[attr];
// }

// // getTeam() {
// //     return {
// //         'name': this.name,
// //         'city': this.city,
// //         'abrv': this['abrv']
// //     }
// // }

// set(attr, value) {
//     this[attr] = value;
// }

// setTeam(team) {
//     keys(team).forEach(attr => {
//         this[attr] = team[attr];
//     });
// }

// CITY + NAME
