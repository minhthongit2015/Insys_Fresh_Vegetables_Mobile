import { Injectable } from '@angular/core';

import { Item } from '../../models/item';
import { API } from '../api/api';

@Injectable()
export class Items {

  constructor(public api: API) { }

  query(params?: any) {
    // return this.api.get('/items', params);
  }

  add(item: Item) {
  }

  delete(item: Item) {
  }

}
