class EmailObserver {
    update(data) {
      console.log(`[✅ ${this.constructor.name}] triggered with data:`, data);
      console.log(`[Email] 📧 Confirmation email sent to ${data.customer_email} for ${data.flight_name}`);
    }
  }
  
  module.exports = EmailObserver;
  