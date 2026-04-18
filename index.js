const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

const TOKEN = process.env.TOKEN;
const WEBHOOK_URL = "https://discord.com/api/webhooks/1494856707212574831/unMNxUm1po3xgqEUJEsUmeXHBDRiVDHZa3f_fHcIuqKCVyfDdNKlcUrS5K3H3o7M3fbX";

let users = {};

// ===== AURAS (SMOOTH SCALING BIS 1 IN 3B) =====
const AURAS = [
  { name: "Dust", chance: 1/2, coins: 1 },
  { name: "Pebble", chance: 1/3, coins: 1 },
  { name: "Breeze", chance: 1/5, coins: 2 },
  { name: "Spark", chance: 1/8, coins: 3 },
  { name: "Flame", chance: 1/12, coins: 4 },
  { name: "Frost", chance: 1/18, coins: 6 },
  { name: "Storm", chance: 1/25, coins: 8 },
  { name: "Crystal", chance: 1/40, coins: 12 },
  { name: "Shadow", chance: 1/70, coins: 20 },
  { name: "Light", chance: 1/120, coins: 30 },
  { name: "Plasma", chance: 1/200, coins: 50 },
  { name: "Void", chance: 1/350, coins: 80 },
  { name: "Galaxy", chance: 1/600, coins: 120 },
  { name: "Nebula", chance: 1/1000, coins: 200 },
  { name: "Supernova", chance: 1/1800, coins: 350 },
  { name: "Phoenix", chance: 1/3500, coins: 600 },
  { name: "Titan", chance: 1/7000, coins: 1200 },
  { name: "Leviathan", chance: 1/15000, coins: 2500 },
  { name: "Eclipse", chance: 1/30000, coins: 5000 },
  { name: "Singularity", chance: 1/70000, coins: 9000 },
  { name: "Astral", chance: 1/150000, coins: 20000 },
  { name: "Celestial", chance: 1/300000, coins: 40000 },
  { name: "Transcendent", chance: 1/700000, coins: 80000 },
  { name: "Omega", chance: 1/1500000, coins: 150000 },
  { name: "Infinity", chance: 1/4000000, coins: 300000 },
  { name: "Reality Breaker", chance: 1/10000000, coins: 700000 },
  { name: "Multiverse Core", chance: 1/50000000, coins: 2000000 },
  { name: "Godform", chance: 1/300000000, coins: 7000000 },
  { name: "Absolute Zero", chance: 1/3000000000, coins: 20000000 }
];

// ===== EXCLUSIVE AURAS =====
const EXCLUSIVE = {
  "Dream Space": [
    { name: "Lucid Dream", chance: 1/1000000, coins: 500000 },
    { name: "Nightmare Core", chance: 1/5000000, coins: 2000000 }
  ],
  "Paradise": [
    { name: "Heavenly Light", chance: 1/2000000, coins: 800000 },
    { name: "Seraph", chance: 1/8000000, coins: 3000000 }
  ],
  "Quantum Rift": [
    { name: "Quantum Flux", chance: 1/5000000, coins: 1500000 },
    { name: "Time Collapse", chance: 1/20000000, coins: 6000000 }
  ]
};

// ===== BIOMES =====
let currentBiome = { name: "Forest", luck: 1 };

function getBiome() {
  if (Math.random() < 1/100000) {
    return { name: "Quantum Rift", luck: 5, duration: 1200000 };
  }
  if (Math.random() < 1/30000) {
    return { name: "Paradise", luck: 3, duration: 720000 };
  }
  if (Math.random() < 1/20000) {
    return { name: "Dream Space", luck: 4, duration: 300000 };
  }

  const normal = [
    { name: "Forest", luck: 1 },
    { name: "Desert", luck: 1.2 },
    { name: "Ocean", luck: 1.3 },
    { name: "Tundra", luck: 1.4 },
    { name: "Volcano", luck: 1.7 },
    { name: "Voidlands", luck: 2 }
  ];

  return normal[Math.floor(Math.random() * normal.length)];
}

function biomeLoop() {
  const biome = getBiome();
  currentBiome = biome;

  console.log("Biome:", biome.name);

  setTimeout(biomeLoop, biome.duration || (Math.random() * 8 + 2) * 60000);
}

// ===== RNG =====
function rollAura(user) {
  let luck = user.luck * currentBiome.luck;
  let pool = [...AURAS];

  if (EXCLUSIVE[currentBiome.name]) {
    pool = pool.concat(EXCLUSIVE[currentBiome.name]);
  }

  const rng = Math.random() / luck;

  let cumulative = 0;

  for (let aura of pool) {
    cumulative += aura.chance;
    if (rng < cumulative) return aura;
  }

  return pool[0];
}

// ===== WEBHOOK =====
async function sendRare(user, aura) {
  if (aura.chance <= 1/10000000) {
    await axios.post(WEBHOOK_URL, {
      content: `🚨 @everyone\n🔥 ${user} GOT ${aura.name} 🔥\n💀 1 IN ${Math.round(1/aura.chance).toLocaleString()}`
    });
  }
}

// ===== POTIONS =====
const POTIONS = {
  lucky: { price: 100, luck: 1.5, duration: 300000 },
  speed: { price: 200, speed: 2, duration: 300000 },
  heavenly: { price: 5000, luck: 200000, duration: 1 }
};

// ===== READY =====
client.once('ready', () => {
  console.log('Bot online');
  biomeLoop();
});

// ===== COMMANDS =====
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const id = interaction.user.id;

  if (!users[id]) {
    users[id] = { coins: 0, luck: 1 };
  }

  if (interaction.commandName === "roll") {
    const aura = rollAura(users[id]);

    users[id].coins += aura.coins;

    await sendRare(interaction.user.username, aura);

    interaction.reply(`🎲 ${aura.name}\n💰 +${aura.coins}\n🌍 ${currentBiome.name}`);
  }

  if (interaction.commandName === "coins") {
    interaction.reply(`💰 ${users[id].coins}`);
  }

  if (interaction.commandName === "shop") {
    interaction.reply(`🧪 Shop:
Lucky - 100
Speed - 200
Heavenly - 5000`);
  }

  if (interaction.commandName === "buy") {
    const item = interaction.options.getString("item");

    const p = POTIONS[item];
    if (!p) return interaction.reply("❌");

    if (users[id].coins < p.price) return interaction.reply("❌ Not enough");

    users[id].coins -= p.price;

    if (p.duration === 1) {
      users[id].luck *= p.luck;
    } else {
      users[id].luck *= p.luck;
      setTimeout(() => users[id].luck = 1, p.duration);
    }

    interaction.reply(`✅ Bought ${item}`);
  }
});

client.login(TOKEN);
