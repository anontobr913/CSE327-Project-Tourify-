// factory class

class FlightService {
  constructor(name, price) {
    this.name = name;
    this.price = Number(price) >= 0 ? Number(price) : 0;
  }
}

class HotelService {
  constructor(name, nights, pricePerNight) {
    this.name = name;
    this.nights = Math.max(1, parseInt(nights));
    this.price = this.nights * (Number(pricePerNight) || 0);
  }
}

class TourService {
  constructor(name, price) {
    this.name = name;
    this.price = Number(price) >= 0 ? Number(price) : 0;
  }
}

class TravelPackage {
  constructor(name) {
    this.name = name;
    this.services = [];
  }

  addService(service) {
    this.services.push(service);
  }

  getDescription() {
    return `${this.name} includes: ${this.services.map(s => s.name).join(", ")}`;
  }

  getTotalPrice() {
    return this.services.reduce((total, s) => total + s.price, 0);
  }
}

class TravelPackageFactory {
  createPackage(flight, hotel, tour) {
    if (!flight || !hotel || !tour) {
      throw new Error("Missing flight, hotel, or tour data");
    }

    const numberOfPassengers = parseInt(flight.travelerCount) || 1;
    const numberOfNights = this._calculateNights(hotel.check_in_date, hotel.check_out_date);
    const numberOfGuests = parseInt(tour.guests) || 1;

    const flightService = new FlightService(flight.flight_name, flight.price * numberOfPassengers);
    const hotelService = new HotelService(hotel.name, numberOfNights, hotel.price);
    const tourService = new TourService(tour.name, tour.price_per_person * numberOfGuests);

    const travelPackage = new TravelPackage("Custom Trip Package");
    travelPackage.addService(flightService);
    travelPackage.addService(hotelService);
    travelPackage.addService(tourService);

    return travelPackage;
  }

  _calculateNights(checkIn, checkOut) {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diffTime = outDate - inDate;
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }
}



export {
  FlightService,
  HotelService,
  TourService,
  TravelPackage,
  TravelPackageFactory
};
