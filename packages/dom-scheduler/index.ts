function remove<T>(array: T[], item: T): boolean {
  const index = array.indexOf(item)

  return !!~index && !!array.splice(index, 1)
}

export default new (class DOMScheduler {
  private readonly reads: Function[] = []

  private readonly writes: Function[] = []

  private scheduled = false

  catch?: (error: Error) => unknown

  /**
   * We run this inside a try catch
   * so that if any jobs error, we
   * are able to recover and continue
   * to flush the batch until it's empty.
   *
   * @param {Array} tasks
   */
  runTasks(tasks: Function[]) {
    let task
    //todo improve performance
    while ((task = tasks.shift())) task()
  }

  measure<T extends Function>(task: T): T {
    this.reads.push(task)
    this.scheduleFlush()

    return task
  }

  mutate<T extends Function>(task: T): T {
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
      requestAnimationFrame(() => {
        this.flush()
      })
    }
  }

  protected flush() {
    const reads = this.reads.slice()
    const writes = this.writes.slice()
    let error: Error | undefined

    this.reads.length = 0
    this.writes.length = 0
    this.scheduled = false

    try {
      this.runTasks(reads)
      this.runTasks(writes)
    } catch (e) {
      error = e
    }

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
