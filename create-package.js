import {
  FlightService,
  HotelService,
  TourService,
  TravelPackage,
  TravelPackageFactory
} from './factories.js';

import decoratePackage from './decorators/decoratePackage.js';
import { StripeAdapter, BkashAdapter } from './PaymentAdapter.js'; // ✅ Adapter Pattern

let selectedFlight = null;
let selectedHotel = null;
let selectedTour = null;

// FLIGHT SEARC
document.getElementById('searchFlightBtn').addEventListener('click', async () => {
  const from = document.getElementById('flightFrom').value;
  const to = document.getElementById('flightTo').value;
  const departureDate = document.getElementById('flightDeparture').value;
  const returnDate = document.getElementById('flightReturn').value;
  const flightClass = document.getElementById('flightClass').value;
  const travelerCount = parseInt(document.getElementById('travelerCount').value);

  if (!from || !to || !departureDate || !returnDate) {
    alert('Please fill in all required fields including return date!');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/search-flights?from=${from}&to=${to}&departureDate=${departureDate}&returnDate=${returnDate}&flightClass=${flightClass}&travelerCount=${travelerCount}`);
    const flightResults = await response.json();
    const flightResultsDiv = document.getElementById('flightResults');
    flightResultsDiv.innerHTML = '';

    if (Array.isArray(flightResults)) {
      flightResults.forEach(flight => {
        const flightOption = document.createElement('div');
        flightOption.textContent = `${flight.flight_name} (${flight.from_city} to ${flight.to_city}) - Departure: ${flight.departure_date} - Return: ${flight.return_date} - $${flight.price}`;
        flightOption.classList.add('option');

        flightOption.addEventListener('click', () => {
          selectedFlight = { ...flight, travelerCount };
          toggleCreateButton();
          alert(`You selected: ${flightOption.textContent}`);
        });

        flightResultsDiv.appendChild(flightOption);
      });
    } else {
      alert(flightResults.message || "No flights found.");
    }
  } catch (error) {
    console.error('Error fetching flight data:', error);
    alert('There was an error fetching flight data.');
  }
});

// HOTEL SEARCH 
document.getElementById('searchHotelBtn').addEventListener('click', async () => {
  const hotelLocation = document.getElementById('hotelLocation').value;
  const checkInDate = document.getElementById('checkInDate').value;
  const checkOutDate = document.getElementById('checkOutDate').value;
  const hotelGuests = document.getElementById('hotelGuests').value;

  if (!hotelLocation || !checkInDate || !checkOutDate) {
    alert('Please fill in all required fields!');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/search-hotels?location=${hotelLocation}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&guests=${hotelGuests}`);
    const hotelResults = await response.json();
    const hotelResultsDiv = document.getElementById('hotelResults');
    hotelResultsDiv.innerHTML = '';

    if (Array.isArray(hotelResults)) {
      hotelResults.forEach(hotel => {
        const hotelOption = document.createElement('div');
        hotelOption.textContent = `${hotel.name} in ${hotel.location} - Price: $${hotel.price} per night`;
        hotelOption.classList.add('option');

        hotelOption.addEventListener('click', () => {
          selectedHotel = hotel;
          toggleCreateButton();
          alert(`You selected: ${hotelOption.textContent}`);
        });

        hotelResultsDiv.appendChild(hotelOption);
      });
    } else {
      alert(hotelResults.message || "No hotels found.");
    }
  } catch (error) {
    console.error('Error fetching hotel data:', error);
    alert('There was an error fetching hotel data.');
  }
});

