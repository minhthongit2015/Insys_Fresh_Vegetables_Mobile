import { ConnectMethod } from "../../models/connection/connect_method";
import { Injectable } from "@angular/core";


@Injectable()
export class WebsocketHandle extends ConnectMethod {
  private addr: string = '';
  private port: string = '';
  private sock: WebSocket;

  constructor() {
    super();
  }

  set host(host: string) {
    try {
      if (host.split(":").length != 2) return;
      this.addr = host.split(":")[0];
      this.port = host.split(":")[1];
    } catch (e) {

    }
  }
  get host() { return `${this.addr}:${this.port}`; }
  get url() { return `ws://${this.host}` }

  setup(destination, onPackages) {
    this.host = destination;
    this.onPackages = onPackages;
  }

  connect(onsuccess=null, onfailed=null) {
    if (!this.addr) {
      this.connected = this.connecting = false;
      onfailed();
      return;
    }
    
    if (this.connected) {
      onsuccess();
      return;
    }
    
    this.connecting = true;
    this.connected = false;

    this.sock = new WebSocket(this.url);
    this.sock.addEventListener("open", (e) => this.onopen(e));
    this.sock.addEventListener("message", (e) => this.onmessage(e));
    this.sock.addEventListener("error", (e) => this.onerror(e));
    this.sock.addEventListener("close", (e) => this.onclose(e));

    if (onsuccess) this.sock.onopen = onsuccess;
    if (onfailed) this.sock.onerror = onfailed;
  }

  send(packages) {
    if (this.connected) {
      this.sock.send(packages);
    } else {
      this.connect(() => {
        this.sock.send(packages);
      });
    }
  }

  onopen(e) {
    this.connecting = false;
    this.connected = true;
  }
  onmessage(e) {
    this.onPackages(e.data);
  }
  onerror(e) {
    this.connected = this.connecting = false;
  }
  onclose(e) {
    this.connected = this.connecting = false;
  }
}