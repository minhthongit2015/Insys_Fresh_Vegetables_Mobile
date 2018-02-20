

export class PlantLib {
  public type: string;
  public name: string;
  public harvestTime?: number;
  public lifeSpan?: number;

  constructor(type: string, name: string, harvestTime: number=0, lifeSpan: number=0) {
    this.type = type;
    this.name = name;
    this.harvestTime = harvestTime;
    this.lifeSpan = lifeSpan;
  }
}

export let listPlantLib: PlantLib[] = [
  new PlantLib("aubergine", "Cà Tím", 90, 0),
  new PlantLib("pea", "Đậu Cô Ve", 40, 0),
  new PlantLib("carrot", "Cà Rốt", 120, 0),
  new PlantLib("chili", "Ớt", 120, 0),
  new PlantLib("lettuce", "Xà Lách", 60, 0),
  new PlantLib("onion", "Hành Tây", 120, 0),
  new PlantLib("tomato", "Cà Chua", 120, 0),
  new PlantLib("red_cabbage", "Bắp Cải Tím", 60, 0),
  new PlantLib("spinach", "Rau Dền", 45, 0),
  new PlantLib("potato", "Khoai Tây", 120, 0),
  new PlantLib("broccoli", "Bông Cải", 60, 0),
]