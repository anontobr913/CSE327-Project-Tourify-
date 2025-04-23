export default class PickupDecorator {
  constructor(pkg) {
    this.pkg = pkg;
  }

  getDescription() {
    return this.pkg.getDescription() + " + 🚗 Airport Pickup";
  }

  getCost() {
    return this.pkg.getCost() + 50;
  }
}