// TOUR SEARCH 
document.getElementById('searchTourBtn').addEventListener('click', async () => {
  const tourLocation = document.getElementById('tourLocation').value;
  const tourDate = document.getElementById('tourDate').value;
  const tourGuests = document.getElementById('tourGuests').value;

  if (!tourLocation || !tourDate || !tourGuests) {
    alert('Please fill in all required fields for the tour!');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/search-tours?location=${tourLocation}&date=${tourDate}`);
    const tourResults = await response.json();
    const tourResultsDiv = document.getElementById('tourResults');
    tourResultsDiv.innerHTML = '';

    if (Array.isArray(tourResults)) {
      tourResults.forEach(tour => {
        const totalCost = parseFloat(tour.price_per_person) * parseInt(tourGuests);

        const tourOption = document.createElement('div');
        tourOption.textContent = `${tour.name} in ${tour.location} - $${tour.price_per_person} per person, Total: $${totalCost}`;
        tourOption.classList.add('option');

        tourOption.addEventListener('click', () => {
          selectedTour = {
            ...tour,
            guests: parseInt(tourGuests),
            totalCost
          };
          toggleCreateButton();
          alert(`You selected: ${tourOption.textContent}`);
        });

        tourResultsDiv.appendChild(tourOption);
      });
    } else {
      alert(tourResults.message || "No tours found.");
    }
  } catch (error) {
    console.error('Error fetching tour data:', error);
    alert('There was an error fetching tour data.');
  }
});

function toggleCreateButton() {
  const createButton = document.getElementById('createPackageBtn');
  createButton.disabled = !(selectedFlight && selectedHotel && selectedTour);
}

// create custom package 
document.getElementById('createPackageBtn').addEventListener('click', () => {
  if (selectedFlight && selectedHotel && selectedTour) {
    const factory = new TravelPackageFactory();
    const customPackage = factory.createPackage(selectedFlight, selectedHotel, selectedTour);

    const flightCost = parseFloat(selectedFlight.price || 0) * (parseInt(selectedFlight.travelerCount || 1) || 1);
    const nights = (new Date(selectedHotel.check_out_date) - new Date(selectedHotel.check_in_date)) / (1000 * 60 * 60 * 24) || 1;
    const hotelCost = parseFloat(selectedHotel.price || 0) * nights;
    const tourCost = parseFloat(selectedTour.totalCost || 0);

    const baseCost = parseFloat(flightCost) + parseFloat(hotelCost) + parseFloat(tourCost);
    const baseDesc = `${selectedFlight.flight_name}, ${selectedHotel.name}, ${selectedTour.name}`;

    const message = `
      <strong>Flight:</strong> ${selectedFlight.flight_name}<br>
      <strong>Route:</strong> ${selectedFlight.from_city} to ${selectedFlight.to_city}<br>
      <strong>Departure:</strong> ${selectedFlight.departure_date}<br>
      <strong>Return:</strong> ${selectedFlight.return_date}<br>
      <strong>Passengers:</strong> ${selectedFlight.travelerCount}<br><br>

      <strong>Hotel:</strong> ${selectedHotel.name}<br>
      <strong>Tour:</strong> ${selectedTour.name} (${selectedTour.guests} guests)<br><br>

      <label><input type="checkbox" id="addonInsurance"> 🛡 Insurance (+$100)</label><br>
      <label><input type="checkbox" id="addonMeal"> 🍽 Meal Plan (+$80)</label><br>
      <label><input type="checkbox" id="addonPickup"> 🚗 Pickup (+$50)</label><br><br>

      <label><strong>Payment Method:</strong></label>
      <select id="paymentMethod">
        <option value="stripe">Stripe</option>
        <option value="bkash">bKash</option>
      </select><br><br>

      <strong>Total Price:</strong> $<span id="totalPriceValue">${baseCost.toFixed(2)}</span><br><br>
    `;

    const modal = document.getElementById('packageModal');
    const detailsParagraph = document.getElementById('packageDetails');
    detailsParagraph.innerHTML = message;
    modal.classList.remove('hidden');

    document.getElementById('closeModal').addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    ['addonInsurance', 'addonMeal', 'addonPickup'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => {
        const addons = {
          insurance: document.getElementById('addonInsurance').checked,
          meal: document.getElementById('addonMeal').checked,
          pickup: document.getElementById('addonPickup').checked
        };
        const updated = decoratePackage(baseCost, baseDesc, addons);
        const priceSpan = document.getElementById('totalPriceValue');
        if (priceSpan) {
          priceSpan.textContent = updated.cost.toFixed(2);
        }
      });
    });

    document.getElementById('savePackageBtn').onclick = () => {
      fetch('http://localhost:3001/save-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flight: selectedFlight, hotel: selectedHotel, tour: selectedTour })
      })
        .then(res => res.json())
        .then(data => alert(data.message))
        .catch(err => {
          console.error('Error saving package:', err);
          alert('Failed to save package.');
        });
    };

    // BOOK NOW (with Adapter Pattern)
    document.getElementById('bookNowBtn').onclick = () => {
      const customerEmail = document.getElementById('customerEmail')?.value;
      if (!customerEmail || !customerEmail.includes('@')) {
        alert('❗ Please enter a valid email before booking.');
        return;
      }

      const addons = {
        insurance: document.getElementById('addonInsurance').checked,
        meal: document.getElementById('addonMeal').checked,
        pickup: document.getElementById('addonPickup').checked
      };

      const decorated = decoratePackage(Number(flightCost + hotelCost + tourCost), baseDesc, addons);

      //  Use Adapter Pattern for Payment
      const method = document.getElementById('paymentMethod').value;
      let paymentAdapter;

      if (method === 'stripe') {
        paymentAdapter = new StripeAdapter();
      } else {
        paymentAdapter = new BkashAdapter();
      }

      paymentAdapter.pay(Number(decorated.cost.toFixed(2)), decorated.description);


      // Proceed with backend booking
      fetch('http://localhost:3001/book-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight: selectedFlight,
          hotel: selectedHotel,
          tour: selectedTour,
          customer_email: customerEmail,
          total_price: Number(decorated.cost.toFixed(2)),
          description: decorated.description
        })
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          modal.classList.add('hidden');
        })
        .catch(err => {
          console.error('Error booking package:', err);
          alert('❌ Booking failed.');
        });
    };
  }
});
