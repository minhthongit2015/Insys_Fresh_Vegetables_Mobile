import { Database } from "../storage/storage";

export class UserModule {
  _db: Database;
  
  constructor() {
    this._db = new Database("UserProfile", localStorage);
  }
  getUserToken() : string {
    let curUser = this._db.queryKey("CurUser");
    if (curUser) return curUser["userToken"];
    else return null;
  }

  isLogedIn() : boolean {
    return this._db.queryKey("CurUser") != null;
  }

  logout() : boolean {
    let isLogedIn = this._db.queryKey("CurUser") != null;
    this._db.deleteKey("CurUser");
    return isLogedIn;
  }
}