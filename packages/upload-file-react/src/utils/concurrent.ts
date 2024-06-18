type TaskFunction = () => Promise<void>;
type CallbackFunction = (successfulTasks: number) => void;

class TaskQueue {
  private maxConcurrent: number; // 最大并发数
  private pendingTasks: { task: TaskFunction; retries: number }[] = [];
  private runningCount = 0;
  private maxRetries = 2; // 最大重试次数
  private successfulTasks = 0; // 成功执行任务数
  private allTasksCompletedCallback?: CallbackFunction;

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
        this.successfulTasks++;
      } catch (error) {
        if (retries < this.maxRetries) {
          // 重新入队重试
          this.pendingTasks.push({ task, retries: retries + 1 });
        }
      } finally {
        this.runningCount--;
        // 这里看起来应该没有起到并发执行的效果
        // 因为上面 await 了，这里等前面 task 执行完才会执行下一个
        // 这是比较严重的 bug，请重视
        this.runTask();
      }
    }
    // 检查是否所有的任务都执行完成
    if (this.runningCount === 0 && this.pendingTasks.length === 0 && this.allTasksCompletedCallback) {
      this.allTasksCompletedCallback(this.successfulTasks);
    }
  }

  private onAllTasksCompleted(callback: CallbackFunction) {
    this.allTasksCompletedCallback = callback;
  }

  async waitForAllTasks() {
    return new Promise<number>((resolve) => {
      this.onAllTasksCompleted(resolve);
    });
  }
}

export default TaskQueue;
