export default class Play {
  bonus = 999
  dist = 999
  multiplier_card = 999
  multiplier_num = 999
  yard_card = 999
  multiplier = 999
  quality = 999
  quality_array = ['Best', 'Good', 'Okay', 'Decent', 'Worst']

  // get(attr) {
  //     return this[attr];
  // }

  // set(attr, value) {
  //     this[attr] = value;
  // }
  getQuality () {
    if (this.quality === 999) {
      return 'Best'
    } else {
      return this.quality_array[this.quality - 1]
    }
  }
}
