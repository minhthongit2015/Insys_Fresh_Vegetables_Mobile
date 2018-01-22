

export class WebsocketHandle {
  private addr: string;
  private port: string;
  private sock: WebSocket;

  constructor(host) {
    this.addr = host.split(":")[0];
    this.port = host.split(":")[1];
  }

  get host() { return `${this.addr}:${this.port}`; }
  get url() { return `ws://${this.host}` }

  connect(url) {
    if (!url) url = this.url;
    this.sock = new WebSocket(url);
    this.sock.onopen = this.onopen;
    this.sock.onmessage = this.onmessage;
    this.sock.onerror = this.onerror;
  }

  onopen(e) {
  }
  onmessage(e) {
  }
  onerror(e) {
    
  }
}