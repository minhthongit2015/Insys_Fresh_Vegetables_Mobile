import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";

export class ScheduleControler {
  private ob: Observable<any>;
  public target: any;
  public timeout: number;
  private handle: number;

  constructor(target: any, timeout=60) {
    this.target = target;
    this.timeout = timeout;
  }

  public start() {
    this.handle = setInterval(() => {
      this.target()
    }, this.timeout*1000);
  }

  public stop() {
    clearInterval(this.handle)
  }
}