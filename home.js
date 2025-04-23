// Tourify strategy and adapter

import { StripeAdapter, BkashAdapter } from './PaymentAdapter.js';

class SortStrategy {
  execute(a, b) {
    throw new Error("execute() must be implemented");
  }S
}

class PriceAscStrategy extends SortStrategy {
  execute(a, b) {
    return a.price - b.price;
  }
}

class PriceDescStrategy extends SortStrategy {
  execute(a, b) {
    return b.price - a.price;
  }
}

class NameStrategy extends SortStrategy {
  execute(a, b) {
    const nameA = a.name || a.flight_name;
    const nameB = b.name || b.flight_name;
    return nameA.localeCompare(nameB);
  }
}

class SortContext {
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  sort(data) {
    return data.sort((a, b) => this.strategy.execute(a, b));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const bodies = document.querySelectorAll(".tab-body");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      bodies.forEach(b => b.classList.remove("active"));

      tab.classList.add("active");
      const targetId = tab.getAttribute("data-tab");
      const targetBody = document.getElementById(targetId);
      if (targetBody) {
        targetBody.classList.add("active");
      }
    });
  });

  const sortMap = {
    'price-asc': new PriceAscStrategy(),
    'price-desc': new PriceDescStrategy(),
    'name': new NameStrategy()
  };

  const sortContext = new SortContext();

  const flightSearchBtn = document.getElementById('flightSearchBtn');
  if (flightSearchBtn) {
    flightSearchBtn.addEventListener('click', async () => {
      const sortKey = document.getElementById('sortFlights')?.value || '';
      const from = document.getElementById('flightFrom')?.value || '';
      const to = document.getElementById('flightTo')?.value || '';
      const departureDate = document.getElementById('flightDeparture')?.value || '';
      const returnDate = document.getElementById('flightReturn')?.value || '';
      const travelerCount = document.getElementById('flightPerson')?.value || '1';

      if (!from || !to || !departureDate || !returnDate) {
        document.getElementById('flightResults').innerHTML = '<p style="color:red;">❌ Please fill all flight fields.</p>';
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/search-flights?from=${from}&to=${to}&departureDate=${departureDate}&returnDate=${returnDate}&travelerCount=${travelerCount}`);
        let flights = await response.json();

        if (sortMap[sortKey]) {
          sortContext.setStrategy(sortMap[sortKey]);
          flights = sortContext.sort(flights);
        }

        renderFlights(flights);
      } catch (error) {
        console.error('Error fetching flight data:', error);
        document.getElementById('flightResults').innerHTML = `<p style="color:red;">❌ Failed to fetch flight data.</p>`;
      }
    });
  }

  function renderFlights(flights) {
    const resultDiv = document.getElementById('flightResults');
    const template = document.getElementById('flightCardTemplate');
    resultDiv.innerHTML = '';

    if (!flights.length) {
      resultDiv.innerHTML = '<p style="color:red;">No flights found matching your criteria.</p>';
      return;
    }

    flights.forEach(f => {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector(".result-card");
      card.querySelector('.flight-name').textContent = f.flight_name;
      card.querySelector('.route').textContent = `From: ${f.from_city} → ${f.to_city}`;
      card.querySelector('.departure').textContent = `Departure: ${new Date(f.departure_date).toLocaleDateString()}`;
      card.querySelector('.return').textContent = `Return: ${new Date(f.return_date).toLocaleDateString()}`;
      card.querySelector('.flight-class').textContent = `Class: ${f.class}`;
      card.querySelector('.price').textContent = `Price: $${f.price}`;

      const bookBtn = card.querySelector('.bookBtn');
      const paymentSelect = card.querySelector('.payment-method');
      if (bookBtn && paymentSelect) {
        bookBtn.addEventListener('click', () => {
          const method = paymentSelect.value;
          const adapter = method === 'bkash' ? new BkashAdapter() : new StripeAdapter();
          const confirmation = adapter.pay(f.price, `${f.flight_name} (${f.from_city} → ${f.to_city})`);

          const msg = document.createElement('div');
          msg.className = 'payment-confirmation';
          msg.style.marginTop = '10px';
          msg.style.padding = '8px';
          msg.style.backgroundColor = '#e0ffe0';
          msg.style.border = '1px solid green';
          msg.style.color = 'black';
          msg.textContent = confirmation;

          card.querySelectorAll('.payment-confirmation').forEach(el => el.remove());
          card.appendChild(msg);
        });
      }

      resultDiv.appendChild(clone);
    });
  }

  // ✅ Hotels
  const hotelSearchBtn = document.getElementById('hotelSearchBtn');
  if (hotelSearchBtn) {
    hotelSearchBtn.addEventListener('click', async () => {
      const location = document.getElementById('hotelLocation')?.value || '';
      const checkIn = document.getElementById('hotelCheckin')?.value || '';
      const checkOut = document.getElementById('hotelCheckout')?.value || '';
      const guests = document.getElementById('hotelMembers')?.value || '1';
      const sortKey = document.getElementById('sortHotels')?.value || '';

      if (!location || !checkIn || !checkOut) {
        document.getElementById('hotelResults').innerHTML = '<p style="color:red;">❌ Please fill all hotel fields.</p>';
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/search-hotels?location=${location}&checkInDate=${checkIn}&checkOutDate=${checkOut}&guests=${guests}`);
        let hotels = await response.json();

        if (sortMap[sortKey]) {
          sortContext.setStrategy(sortMap[sortKey]);
          hotels = sortContext.sort(hotels);
        }

        renderHotels(hotels);
      } catch (error) {
        console.error('Error fetching hotel data:', error);
        documenty.getElementById('hotelResults').innerHTML = `<p style="color:red;">❌ Failed to fetch hotel data.</p>`;
      }
    });
  }

  function renderHotels(hotels) {
    const resultDiv = document.getElementById('hotelResults');
    const template = document.getElementById('hotelCardTemplate');
    resultDiv.innerHTML = '';
  
    if (!hotels.length) {
      resultDiv.innerHTML = '<p style="color:red;">No hotels found matching your criteria.</p>';
      return;
    }
  
    hotels.forEach(h => {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector(".result-card");
      card.querySelector('.hotel-name').textContent = h.name;
      card.querySelector('.location').textContent = `Location: ${h.location}`;
      card.querySelector('.date-range').textContent = `Check-in: ${new Date(h.check_in_date).toLocaleDateString()} → Check-out: ${new Date(h.check_out_date).toLocaleDateString()}`;
      card.querySelector('.guests').textContent = `Guests: ${h.guests || 'N/A'}`;
      card.querySelector('.price').textContent = `Price per night: $${h.price}`;
  
      const bookBtn = card.querySelector('.bookBtn');
      const paymentSelect = card.querySelector('.payment-method');
      if (bookBtn && paymentSelect) {
        bookBtn.addEventListener('click', () => {
          const method = paymentSelect.value;
          const adapter = method === 'bkash' ? new BkashAdapter() : new StripeAdapter();
          const confirmation = adapter.pay(h.price, `${h.name} (${h.location})`);
  
          const msg = document.createElement('div');
          msg.className = 'payment-confirmation';
          msg.style.marginTop = '10px';
          msg.style.padding = '8px';
          msg.style.backgroundColor = '#e0ffe0';
          msg.style.border = '1px solid green';
          msg.style.color = 'black';
          msg.textContent = confirmation;
  
          card.querySelectorAll('.payment-confirmation').forEach(el => el.remove());
          card.appendChild(msg);
        });
      }
  
      resultDiv.appendChild(clone);
    });
  }
  

  // ✅ Tours
  const tourSearchBtn = document.getElementById('tourSearchBtn');
  if (tourSearchBtn) {
    tourSearchBtn.addEventListener('click', async () => {
      const location = document.getElementById('tourLocation')?.value || '';
      const date = document.getElementById('tourDate')?.value || '';
      const guests = parseInt(document.getElementById('tourGuests')?.value || '1');
      const sortKey = document.getElementById('sortTours')?.value || '';

      if (!location || !date) {
        document.getElementById('tourResults').innerHTML = '<p style="color:red;">❌ Please fill all tour fields.</p>';
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/search-tours?location=${location}&date=${date}`);
        let tours = await response.json();

        if (sortMap[sortKey]) {
          sortContext.setStrategy(sortMap[sortKey]);
          tours = sortContext.sort(tours);
        }

        renderTours(tours, guests);
      } catch (error) {
        console.error('Error fetching tour data:', error);
        document.getElementById('tourResults').innerHTML = `<p style="color:red;">❌ Failed to fetch tour data.</p>`;
      }
    });
  }

  function renderTours(tours, guestCount = 1) {
    const resultDiv = document.getElementById('tourResults');
    const template = document.getElementById('tourCardTemplate');
    resultDiv.innerHTML = '';
  
    if (!tours.length) {
      resultDiv.innerHTML = '<p style="color:red;">No tours found matching your criteria.</p>';
      return;
    }
  
    tours.forEach(t => {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector(".result-card");
      card.querySelector('.tour-name').textContent = t.name;
      card.querySelector('.location').textContent = `Location: ${t.location}`;
      card.querySelector('.tour-date').textContent = `Tour Date: ${new Date(t.tour_date).toLocaleDateString()}`;
      card.querySelector('.persons').textContent = `For: ${guestCount} Persons`;
      card.querySelector('.price').textContent = `Price per person: $${t.price_per_person}`;
  
      const bookBtn = card.querySelector('.bookBtn');
      const paymentSelect = card.querySelector('.payment-method');
      if (bookBtn && paymentSelect) {
        bookBtn.addEventListener('click', () => {
          const method = paymentSelect.value;
          const adapter = method === 'bkash' ? new BkashAdapter() : new StripeAdapter();
          const totalPrice = t.price_per_person * guestCount;
          const confirmation = adapter.pay(totalPrice, `${t.name} (${t.location}) for ${guestCount} persons`);
  
          const msg = document.createElement('div');
          msg.className = 'payment-confirmation';
          msg.style.marginTop = '10px';
          msg.style.padding = '8px';
          msg.style.backgroundColor = '#e0ffe0';
          msg.style.border = '1px solid green';
          msg.style.color = 'black';
          msg.textContent = confirmation;
  
          card.querySelectorAll('.payment-confirmation').forEach(el => el.remove());
          card.appendChild(msg);
        });
      }
  
      resultDiv.appendChild(clone);
    });
  }
  
});

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });
});
