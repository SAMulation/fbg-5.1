export default class Play {
    bonus = 999;
    dist = 999;
    multiplier_card = 999;
    multiplier_num = 999;
    yard_card = 999;
    multiplier = 999;

    get(attr) {
        return this[attr];
    }

    set(attr, value) {
        this[attr] = value;
    }
}