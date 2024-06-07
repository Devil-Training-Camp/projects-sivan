type TaskFunction = () => Promise<void>;

class TaskQueue {
  private maxConcurrent: number; // 最大并发数
  private pendingTasks: { task: TaskFunction; retries: number }[] = [];
  private runningCount = 0;
  private maxRetries = 2; // 最大重试次数

  constructor(maxConcurrent: number) {
    if (maxConcurrent <= 0) {
      throw new Error("maxConcurrent必须是一个正整数");
    }
    this.maxConcurrent = maxConcurrent;
  }

  enqueue(task: TaskFunction, retries = 0) {
    this.pendingTasks.push({ task, retries });
    this.runTask();
  }

  private async runTask() {
    if (this.runningCount < this.maxConcurrent && this.pendingTasks.length > 0) {
      const { task, retries } = this.pendingTasks.shift()!;
      this.runningCount++;
      try {
        await task();
      } catch (error) {
        if (retries < this.maxRetries) {
          // 重新入队重试
          this.pendingTasks.push({ task, retries: retries + 1 });
        }
      } finally {
        this.runningCount--;
        this.runTask();
      }
    }
  }
}

export default TaskQueue;
