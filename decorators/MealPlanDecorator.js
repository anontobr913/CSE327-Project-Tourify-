export default class MealPlanDecorator {
  constructor(pkg) {
    this.pkg = pkg;
  }

  getDescription() {
    return this.pkg.getDescription() + " + 🍽 Meal Plan";
  }

  getCost() {
    return this.pkg.getCost() + 80;
  }
}
