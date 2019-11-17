import { requestAnimationFrame } from '@rosemlabs/std'

function remove<T>(array: T[], item: T): boolean {
  const index = array.indexOf(item)

  return !!~index && !!array.splice(index, 1)
}

function runTasks(tasks: Function[]) {
  let task
  //todo improve performance
  while ((task = tasks.shift())) task()
}

export default new (class DOMScheduler {
  reads: Function[] = []
  writes: Function[] = []
  scheduled: boolean = false
  catch?: (error: Error) => any

  measure<T extends Function>(task: T): T {
    this.reads.push(task)
    this.scheduleFlush()

    return task
  }

  mutate<T extends Function>(task: T, name?: string, description?: string): T {
    this.writes.push(task)
    this.scheduleFlush()

    return task
  }

  clear<T extends Function>(task: T): boolean {
    return remove(this.reads, task) || remove(this.writes, task)
  }

  protected scheduleFlush() {
    if (!this.scheduled) {
      this.scheduled = true
      requestAnimationFrame(() => this.flush())
    }
  }

  protected flush() {
    const writes = this.writes
    const reads = this.reads
    let error: Error | undefined

    try {
      runTasks(reads)
      runTasks(writes)
    } catch (e) {
      error = e
    }

    this.scheduled = false

    // If the batch errored we may still have tasks queued
    if (reads.length || writes.length) {
      this.scheduleFlush()
    }

    if (error) {
      if (this.catch) {
        this.catch(error)
      } else {
        throw error
      }
    }
  }
})()
