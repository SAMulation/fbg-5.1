export default class Team {
    constructor(name = 'Name', city = 'City', abrv = 'FBG') {
        this.name = name;
        this.city = city;
        this.abrv = abrv;    
    }

    get(attr) {
        return this[attr];
    }

    getTeam() {
        return {
            'name': this.name,
            'city': this['city'],
            'abrv': this['abrv']
        }
    }

    set(attr, value) {
        this[attr] = value;
    }

    setTeam(team) {
        keys(team).forEach(attr => {
            this[attr] = team[attr];
        });
    }
}