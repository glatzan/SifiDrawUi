export interface ProcessCallback {
  exportIsRunning: boolean;
  percentRun: number;
  completedRunCount : number;
  maxRunCount: number;

  callback(): void;
}
