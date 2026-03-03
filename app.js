const setupSection = document.getElementById('setup');
const chatSection = document.getElementById('chat');
const nicknameInput = document.getElementById('nickname');
const roomInput = document.getElementById('room');
const joinButton = document.getElementById('join');
const leaveButton = document.getElementById('leave');
const roomName = document.getElementById('room-name');
const messagesList = document.getElementById('messages');
const composer = document.getElementById('composer');
const messageInput = document.getElementById('message');
const connectionStatus = document.getElementById('connection-status');
const roomsList = document.getElementById('rooms-list');

const PEERS = [
  'https://peer.wallie.io/gun',
  'https://gun-manhattan.herokuapp.com/gun',
];

const gun = Gun({ peers: PEERS });
const roomsCatalogRef = gun.get('zapzinho-rooms');
let currentRoom = null;
let currentNick = null;
let roomRef = null;
const seenIds = new Set();
const onlinePeers = new Set();
const knownRooms = new Map();

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function setConnectionStatus() {
  if (onlinePeers.size > 0) {
    connectionStatus.textContent = `Conectado (${onlinePeers.size} peer)`;
    connectionStatus.className = 'status ok';
    return;
  }

  connectionStatus.textContent = 'Sem conexão com o relay (mensagens podem não sincronizar)';
  connectionStatus.className = 'status warn';
}

function renderRooms() {
  const sortedRooms = Array.from(knownRooms.entries())
    .filter(([name]) => Boolean(name))
    .sort((a, b) => (b[1]?.lastActive || 0) - (a[1]?.lastActive || 0));

  roomsList.innerHTML = '';

  if (sortedRooms.length === 0) {
    const li = document.createElement('li');
    li.className = 'rooms-empty';
    li.textContent = 'Nenhuma sala ainda. Crie a primeira!';
    roomsList.appendChild(li);
    return;
  }

  sortedRooms.forEach(([name]) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'room-pill';
    button.textContent = name;
    button.addEventListener('click', () => {
      roomInput.value = name;
      roomInput.focus();
    });
    li.appendChild(button);
    roomsList.appendChild(li);
  });
}

function trackRoom(name, lastActive = Date.now()) {
  if (!name) return;
  knownRooms.set(name, { lastActive });
  renderRooms();
}

gun.on('hi', (peer) => {
  if (peer && peer.url) onlinePeers.add(peer.url);
  setConnectionStatus();
});

gun.on('bye', (peer) => {
  if (peer && peer.url) onlinePeers.delete(peer.url);
  setConnectionStatus();
});

roomsCatalogRef.map().on((roomMeta, roomKey) => {
  if (!roomKey || !roomMeta || !roomMeta.name) return;
  trackRoom(roomMeta.name, roomMeta.lastActive || Date.now());
});

setConnectionStatus();
renderRooms();

function addMessage(msg) {
  if (!msg || !msg.id || !msg.nick || !msg.text || seenIds.has(msg.id)) return;

  seenIds.add(msg.id);
  const li = document.createElement('li');
  li.className = `msg ${msg.nick === currentNick ? 'me' : ''}`;
  li.innerHTML = `
    <div class="meta">${escapeHtml(msg.nick)} • ${new Date(msg.time || Date.now()).toLocaleTimeString()}</div>
    <div>${escapeHtml(msg.text)}</div>
  `;

  messagesList.appendChild(li);
  messagesList.scrollTop = messagesList.scrollHeight;
}

function joinChat() {
  const nick = nicknameInput.value.trim();
  const room = roomInput.value.trim().toLowerCase();

  if (!nick || !room) {
    alert('Preencha nome e sala.');
    return;
  }

  currentNick = nick;
  currentRoom = room;
  roomName.textContent = `Sala: ${room}`;
  setupSection.classList.add('hidden');
  chatSection.classList.remove('hidden');
  messagesList.innerHTML = '';
  seenIds.clear();

  const roomMeta = {
    name: room,
    lastActive: Date.now(),
  };
  roomsCatalogRef.get(room).put(roomMeta);
  trackRoom(room, roomMeta.lastActive);

  if (roomRef) roomRef.off();
  roomRef = gun.get('zapzinho').get(currentRoom);

  roomRef.map().once(addMessage);
  roomRef.map().on(addMessage);
}

function leaveChat() {
  if (roomRef) roomRef.off();
  roomRef = null;
  currentRoom = null;
  messagesList.innerHTML = '';
  chatSection.classList.add('hidden');
  setupSection.classList.remove('hidden');
}

joinButton.addEventListener('click', joinChat);
leaveButton.addEventListener('click', leaveChat);

composer.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = messageInput.value.trim();
  if (!text || !currentRoom) return;

  const msg = {
    id: crypto.randomUUID(),
    nick: currentNick,
    text,
    time: Date.now(),
  };

  gun.get('zapzinho').get(currentRoom).get(msg.id).put(msg);
  roomsCatalogRef.get(currentRoom).put({
    name: currentRoom,
    lastActive: msg.time,
  });
  trackRoom(currentRoom, msg.time);

  messageInput.value = '';
  messageInput.focus();
});
