class BookingSubject {
    constructor() {
      this.observers = [];
    }
  
    addObserver(observer) {
      this.observers.push(observer);
    }
  
    notifyObservers(data) {
      console.log(`🔔 Notifying ${this.observers.length} observers...`);
      this.observers.forEach(observer => observer.update(data));
    }
  }
  
  module.exports = BookingSubject;
  