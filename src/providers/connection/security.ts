
import { Md5 } from 'ts-md5/dist/md5';

export class Security {
  constructor() {
  }

  public encodeSecurityCode(securityCode: string) {
    return securityCode ? Md5.hashStr(securityCode).toString() : '';
  }
}