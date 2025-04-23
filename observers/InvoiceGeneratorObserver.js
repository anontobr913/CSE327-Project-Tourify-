class InvoiceGeneratorObserver {
    update(data) {
      console.log(`[Invoice] 🧾 Invoice generated for ${data.customer_email} - Total: ${data.total_price} BDT`);
      // In a real app, generate PDF or HTML invoice here
    }
  }
  
  module.exports = InvoiceGeneratorObserver;
  