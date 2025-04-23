class SMSObserver {
    update(data) {
      console.log(`[SMS] 📱 SMS sent to ${data.customer_email}: Your booking for ${data.flight_name} is confirmed!`);
    }
  }
  
  module.exports = SMSObserver;
  