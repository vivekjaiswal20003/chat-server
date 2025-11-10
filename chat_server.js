const net = require('net');

const PORT = process.env.PORT || process.argv[2] || 4000;

// The time in milliseconds before an idle client is disconnected.
const IDLE_TIMEOUT = 60000;

// A map to store the connected clients.
// The key is the username and the value is the socket.
const clients = new Map();

/**
 * Broadcasts a message to all connected clients except the sender.
 *
 * @param {string} message The message to broadcast.
 * @param {net.Socket} sender The socket of the sender.
 */
function broadcast(message, sender) {
  for (const client of clients.values()) {
    if (client !== sender) {
      client.write(message);
    }
  }
}

/**
 * Handles the LOGIN command.
 *
 * @param {net.Socket} socket The client's socket.
 * @param {string[]} args The arguments for the command.
 */
function handleLogin(socket, args) {
  const username = args[0];
  if (clients.has(username)) {
    socket.write('ERR username-taken\n');
  } else {
    socket.username = username;
    clients.set(username, socket);
    socket.write('OK\n');
    broadcast(`INFO ${username} joined\n`, socket);
  }
}

/**
 * Handles the MSG command.
 *
 * @param {net.Socket} socket The client's socket.
 * @param {string[]} args The arguments for the command.
 */
function handleMessage(socket, args) {
  if (!socket.username) {
    socket.write('ERR not-logged-in\n');
    return;
  }
  const text = args.join(' ');
  broadcast(`MSG ${socket.username} ${text}\n`, socket);
}

/**
 * Handles the WHO command.
 *
 * @param {net.Socket} socket The client's socket.
 */
function handleWho(socket) {
  if (!socket.username) {
    socket.write('ERR not-logged-in\n');
    return;
  }
  for (const username of clients.keys()) {
    socket.write(`USER ${username}\n`);
  }
}

/**
 * Handles the DM command.
 *
 * @param {net.Socket} socket The client's socket.
 * @param {string[]} args The arguments for the command.
 */
function handleDirectMessage(socket, args) {
  if (!socket.username) {
    socket.write('ERR not-logged-in\n');
    return;
  }
  const [recipient, ...dm] = args;
  const dmText = dm.join(' ');
  if (clients.has(recipient)) {
    clients.get(recipient).write(`DM ${socket.username} ${dmText}\n`);
  } else {
    socket.write('ERR user-not-found\n');
  }
}

/**
 * Handles the PING command.
 *
 * @param {net.Socket} socket The client's socket.
 */
function handlePing(socket) {
  socket.write('PONG\n');
}

// Create a new TCP server.
const server = net.createServer((socket) => {
  console.log('New client connected');
  socket.setTimeout(IDLE_TIMEOUT);

  // Handle incoming data from the client.
  socket.on('data', (data) => {
    socket.setTimeout(IDLE_TIMEOUT);
    const message = data.toString().trim();
    const [command, ...args] = message.split(' ');

    switch (command) {
      case 'LOGIN':
        handleLogin(socket, args);
        break;
      case 'MSG':
        handleMessage(socket, args);
        break;
      case 'WHO':
        handleWho(socket);
        break;
      case 'DM':
        handleDirectMessage(socket, args);
        break;
      case 'PING':
        handlePing(socket);
        break;
      default:
        socket.write('ERR unknown-command\n');
    }
  });

  // Handle client disconnections.
  socket.on('close', () => {
    if (socket.username) {
      clients.delete(socket.username);
      broadcast(`INFO ${socket.username} disconnected\n`, socket);
    }
    console.log('Client disconnected');
  });

  // Handle idle timeouts.
  socket.on('timeout', () => {
    socket.write('INFO idle-timeout\n');
    socket.end();
  });

  // Handle socket errors.
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

// Start the server.
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
