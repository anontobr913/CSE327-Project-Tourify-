export default class TravelPackage {
  constructor(baseCost = 0, description = "Base Travel Package (Flight + Hotel + Tour)") {
    this.baseCost = baseCost;
    this.description = description;
  }

  getDescription() {
    return this.description;
  }

  getCost() {
    return this.baseCost;
  }
}
