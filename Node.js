const { Telegraf, Markup } = require("telegraf");

/* ================== CONFIG ================== */

// 🔐 YAHAN APNA *NAYA* BOT TOKEN PASTE KARE
const BOT_TOKEN = "7992980729:AAExGpotJJB7nMQhMWtwFFF_D3McYFVXAoc";

// 👤 AAPKI TELEGRAM ID (YEH MAINE SET KAR DI HAI)
const ADMIN_ID = 8154253222;

/* ============================================ */

const bot = new Telegraf(BOT_TOKEN);

// memory store
let savedData = {};

/* ========== 1️⃣ SAVE CONTENT (ADMIN DM) ========== */
bot.command("save", async (ctx) => {
  if (ctx.chat.type !== "private") return;
  if (ctx.from.id !== ADMIN_ID) return;

  const name = ctx.message.text.split(" ")[1];
  if (!name) {
    return ctx.reply("Use: /save uniqueName");
  }

  ctx.reply("Ab message bhejiye");

  bot.once("message", (msgCtx) => {
    savedData[name] = msgCtx.message;
    ctx.reply(`✅ '${name}' save ho gaya`);
  });
});

/* ========== 2️⃣ GROUP COMMAND LISTENER ========== */
bot.on("text", async (ctx) => {
  if (!ctx.message.text.startsWith("/")) return;

  const code = ctx.message.text.slice(1);
  if (!savedData[code]) return;

  const userId = ctx.from.id;
  const groupId = ctx.chat.id;

  await bot.telegram.sendMessage(
    ADMIN_ID,
    `Approval Request\nUser: @${ctx.from.username || "NoUsername"}\nCommand: /${code}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("✅ Approve", `ok_${code}_${groupId}`)],
      [Markup.button.callback("❌ Reject", `no_${userId}_${groupId}`)],
      [
        Markup.button.callback("🔇 Mute 1 min", `m1_${userId}_${groupId}`),
        Markup.button.callback("🔇 Mute 2 min", `m2_${userId}_${groupId}`)
      ]
    ])
  );
});

/* ========== 3️⃣ APPROVE ========== */
bot.action(/ok_(.+)_(.+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const code = ctx.match[1];
  const groupId = ctx.match[2];
  const msg = savedData[code];

  if (msg.text) {
    await bot.telegram.sendMessage(groupId, msg.text);
  }

  ctx.answerCbQuery("Approved & sent");
});

/* ========== 4️⃣ REJECT ========== */
bot.action(/no_(\d+)_(.+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const groupId = ctx.match[2];
  await bot.telegram.sendMessage(
    groupId,
    "❌ Aapko anumati nahi mili"
  );

  ctx.answerCbQuery("Rejected");
});

/* ========== 5️⃣ MUTE 1 MIN ========== */
bot.action(/m1_(\d+)_(.+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  await bot.telegram.restrictChatMember(
    ctx.match[2],
    ctx.match[1],
    {
      permissions: { can_send_messages: false },
      until_date: Math.floor(Date.now() / 1000) + 60
    }
  );

  ctx.answerCbQuery("Muted 1 minute");
});

/* ========== 6️⃣ MUTE 2 MIN ========== */
bot.action(/m2_(\d+)_(.+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  await bot.telegram.restrictChatMember(
    ctx.match[2],
    ctx.match[1],
    {
      permissions: { can_send_messages: false },
      until_date: Math.floor(Date.now() / 1000) + 120
    }
  );

  ctx.answerCbQuery("Muted 2 minutes");
});

/* ========== START BOT ========== */
bot.launch();
console.log("🤖 Bot started successfully");
