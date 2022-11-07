import { Queue } from './queue.js'

describe('simple queueing', () => {
  it('immediate queuing works', async () => {
    const q = new Queue()
    q.enqueue('a')
    q.enqueue('b')
    expect(await q.dequeue()).toBe('a')
    expect(await q.dequeue()).toBe('b')
  })

  it('awaiting queuing works', async () => {
    const startTime = Date.now()
    const q = new Queue()
    q.enqueue('a')
    q.enqueue('b')
    setTimeout(() => q.enqueue('c'), 500)
    expect(await q.dequeue()).toBe('a')
    expect(await q.dequeue()).toBe('b')
    expect(await q.dequeue()).toBe('c')
    const dur = Date.now() - startTime
    expect(dur).toBeGreaterThan(500)
  })
})
