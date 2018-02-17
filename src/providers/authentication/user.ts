import 'rxjs/add/operator/toPromise';

import { Injectable } from '@angular/core';

import { AlertController } from 'ionic-angular';
import { Database } from '../../modules/storage/storage';

/**
 * Most apps have the concept of a User. This is a simple provider
 * with stubs for login/signup/etc.
 *
 * This User provider makes calls to our API at the `login` and `signup` endpoints.
 *
 * By default, it expects `login` and `signup` to return a JSON object of the shape:
 *
 * ```json
 * {
 *   status: 'success',
 *   user: {
 *     // User fields your app needs, like "id", "name", "email", etc.
 *   }
 * }Ø
 * ```
 *
 * If the `status` field is not `success`, then an error is detected and returned.
 */
@Injectable()
export class User {
  _user: any;
  _authKey: string;
  _db: Database;

  constructor(
    // public api: API,
    public alertCtrl: AlertController) {
      this._db = new Database("UserProfile", localStorage);
      // this.api.setServer('https://insysdemo.azurewebsites.net');
    }

  /**
   * Send a POST request to our login endpoint with the data
   * the user entered on the form.
   */
  login(accountInfo: any) {
    // let pthis = this;
    // let req = this.api.post("/api/user/login", accountInfo, {'Content-Type': 'application/json'});
    // req.observe.subscribe(
    // (rs: any) => {
    //   switch (rs.status) {
    //     case 1:
    //         pthis._user = rs.data
    //         pthis._db.insertKey(rs.data, "CurUser");
    //         break;
    //     default:
    //         let alert = pthis.alertCtrl.create({
    //           title: 'Authentication failed!',
    //           subTitle: rs.message,
    //           buttons: ['OK']
    //         });
    //         alert.present();
    //   }
    // })

    // return req;
  }

  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  signup(accountInfo: any) {
    // let seq = this.api.post('signup', accountInfo).share();

    // seq.subscribe((res: any) => {
    //   // If the API returned a successful response, mark the user as logged in
    //   if (res.status == 'success') {
    //     this._loggedIn(res);
    //   }
    // }, err => {
    //   console.error('ERROR', err);
    // });

    // return seq;
  }

  /**
   * Log the user out, which forgets the session
   */
  logout() {
    this._user = null;
  }

  /**
   * Process a login/signup response to store user data
   */
  _loggedIn(resp) {
    this._user = resp.user;
  }
}
