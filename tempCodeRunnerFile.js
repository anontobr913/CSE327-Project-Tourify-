const express = require('express');
const cors = require('cors');
const Database = require('./Database'); // Singleton DB connection

// === Observer Pattern ===
const BookingSubject = require('./observers/BookingSubject');
const AdminNotifierObserver = require('./observers/AdminNotifierObserver');
const EmailObserver = require('./observers/EmailObserver');
const LoyaltyPointObserver = require('./observers/LoyaltyPointObserver');
const SMSObserver = require('./observers/SMSObserver');
const InvoiceGeneratorObserver = require('./observers/InvoiceGeneratorObserver');

// === Initialize Observer System ===
const bookingSubject = new BookingSubject();
bookingSubject.addObserver(new AdminNotifierObserver());
bookingSubject.addObserver(new EmailObserver());
bookingSubject.addObserver(new LoyaltyPointObserver());
bookingSubject.addObserver(new SMSObserver());
bookingSubject.addObserver(new InvoiceGeneratorObserver());

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  methods: ['GET', 'POST'],
}));

const db = Database.getInstance().getConnection(); // Use Singleton DB

// =================== FLIGHT SEARCH ===================
app.get('/search-flights', (req, res) => {
  const { from, to, departureDate, returnDate } = req.query;

  if (!from || !to || !departureDate || !returnDate) {
    return res.status(400).json({ error: 'Missing required flight parameters.' });
  }

  const query = `
    SELECT 
      id, flight_name, from_city, to_city,
      departure_date, return_date, class, price,
      available_seats, created_at, rating
    FROM flights
    WHERE from_city = ? AND to_city = ? AND departure_date = ? AND return_date = ?
  `;

  db.query(query, [from, to, departureDate, returnDate], (err, results) => {
    if (err) {
      console.error('Flight fetch error:', err.message);
      return res.status(500).json({ error: 'Flight query failed.' });
    }
    res.json(results);
  });
});

// =================== HOTEL SEARCH ===================
app.get('/search-hotels', (req, res) => {
  const { location, checkInDate, checkOutDate } = req.query;

  if (!location || !checkInDate || !checkOutDate) {
    return res.status(400).json({ error: 'Missing hotel parameters.' });
  }

  const query = `
    SELECT * FROM hotels
    WHERE location = ? AND check_in_date <= ? AND check_out_date >= ?
  `;

  db.query(query, [location, checkInDate, checkOutDate], (err, results) => {
    if (err) {
      console.error('Hotel fetch error:', err.message);
      return res.status(500).json({ error: 'Hotel query failed.' });
    }
    res.json(results);
  });
});

// =================== TOUR SEARCH ===================
app.get('/search-tours', (req, res) => {
  const { location, date } = req.query;

  if (!location || !date) {
    return res.status(400).json({ error: 'Missing tour parameters.' });
  }

  const query = `
    SELECT * FROM tours
    WHERE location = ? AND tour_date = ?
  `;

  db.query(query, [location, date], (err, results) => {
    if (err) {
      console.error('Tour fetch error:', err.message);
      return res.status(500).json({ error: 'Tour query failed.' });
    }
    res.json(results);
  });
});

// =================== PACKAGE CREATION ===================
app.post('/create-package', (req, res) => {
  const { flight, hotel, tour } = req.body;

  console.log("📦 Received Package:", {
    flight_name: flight.flight_name,
    from: flight.from_city,
    to: flight.to_city,
    departure: flight.departure_date,
    return: flight.return_date,
    hotel: hotel.name,
    tour: tour.name,
    total: flight.price + hotel.price + tour.totalCost,
  });

  res.json({ message: 'Package created successfully' });
});

// =================== SAVE PACKAGE ===================
app.post('/save-package', (req, res) => {
  const { flight, hotel, tour } = req.body;
  const total = flight.price + hotel.price + tour.totalCost;

  const sql = `
    INSERT INTO saved_packages (
      flight_name, from_city, to_city, departure_date, return_date,
      hotel_name, tour_name, total_price
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    flight.flight_name,
    flight.from_city,
    flight.to_city,
    flight.departure_date,
    flight.return_date,
    hotel.name,
    tour.name,
    total
  ], (err, result) => {
    if (err) {
      console.error('Error saving package:', err.message);
      return res.status(500).json({ error: 'Failed to save package.' });
    }
    res.json({ message: 'Package saved successfully!' });
  });
});

// =================== BOOK PACKAGE ===================
app.post('/book-package', (req, res) => {
  const { flight, hotel, tour, customer_email } = req.body;
  const total = flight.price + hotel.price + tour.totalCost;

  const bookingData = {
    flight_name: flight.flight_name,
    hotel_name: hotel.name,
    tour_name: tour.name,
    customer_email,
    total_price: total
  };

  bookingSubject.notifyObservers(bookingData);
  res.json({ message: '✅ Booking completed successfully!' });
});

// =================== SERVER ===================
const port = 3001;
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
