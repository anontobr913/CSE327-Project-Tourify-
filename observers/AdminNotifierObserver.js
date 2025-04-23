class AdminNotifierObserver {
    update(data) {
      console.log(`[✅ ${this.constructor.name}] triggered with data:`, data);
      
    }
  }
  
  module.exports = AdminNotifierObserver;
  