import { TEAMS } from './teams.js'

export default class Team {
  constructor (name, city = 'City', abrv = 'FBG', color1 = '#FFFFFF', color2 = '#000000') {
    // Allow passing Team objects or objects from TEAMS
    if (typeof (name) === 'object') {
      abrv = name.abrv
      city = name.city
      color1 = name.color1
      color2 = name.color2
      name = name.name
    } else {
      const index = name
      city = TEAMS[index].city
      abrv = TEAMS[index].abrv
      name = TEAMS[index].name
      color1 = TEAMS[index].color1
      color2 = TEAMS[index].color2
    }
    this.name = name
    this.city = city
    this.abrv = abrv
    this.color1 = color1
    this.color2 = color2
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
