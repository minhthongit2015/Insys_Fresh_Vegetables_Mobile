
class Account {
  public username: string;
  public password: string;
  public name: string;
  public avatar: string;
}

export class LocalAccount extends Account {
  public garden_password: string;
}

export class OnlineAccount extends Account {

}