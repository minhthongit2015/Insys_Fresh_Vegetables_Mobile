import { StationModel } from "./station";
import { EquipmentModel } from "./equipment";
import { UserPlantModel } from "./user_plant";
import { SmartGardenWebSocket } from "../../providers/connection/smwebsocket";


export class Garden {
  public portal: string = "192.168.244.1:80";
  public server: string = "";
  public serverSock: SmartGardenWebSocket;

  public name: string = '';
  public host: string = '';            // using in LAN connect (ipv4:port)
  public domain: string = '';          // using in API connect
  public ssid: string = '';
  public wifipass: string = '';

  public securityCode: string = '';   // Security code to protect the garden
  public accessToken: string = '';    // token to access the garden central unit

  public stations: StationModel[] = [];
  public equipments: EquipmentModel[] = [];
  public userPlants: UserPlantModel[] = [];

  public get unusedPlants() {
    return this.userPlants.filter(plant => !plant.location)
  }

  constructor(dict: any = null) {
    dict = dict || {name: "", host: "", domain: "", securityCode: "", accessToken: ""};
    this.name = dict.name;
    this.host = dict.host;
    this.domain = dict.domain;
    this.securityCode = dict.securityCode;
    this.accessToken = dict.accessToken;

    this.serverSock = new SmartGardenWebSocket();
  }

  public attachGardenInfo(gardenInfo) {
    this.stations = this.stations.filter(station => gardenInfo.stations.find(sta => sta.id == station.id));

    for (let station of gardenInfo.stations) {
      let find = this.stations.find(sta => sta.id == station.id);
      if (find) find.update(station);
      else this.stations.push(new StationModel(station));
    }
  }

}
