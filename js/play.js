// LATER: CHANGE ALL 999 to null

export default class Play {
  bonus = null
  dist = null
  multiplier_card = null
  multiplier_num = null
  yard_card = null
  multiplier = null
  quality = null
  quality_array = ['Best', 'Good', 'Okay', 'Decent', 'Worst']

  // get(attr) {
  //     return this[attr];
  // }

  // set(attr, value) {
  //     this[attr] = value;
  // }
  getQuality () {
    if (this.quality === '/') {
      return this.quality
    } else if (this.quality === null) {
      return 'Best'
    } else {
      return this.quality_array[this.quality - 1]
    }
  }
}
