// adapters

class StripePaymentAPI {
    chargeCard(amount, description) {
      return `✅ Paid $${amount} via Stripe for: ${description}`;
    }
  }
  
  class BkashPaymentAPI {
    sendMoney(amount, description) {
      return `✅ Paid $${amount} via bKash for: ${description}`;
    }
  }
  
  class PaymentProcessor {
    pay(amount, description) {
      throw new Error("pay() must be implemented");
    }
  }
  
  class StripeAdapter extends PaymentProcessor {
    constructor() {
      super();
      this.stripe = new StripePaymentAPI();
    }
  
    pay(amount, description) {
      return this.stripe.chargeCard(amount, description);
    }
  }
  
  class BkashAdapter extends PaymentProcessor {
    constructor() {
      super();
      this.bkash = new BkashPaymentAPI();
    }
  
    pay(amount, description) {
      return this.bkash.sendMoney(amount, description);
    }
  }
  
  export { StripeAdapter, BkashAdapter };
  