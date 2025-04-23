const Database = require('./Database'); 

const db1 = Database.getInstance();
const db2 = Database.getInstance();

console.log("db1 === db2:", db1 === db2); 
console.log("db1.connection === db2.connection:", db1.getConnection() === db2.getConnection());

if (db1 === db2) {
  console.log(" Singleton is working. Only one instance exists.");
} else {
  console.log("Singleton failed. multiple instances exist.");
}
