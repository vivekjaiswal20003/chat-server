# Simple TCP Chat Server

A simple, real-time TCP chat server built with Node.js.

## Features

- Multi-user chat
- Unique usernames
- Broadcast messaging
- Graceful disconnects
- Standard library only (no external dependencies)
- `WHO`: List all connected users.
- `DM <username> <message>`: Send a private message to a user.
- `PING`: Check if the server is responsive.
- Idle timeout: Disconnects inactive users after 60 seconds.

### Prerequisites

- Node.js
- `netcat` 

### Running the Server

1. **Start the server:**

   ```bash
   node chat_server.js
   ```

   By default, the server will start on port `4000`.

2. **Run on a different port:**

   You can specify a different port using the `PORT` environment variable or as a command-line argument:

   ```bash
   PORT=5000 node chat_server.js
   ```

   or

   ```bash
   node chat_server.js 5000
   ```

### Connecting to the Server

1. **Open a new terminal and connect to the server using `netcat`:**

   ```bash
   ncat localhost 4000
   ```

2. **Log in with a unique username:**

   ```
   LOGIN <your-username>
   ```

   If the username is available, you will receive an `OK` response. Otherwise, you will receive an `ERR username-taken` message.

3. **Send messages:**

   Once you are logged in, you can send messages to other users:

   ```
   MSG <your-message>
   ```

   Your message will be broadcast to all connected users in the following format:

   ```
   MSG <username> <your-message>
   ```

## Commands

- `LOGIN <username>`: Log in with a unique username.
- `MSG <message>`: Send a message to all users.
- `WHO`: List all connected users.
- `DM <username> <message>`: Send a private message to a specific user.
- `PING`: Check if the server is responsive.

## Example Interaction

**Client 1:**

```
$ ncat localhost 4000
LOGIN Naman
OK
MSG hi everyone!
MSG how are you?
```

**Client 2:**

```
$ ncat localhost 4000
LOGIN Yudi
OK
MSG hello Naman!
```

**Client 1 receives:**

```
MSG Yudi hello Naman!
```

**Client 2 receives:**

```
MSG Naman hi everyone!
MSG Naman how are you?
```

**When Client 1 disconnects, Client 2 receives:**

```
INFO Naman disconnected
```
