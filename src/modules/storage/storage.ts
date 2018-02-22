
// Usage: storage.apply(localStorage|sessionStorage, ...args)
export function storage(key: string, value: any, remove=false) {
  if (remove) return this.removeItem(key);
  return this[value==null?"getItem":"setItem"](key, value);
}
// Usage: storageJSON.apply(localStorage|sessionStorage, ...args)
export function storageJSON(key: string, value: any, remove=false) {
  if (remove) return this.removeItem(key);
  let rs = this[value==null?"getItem":"setItem"](key, value!=null?JSON.stringify(value):null);
  return rs?JSON.parse(rs):rs;
}

export class Database {
  [key: string]: any;

  dbname: string;
  namespace_history: any[];
  namespaces: string[];
  namespace: string;
  dbStorage: Storage;

  constructor(dbname: any, storage = localStorage, createNew = false) {
    this.dbStorage = storage;
    if (createNew)
      for (let key in localStorage)
        if (key.indexOf(dbname) == 0) localStorage.removeItem(key);
    this.dbname = dbname;
    this.namespace = "";
    if (this.storageJSON(this.getpath("namespaces"))) this.createTable("namespaces");
    else this.namespaces = [];
    this.namespace_history = [];
  }
  storageJSON(...args: any[]) { return storageJSON.apply(this.dbStorage, args); }
  storage(...args: any[]) { return storage.apply(this.dbStorage, args); }

  storeNamespace(namespace: string) {
    if (this.namespaces.indexOf(namespace) >= 0) {
      this.namespaces.push(namespace);
      this.storageJSON(this.getpath("namespaces"), this.namespaces);
    }
  }
  changeNamespace(namespace: any) {
    if (namespace) this.storeNamespace(namespace);
    this.namespace_history.push(this.namespace);
    this.namespace = namespace;
    return true;
  }
  restoreNamespace() {
    this.namespace = this.namespace_history.pop() || "";
  }
  clearAllUnderNamespace(namespace: string) {
    if (namespace && namespace.length > 0) {
      for (let key in this.dbStorage) {
        if (key.indexOf(this.dbname + "::" + namespace) == 0) this.dbStorage.removeItem(key);
      }
    }
  }
  getpath(tblname: string) { return this.dbname + "::" + this.namespace + "." + tblname }
  createTable(tblname: string) {
    if ( !(this[tblname] = this.storageJSON(this.getpath(tblname))) )
    { this[tblname] = []; this.storageJSON(this.getpath(tblname), this[tblname]); }
    return this[tblname];
  }
  clearCache(tblname: string) {
    for (let key in this)
      if (key.includes(tblname)) delete this[key];
  }

  insert(obj: any, tblname: string, equal?: any) {
    if (obj == null) return;
    if (this[tblname] == null) this.createTable(tblname);
    // Check primary key
    if (equal) {
      let tbl = this.queryTable(tblname);
      for (let r of tbl) if (equal(r, obj)) return false;
    }
    let increment = this[tblname].length > 0 ? (this[tblname][this[tblname].length - 1] + 1) : 0;
    this[tblname].push(increment); this.storageJSON(this.getpath(tblname), this[tblname]);
    this.storageJSON(this.getpath(tblname) + "[" + increment + ']', obj);
    return true;
  }
  insertKey(obj: any, key: string) {
    if (obj == null) return;
    this.storageJSON(this.getpath(key), obj);
  }
  insertWithKey(obj: any, tblname: string, key: string) {
    if (obj == null) return;
    if (this[tblname] == null) this.createTable(tblname);
    if (!this[tblname].includes(key)) { this[tblname].push(key); this.storageJSON(this.getpath(tblname), this[tblname]); }
    this.storageJSON(this.getpath(tblname) + "[" + key + "]", obj);
  }

  delete(tblname: string, where = (record: any) => false) {
    if (this[tblname] == null) this.createTable(tblname);
    for (let i in this[tblname]) {
      if (isNaN(this[tblname][i])) break;
      let recordKey = this.getpath(tblname) + '[' + this[tblname][i] + ']';
      if (where(this.storageJSON(recordKey))) {
        this.storage(recordKey, null, true);
        this[tblname].splice(i, 1); this.storageJSON(this.getpath(tblname), this[tblname]);
      }
    }
  }
  deleteKey(key: string) {
      this.storageJSON(this.getpath(key), null, true);
  }
  deleteWithKey(tblname: string, key: string) {
    if (this[tblname] == null) this.createTable(tblname);
    if (this[tblname].includes(key)) {
      let find = this[tblname].indexOf(key);
      if (find >= 0) {
        this[tblname].splice(find, 1);
        this.storageJSON(this.getpath(tblname), this[tblname]);
      }
      this.storageJSON(this.getpath(tblname) + "[" + key + "]", null, true);
    }
  }
  dropTable(tblname: string) {
    if (this[tblname] == null) this.createTable(tblname);
    for (let id of this[tblname]) this.storage(this.getpath(tblname) + '[' + id + ']', null, true);
    this.storage(this.getpath(tblname), null, true);
    delete this[tblname];
  }

  query(tblname: string, where: any) {
    let records: any[] = [];
    return records;
  }
  queryKey(key: string) {
    return this.storageJSON(this.getpath(key));
  }
  queryWithKey(tblname: string, key: string) {
    return this.storageJSON(this.getpath(tblname) + '[' + key + ']');
  }
  queryTable(tblname: string) {
    let table = [];
    if (this[tblname] == null) this.createTable(tblname);
    for (let key of this[tblname])
      table.push(this.storageJSON(this.getpath(tblname) + '[' + key + ']'));
    return table;
  }
}