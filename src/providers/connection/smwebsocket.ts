import { ConnectionManager } from "./connect_mgr.1";
import { DynamicAddress } from "./connection";

export class SmartGardenWebSocket {
  public sock: WebSocket;
  public addr: DynamicAddress;
  public packageHandler: any;
  public queue: any[];

  private connMgr: ConnectionManager;

  constructor(addr: any = null) {
    this.queue = [];
    this.setServer(addr);
  }

  public clone() : SmartGardenWebSocket {
    return new SmartGardenWebSocket(this.addr);
  }

  public setup(connMgr: ConnectionManager) {
    if (!connMgr) return;
    this.connMgr = connMgr;
    this.packageHandler = (e) => connMgr.onEvent(e);
  }

  public setServer(addr: any) {
    if (!addr) return;
    if (typeof(addr) == "string") {
      this.addr = new DynamicAddress(addr.split(":")[0], addr.split(":")[1]);
    } else if (typeof(addr) == "object") {
      this.addr = addr
    }
  }

  public connect(onsuccess=null, onfailed=null) {
    if (!this.packageHandler) return;

    this.sock = new WebSocket(`ws://${this.addr.ip}:${this.addr.port}`);
    this.sock.onopen = onsuccess;
    this.sock.onerror = onfailed;
    this.sock.addEventListener("open", (e) => this.onEvent(e));
    this.sock.addEventListener("message", (e) => this.onEvent(e));
    this.sock.addEventListener("error", (e) => this.onEvent(e));
    this.sock.addEventListener("close", (e) => this.onEvent(e));
  }

  public close(onClosed=null) {
    if (this.closed) {
      if (onClosed) onClosed();
      return;
    }
    if (this.sock) {
      this.sock.onclose = onClosed;
      this.sock.close();
    }
  }

  public keepOpen() {
    this.connect(() => {
      this.sock.onclose = () => this.keepOpen();
    }, () => this.keepOpen());
  }

  public get readyState() { return this.sock ? this.sock.readyState : null }
  public get connecting() { return this.sock && this.sock.readyState == WebSocket.CONNECTING }
  public get open() { return this.sock && this.sock.readyState == WebSocket.OPEN }
  public get closing() { return this.sock && this.sock.readyState == WebSocket.CLOSING }
  public get closed() { return this.sock && this.sock.readyState == WebSocket.CLOSED }

  public send(msg) {
    this.queue.push(msg);
    this.notifySend();
  }

  public notifySend() {
    let msg = this.queue[0];
    if (this.open && msg) {
      this.sock.send(msg);
      this.queue.shift();
    }
  }

  public onEvent(e) {
    e.smsocket = this;
    if (e.type == "open") {
      this.notifySend();
    }
    if (this.packageHandler) this.packageHandler(e);
  }

  // open/failed, message, , failed, close
}