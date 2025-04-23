import TravelPackage from './TravelPackage.js';
import InsuranceDecorator from './InsuranceDecorator.js';
import MealPlanDecorator from './MealPlanDecorator.js';
import PickupDecorator from './PickupDecorator.js';

// Formal decorator function to wrap add-ons
export default function decoratePackage(baseCost, baseDescription, addons = {}) {
  let pkg = new TravelPackage(baseCost, baseDescription);

  if (addons.insurance) pkg = new InsuranceDecorator(pkg);
  if (addons.meal) pkg = new MealPlanDecorator(pkg);
  if (addons.pickup) pkg = new PickupDecorator(pkg);

  return {
    description: pkg.getDescription(),
    cost: pkg.getCost()
  };
}