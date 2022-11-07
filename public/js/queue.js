export class Queue {
  buffer = []
  resolvePromise = null

  enqueue (val) {
    if (this.resolvePromise) {
      this.resolvePromise(val)
      this.resolvePromise = null
    } else {
      this.buffer.push(val)
    }
  }

  async dequeue () {
    if (this.buffer.length === 0) {
      return new Promise((resolve, reject) => {
        this.resolvePromise = resolve
      })
    } else {
      return this.buffer.shift()
    }
  }
}
