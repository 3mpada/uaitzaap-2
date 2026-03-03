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

const gun = Gun({ peers: ['https://gun-manhattan.herokuapp.com/gun'] });
let currentRoom = null;
let currentNick = null;
let subscription = null;
const seenIds = new Set();

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function addMessage(msg) {
  if (!msg || !msg.id || seenIds.has(msg.id)) return;

  seenIds.add(msg.id);
  const li = document.createElement('li');
  li.className = `msg ${msg.nick === currentNick ? 'me' : ''}`;
  li.innerHTML = `
    <div class="meta">${escapeHtml(msg.nick)} • ${new Date(msg.time).toLocaleTimeString()}</div>
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

  if (subscription) subscription.off();
  subscription = gun.get('zapzinho').get(currentRoom).map();
  subscription.on(addMessage);
}

function leaveChat() {
  if (subscription) subscription.off();
  subscription = null;
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
  messageInput.value = '';
  messageInput.focus();
});
