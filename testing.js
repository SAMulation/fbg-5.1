

class Team {
    constructor(name, city, abrv) {
        this.name = name;
        this.city = city;
        this.abrv = abrv;
    }

    getTeam() {
        return {
            'name': this['name'],
            'city': this['city'],
            'abrv': this['abrv']
        }
    }

    get(attr) {
        return this[attr];
    }

    set(attr, value) {
        this[attr] = value;
    }
}


let testTeam = new Team('Rams', 'Los Angeles', 'LAR');
console.log(testTeam.getTeam())