// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let orders = [];

io.on('connection', (socket) => {
  console.log('New client connected');

  // Send current orders to newly connected client
  socket.emit('initial_orders', orders);

  // Handle new orders from customers
  socket.on('new_order', (order) => {
    order.id = Date.now();
    order.timestamp = new Date().toISOString();
    order.status = 'new';
    orders.push(order);
    io.emit('order_update', orders);
  });

  // Handle status updates from kitchen
  socket.on('update_status', ({ orderId, status }) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      io.emit('order_update', orders);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
