

export class DynamicAddress {
  public ip: string;
  public port: number;
  constructor(ip, port) {
    this.ip = ip;
    this.port = port;
  }
}

export class Package {
  public cmd: any;
  public sub1: any;
  public sub2: any;
  get headers() { return String.fromCharCode(...[this.cmd, this.sub1, this.sub2]) }
  public msg: string;
  public code: number;

  constructor(header, msg) {
    this.cmd = header.charCodeAt(0);
    this.sub1 = header.charCodeAt(1);
    this.sub2 = header.charCodeAt(2);
    this.msg = msg;
  }
}

export class SmartGardenProtocol {
  public pkgcfg: any;

  constructor() {
    this.pkgcfg = {start: '\xfd', delim: '\xfe', end: '\xff', def: '\xf4'}
  }

  public unpack(msg) {
    let pack, header, data;
    let rest: string = "";
    let packages = [];

    do {
      let iEnd = msg.indexOf(this.pkgcfg.end);
      pack = msg.substr(1, iEnd - 1);
      rest = msg.substr(iEnd + this.pkgcfg.end.length);
  
      // Header_D_Data
      pack = pack.split(this.pkgcfg.delim);
      header = pack[0];
      data = pack[1];

      packages.push(new Package(header, data));
    } while (rest);

    return packages;
  }

  public pack(cmds, msg, accessCode='') {
    let headers = this.buildHeader(cmds);
    let packagez = `${this.pkgcfg.start}${accessCode}${this.pkgcfg.delim}${headers}${this.pkgcfg.delim}${msg}${this.pkgcfg.end}`;
    return packagez;
  }
  
  public buildHeader(cmds) {
    if (!cmds.length) cmds = [cmds];
    if (cmds.length == 1) cmds.push(this.pkgcfg.def);
    if (cmds.length == 2) cmds.push(this.pkgcfg.def);
    return String.fromCharCode(...cmds);
  }
}