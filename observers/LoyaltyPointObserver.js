class LoyaltyPointObserver {
    update(data) {
      const points = Math.floor(data.total_price / 10); // 1 point per 10 BDT
      console.log(`[Loyalty] 🪙 ${points} points added to ${data.customer_email}'s account`);
    }
  }
  
  module.exports = LoyaltyPointObserver;
  