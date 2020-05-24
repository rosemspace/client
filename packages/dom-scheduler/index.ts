function remove<T>(array: T[], item: T): boolean {
  const index = array.indexOf(item)

  return !!~index && !!array.splice(index, 1)
}

// const fastDomStrict = require('fastdom/fastdom-strict')
// import fastdom from 'fastdom'
// fastdom.extend(fastDomStrict)
// export default fastDomStrict

export default new (class DOMScheduler {
  private frameId = 0

  public reads: Function[] = []

  public writes: Function[] = []

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
  runTasks(tasks: Function[], time: number) {
    let task
    //todo improve performance
    while ((task = tasks.shift())) task(time)

    // for (const task of tasks) {
    //   task()
    // }
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

  cancel() {
    cancelAnimationFrame(this.frameId)
  }

  protected scheduleFlush() {
    if (!this.scheduled) {
      this.scheduled = true
      this.frameId = requestAnimationFrame((time) => {
        this.flush(time)
      })
    }
  }

  protected flush(time: number) {
    const reads = this.reads
    const writes = this.writes
    let error: Error | undefined

    // this.reads = []
    // this.writes = []
    // this.scheduled = false

    try {
      this.runTasks(reads, time)
      this.runTasks(writes, time)
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
