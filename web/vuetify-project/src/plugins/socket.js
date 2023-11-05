import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // Reemplaza con tu URL de socket

export default socket;