export default class InsuranceDecorator {
  constructor(pkg) {
    this.pkg = pkg;
  }

  getDescription() {
    return this.pkg.getDescription() + " + 🛡 Insurance";
  }

  getCost() {
    return this.pkg.getCost() + 100;
  }
}
