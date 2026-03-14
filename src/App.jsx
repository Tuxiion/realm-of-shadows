import { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDsOOhAQNlmStCbHLd6Q7rUzCzsz3V5N7g",
    authDomain: "realm-of-shadows-12493.firebaseapp.com",
    projectId: "realm-of-shadows-12493",
    storageBucket: "realm-of-shadows-12493.firebasestorage.app",
    messagingSenderId: "757070417568",
    appId: "1:757070417568:web:3ce96324db9fe5171683c5",
};
const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
const miss = () => rand(1, 100) <= 5;

const SHEETS = {
    classes: "/realm-of-shadows/assets/images/classes.png",
    zone1: "/realm-of-shadows/assets/images/zone1.png",
    zone2: "/realm-of-shadows/assets/images/zone2.png",
    zone3: "/realm-of-shadows/assets/images/zone3.png",
    zone4: "/realm-of-shadows/assets/images/zone4.png",
    equipment: "/realm-of-shadows/assets/images/equipment.png",
    extras: "/realm-of-shadows/assets/images/extras.png",
};

const SHEET_META = {
    classes: { cols: 3, rows: 2, w: 1024, h: 1024 },
    zone1: { cols: 3, rows: 2, w: 1024, h: 1024 },
    zone2: { cols: 3, rows: 2, w: 1024, h: 1024 },
    zone3: { cols: 3, rows: 1, w: 1023, h: 926 },
    zone4: { cols: 2, rows: 2, w: 1024, h: 1024 },
    equipment: { cols: 6, rows: 5, w: 1024, h: 1024 },
    extras: { cols: 2, rows: 2, w: 1024, h: 1024 },
};

function Portrait({ sheetKey, col, row, displaySize = 56, radius = "50%", style = {}, glow = "#888", yOffset = 0 }) {
    const meta = SHEET_META[sheetKey];
    if (!meta) return <div style={{ width: displaySize, height: displaySize, ...style }} />;
    const cellW = meta.w / meta.cols;
    const cellH = meta.h / meta.rows;
    const scale = displaySize / cellW;
    const scaledSheetW = meta.w * scale;
    const scaledSheetH = meta.h * scale;
    const scaledCellH = cellH * scale;
    const bpx = -(col * displaySize);
    const bpy = -(row * scaledCellH) - (yOffset * scaledCellH);
    return (
        <div style={{ width: displaySize, height: displaySize, borderRadius: radius, overflow: "hidden", flexShrink: 0, border: `2px solid ${glow}88`, boxShadow: `0 0 10px ${glow}55`, ...style }}>
            <div style={{ width: scaledSheetW, height: scaledSheetH, backgroundImage: `url(${SHEETS[sheetKey]})`, backgroundSize: `${scaledSheetW}px ${scaledSheetH}px`, backgroundPosition: `${bpx}px ${bpy}px`, backgroundRepeat: "no-repeat" }} />
        </div>
    );
}

function ClassPortrait({ className, size = 56, style = {} }) {
    const MAP = {
        "Holy Knight": { sheetKey: "classes", col: 0, row: 0 },
        "Demonic Beast": { sheetKey: "classes", col: 1, row: 0 },
        "Arcane Magician": { sheetKey: "classes", col: 2, row: 0 },
        "Ranged Assassin": { sheetKey: "classes", col: 0, row: 1 },
        "Arch Angel": { sheetKey: "classes", col: 1, row: 1 },
        "Death Knight": { sheetKey: "classes", col: 2, row: 1 },
    };
    const p = MAP[className];
    if (!p) return <div style={{ width: size, height: size, ...style }} />;
    const color = CLASSES[className]?.color || "#888";
    return <Portrait sheetKey={p.sheetKey} col={p.col} row={p.row} displaySize={size} glow={color} style={style} />;
}

function EnemyPortrait({ enemyId, size = 56, style = {} }) {
    const MAP = {
        "forest_wraith": { sheetKey: "zone1", col: 0, row: 0 },
        "dark_treant": { sheetKey: "zone1", col: 1, row: 0 },
        "shadow_wolf": { sheetKey: "zone1", col: 2, row: 0 },
        "bog_lurker": { sheetKey: "zone1", col: 0, row: 1 },
        "venomfang_spider": { sheetKey: "zone1", col: 1, row: 1 },
        "cursed_scarecrow": { sheetKey: "zone1", col: 2, row: 1 },
        "dungeon_troll": { sheetKey: "zone2", col: 0, row: 0 },
        "skeleton_mage": { sheetKey: "zone2", col: 1, row: 0 },
        "cursed_knight": { sheetKey: "zone2", col: 2, row: 0 },
        "stone_golem": { sheetKey: "zone2", col: 0, row: 1 },
        "shadow_assassin": { sheetKey: "zone2", col: 1, row: 1 },
        "plague_priest": { sheetKey: "zone2", col: 2, row: 1 },
        "demon_lord_falaxir": { sheetKey: "zone3", col: 0, row: 0 },
        "xaroon_dragon": { sheetKey: "zone3", col: 1, row: 0, yOffset: 0.35 },
        "veltharion": { sheetKey: "zone3", col: 2, row: 0 },
        "infernal_behemoth": { sheetKey: "zone4", col: 0, row: 0 },
        "infernal_behemoth_raged": { sheetKey: "zone4", col: 1, row: 0 },
        "abyssal_overlord": { sheetKey: "zone4", col: 0, row: 1 },
        "doomreaper": { sheetKey: "zone4", col: 1, row: 1 },
    };
    const p = MAP[enemyId];
    if (!p) {
        const clsKey = Object.keys(CLASSES).find(k => k.toLowerCase().replace(/ /g, "_") === enemyId);
        if (clsKey) return <ClassPortrait className={clsKey} size={size} style={{ borderRadius: "12px", ...style }} />;
        return <div style={{ width: size, height: size, borderRadius: "12px", background: "#222", ...style }} />;
    }
    return <Portrait sheetKey={p.sheetKey} col={p.col} row={p.row} displaySize={size} radius="12px" glow="#cc4444" style={style} yOffset={p.yOffset || 0} />;
}

// ── Per-item yOffset values tuned by visual inspection of each sprite cell.
// The equipment sheet cells are 170×205px (non-square), and each item artwork
// is positioned differently within its cell, so each needs its own offset.
function ItemPortrait({ itemId, size = 32, style = {} }) {
    const MAP = {
        // Row 0 — helmets & staff2
        "helmet1":     { col: 0, row: 0, yOffset: 0.150 },
        "helmet2":     { col: 1, row: 0, yOffset: 0.150 },
        "helmet3":     { col: 2, row: 0, yOffset: 0.200 },
        "wizHat":      { col: 3, row: 0, yOffset: 0.150 },
        "orbHelm":     { col: 4, row: 0, yOffset: 0.150 },
        "staff2":      { col: 5, row: 0, yOffset: 0.150 },
        // Row 1 — weapons
        "blade1":      { col: 0, row: 1, yOffset: 0.125 },
        "blade2":      { col: 1, row: 1, yOffset: 0.125 },
        "axe1":        { col: 2, row: 1, yOffset: 0.125 },
        "sword1":      { col: 3, row: 1, yOffset: 0.175 },
        "staff1":      { col: 4, row: 1, yOffset: 0.150 },
        // Row 2 — body armor
        "armor1":      { col: 0, row: 2, yOffset: 0.200 },
        "armor2":      { col: 1, row: 2, yOffset: 0.200 },
        "robe1":       { col: 2, row: 2, yOffset: 0.200 },
        "archArmor":   { col: 3, row: 2, yOffset: 0.200 },
        "cursedArmor": { col: 5, row: 2, yOffset: 0.200 },
        // Row 3 — rings, health potion, revive gem
        "ring1":       { col: 0, row: 3, yOffset: 0.250 },
        "ring2":       { col: 1, row: 3, yOffset: 0.200 },
        "ring3":       { col: 2, row: 3, yOffset: 0.200 },
        "ring4":       { col: 3, row: 3, yOffset: 0.200 },
        "hpot":        { col: 4, row: 3, yOffset: 0.300 },
        "revive":      { col: 5, row: 3, yOffset: 0.150 },
        // Row 4 — relics, mana elixir, greater potion
        "boneFrag":    { col: 0, row: 4, yOffset: 0.150 },
        "cursedRoot":  { col: 1, row: 4, yOffset: 0.175 },
        "shadowEss":   { col: 2, row: 4, yOffset: 0.175 },
        "voidShard":   { col: 3, row: 4, yOffset: 0.175 },
        "mpot":        { col: 4, row: 4, yOffset: 0.200 },
        "gpot":        { col: 5, row: 4, yOffset: 0.200 },
        // extras sheet — square cells, no yOffset needed
        "bloodVial":    { col: 0, row: 0, sheetKey: "extras" },
        "veilShadows":  { col: 1, row: 0, sheetKey: "extras" },
        "arcaneSliver": { col: 0, row: 1, sheetKey: "extras" },
        "heartFallen":  { col: 1, row: 1, sheetKey: "extras" },
    };
    const p = MAP[itemId];
    if (!p) return null;
    const sheet = p.sheetKey || "equipment";
    // Pass yOffset through so Portrait can center the item in its viewport
    return <Portrait sheetKey={sheet} col={p.col} row={p.row} displaySize={size} radius="6px" glow="#f0c060" style={style} yOffset={p.yOffset || 0} />;
}

const CLASS_NAMES = {
    "Holy Knight": ["Valdris", "Seraphon", "Aurelion", "Belthar", "Dawnsworn", "Kaelthas", "Solarius", "Brightmere", "Aldric", "Luminar"],
    "Demonic Beast": ["Malachar", "Vexaroth", "Duskbane", "Zyr'ak", "Noctiver", "Hexulon", "Draeven", "Voidcaller", "Grimthar", "Soulrend"],
    "Arcane Magician": ["Syndrel", "Evorath", "Lumivex", "Aetherion", "Zylindra", "Mystvar", "Coravex", "Arcanis", "Velindra", "Runewick"],
    "Ranged Assassin": ["Tharix", "Veylan", "Shadowfen", "Nyxara", "Quilrath", "Slivren", "Duskwhisper", "Caeldris", "Wraithe", "Silentmark"],
    "Arch Angel": ["Seraphiel", "Auranthos", "Luminex", "Celestara", "Dawnwing", "Solveran", "Radiantus", "Auriel", "Skywarden", "Exaltis"],
    "Death Knight": ["Morthis", "Gravenbane", "Duskravel", "Soulcleave", "Vorn", "Ashgrasp", "Necrath", "Dreadmaw", "Korvel", "Bonesworn"],
};

const CLASSES = {
    "Holy Knight": {
        icon: "⚔️", color: "#f0c060", desc: "Sacred warrior. High defense, healing properties.",
        stats: { hp: 120, maxHp: 120, mp: 40, maxMp: 40, atk: 18, def: 10, spd: 7, crit: 2, manaRegen: 5 },
        abilities: [
            { name: "Divine Strike", cost: 10, desc: "Sacred blade attack", damage: [18, 28], type: "atk" },
            { name: "Holy Shield", cost: 8, desc: "+50% DEF for 6 turns", damage: [0, 0], type: "holyShield" },
            { name: "Lay on Hands", cost: 15, desc: "Heal 18-25% Max HP", damage: [0.18, 0.25], type: "scaleHeal" },
        ]
    },
    "Demonic Beast": {
        icon: "👹", color: "#c060f0", desc: "Dark pact-maker. High attack, fragile.",
        stats: { hp: 90, maxHp: 90, mp: 70, maxMp: 70, atk: 18, def: 5, spd: 9, crit: 5, manaRegen: 5 },
        abilities: [
            { name: "Hellfire", cost: 15, desc: "Flames of the abyss", damage: [22, 35], type: "atk" },
            { name: "Soul Drain", cost: 12, desc: "Steal HP from enemy", damage: [15, 25], type: "drain" },
            { name: "Demon Pact", cost: 20, desc: "+30% dmg for 6 turns", damage: [0, 0], type: "demonPact" },
        ]
    },
    "Arcane Magician": {
        icon: "🔮", color: "#60c0f0", desc: "Master of arcane arts. High magic, low defense.",
        stats: { hp: 85, maxHp: 85, mp: 100, maxMp: 100, atk: 10, def: 4, spd: 11, crit: 5, manaRegen: 5 },
        abilities: [
            { name: "Arcane Bolt", cost: 10, desc: "Blast of magical energy", damage: [20, 32], type: "atk" },
            { name: "Arcane Surge", cost: 18, desc: "+14 SPD, +5 MP/turn for 6 turns", damage: [0, 0], type: "arcaneBoost" },
            { name: "Mana Burst", cost: 25, desc: "Massive magical explosion", damage: [35, 55], type: "atk" },
        ]
    },
    "Ranged Assassin": {
        icon: "🏹", color: "#60f0a0", desc: "Swift shadow hunter. Extreme crit and burst.",
        stats: { hp: 80, maxHp: 80, mp: 60, maxMp: 60, atk: 16, def: 3, spd: 15, crit: 20, manaRegen: 5 },
        abilities: [
            { name: "Snipe", cost: 14, desc: "Pinpoint lethal shot", damage: [28, 42], type: "atk" },
            { name: "Smoke Bomb", cost: 10, desc: "Reduce enemy ATK by 30% for 6 turns", damage: [0, 0], type: "smokeBomb" },
            { name: "Lethal Volley", cost: 20, desc: "Hit 2-3 times", damage: [12, 20], type: "multi" },
        ]
    },
    "Arch Angel": {
        icon: "😇", color: "#e8e0ff", desc: "Radiant celestial warrior. High HP and DEF.",
        stats: { hp: 130, maxHp: 130, mp: 70, maxMp: 70, atk: 12, def: 12, spd: 8, crit: 8, manaRegen: 6 },
        abilities: [
            { name: "Divine Wrath", cost: 18, desc: "Deals 20% Max HP as damage", damage: [0, 0], type: "divineWrath" },
            { name: "Take Flight", cost: 30, desc: "Dodge next attack + bonus dmg 2 turns", damage: [0, 0], type: "takeFlight" },
            { name: "Celestial Heal", cost: 20, desc: "Heal 15-22% Max HP + 10 MP", damage: [0.15, 0.22], type: "celestialHeal" },
        ]
    },
    "Death Knight": {
        icon: "☠️", color: "#cc2222", desc: "Dark warrior who trades life for power.",
        stats: { hp: 115, maxHp: 115, mp: 50, maxMp: 50, atk: 20, def: 6, spd: 8, crit: 8, manaRegen: 4 },
        abilities: [
            { name: "Dark Sacrifice", cost: 0, desc: "Cost 20% HP: +50% ATK & DEF 6 turns", damage: [0, 0], type: "darkSacrifice" },
            { name: "Soul Rend", cost: 15, desc: "Heavy strike, ignore 30% DEF", damage: [25, 38], type: "soulRend" },
            { name: "Death's Suffering", cost: 18, desc: "DoT: 8% Max HP x 4 turns", damage: [0, 0], type: "deathSuffering" },
        ]
    },
};

const ZONES = [
    { name: "Whispering Forest", bg: "linear-gradient(160deg,#0d1f0d 0%,#1a2e1a 60%,#0d1a0d 100%)", accent: "#3de060" },
    { name: "Shadow Dungeon", bg: "linear-gradient(160deg,#0d0d1f 0%,#1a1a2e 60%,#0d0d1a 100%)", accent: "#6060f0" },
    { name: "Demon's Castle", bg: "linear-gradient(160deg,#1f0d0d 0%,#2e1a1a 60%,#1a0d0d 100%)", accent: "#f06060" },
    { name: "Abyssal Inferno", bg: "linear-gradient(160deg,#1a0000 0%,#2e0800 60%,#0d0000 100%)", accent: "#ff4400" },
];

const MINOR_SUFFIXES = {
    venomous: { label: "🐍 Venomous", desc: "Poisons on hit (3 dmg/turn, 2 turns)", color: "#80ff80" },
    frenzied: { label: "😡 Frenzied", desc: "ATK +8 below 50% HP", color: "#ff8844" },
    thorned: { label: "🌵 Thorned", desc: "Reflects 15% melee damage", color: "#88ff44" },
    armored: { label: "🛡️ Armored", desc: "Extra +6 DEF", color: "#88aaff" },
    cursed: { label: "☠️ Cursed", desc: "Your heals are 30% less effective", color: "#cc44ff" },
    shadowed: { label: "🌑 Shadowed", desc: "20% chance to dodge your attacks", color: "#8888ff" },
};

const AFFIX_LABELS = {
    burn: "🔥 Hellbound", defBypass: "🐉 Dragonfire", atkCurse: "💀 Undying Curse",
    infernalRage: "😤 Infernal Rage", soulStun: "💀 Soul Stun", voidRupture: "👁️ Void Rupture", deathMark: "💀 Death Mark",
};

const ENEMIES_BY_ZONE = [
    [
        { name: "Forest Wraith", id: "forest_wraith", icon: "👻", hp: 50, maxHp: 50, atk: 12, def: 3, xp: 20, gold: 10, style: "aggressive", crit: 5 },
        { name: "Dark Treant", id: "dark_treant", icon: "🌲", hp: 72, maxHp: 72, atk: 10, def: 9, xp: 30, gold: 15, style: "defensive", crit: 5 },
        { name: "Shadow Wolf", id: "shadow_wolf", icon: "🐺", hp: 55, maxHp: 55, atk: 16, def: 4, xp: 25, gold: 12, style: "aggressive", crit: 5 },
        { name: "Bog Lurker", id: "bog_lurker", icon: "🐸", hp: 60, maxHp: 60, atk: 13, def: 5, xp: 22, gold: 11, style: "defensive", crit: 5, minorSuffix: "venomous" },
        { name: "Venomfang Spider", id: "venomfang_spider", icon: "🕷️", hp: 44, maxHp: 44, atk: 17, def: 2, xp: 24, gold: 13, style: "aggressive", crit: 8, minorSuffix: "venomous" },
        { name: "Cursed Scarecrow", id: "cursed_scarecrow", icon: "🎃", hp: 65, maxHp: 65, atk: 11, def: 7, xp: 28, gold: 14, style: "magic", crit: 5, minorSuffix: "thorned" },
    ],
    [
        { name: "Dungeon Troll", id: "dungeon_troll", icon: "👾", hp: 90, maxHp: 90, atk: 18, def: 11, xp: 45, gold: 25, style: "defensive", crit: 5 },
        { name: "Skeleton Mage", id: "skeleton_mage", icon: "💀", hp: 68, maxHp: 68, atk: 23, def: 4, xp: 50, gold: 30, style: "magic", crit: 5 },
        { name: "Cursed Knight", id: "cursed_knight", icon: "🗡️", hp: 82, maxHp: 82, atk: 21, def: 9, xp: 55, gold: 28, style: "aggressive", crit: 5 },
        { name: "Stone Golem", id: "stone_golem", icon: "🪨", hp: 110, maxHp: 110, atk: 16, def: 16, xp: 48, gold: 27, style: "defensive", crit: 5, minorSuffix: "armored" },
        { name: "Shadow Assassin", id: "shadow_assassin", icon: "🌑", hp: 65, maxHp: 65, atk: 26, def: 3, xp: 52, gold: 32, style: "aggressive", crit: 12, minorSuffix: "shadowed" },
        { name: "Plague Priest", id: "plague_priest", icon: "☣️", hp: 75, maxHp: 75, atk: 20, def: 6, xp: 55, gold: 30, style: "plague", crit: 5, minorSuffix: "cursed" },
    ],
    [
        { name: "Demon Lord Falaxir", id: "demon_lord_falaxir", icon: "👿", hp: 190, maxHp: 190, atk: 25, def: 19, xp: 100, gold: 60, style: "magic", crit: 8, affix: "burn", elite: true },
        { name: "Xaroon the Dragon", id: "xaroon_dragon", icon: "🐉", hp: 230, maxHp: 230, atk: 29, def: 22, xp: 120, gold: 80, style: "aggressive", crit: 8, affix: "defBypass", elite: true },
        { name: "Veltharion the Undying", id: "veltharion", icon: "💀", hp: 160, maxHp: 160, atk: 32, def: 14, xp: 110, gold: 70, style: "magic", crit: 10, affix: "atkCurse", elite: true },
    ],
    [
        { name: "Infernal Behemoth", id: "infernal_behemoth", icon: "🔥", hp: 260, maxHp: 260, atk: 36, def: 16, xp: 150, gold: 90, style: "aggressive", crit: 8, affix: "infernalRage", unique: true, uniqueId: "ib", raged: false },
        { name: "The Abyssal Overlord", id: "abyssal_overlord", icon: "👁️", hp: 300, maxHp: 300, atk: 44, def: 20, xp: 200, gold: 130, style: "magic", crit: 8, affix: "voidRupture", unique: true, uniqueId: "ao" },
        { name: "Doomreaper, the Eternal", id: "doomreaper", icon: "☠️", hp: 420, maxHp: 420, atk: 52, def: 18, xp: 300, gold: 200, style: "magic", crit: 12, affix: "soulStun", affix2: "deathMark", unique: true, uniqueId: "dr", deathMarked: false },
    ],
];

const CONSUMABLES = [
    { id: "hpot", name: "Health Potion", icon: "🧪", cost: 10, effect: "heal", amount: 40, desc: "Restore 40 HP" },
    { id: "gpot", name: "Greater Potion", icon: "🍶", cost: 25, effect: "heal", amount: 100, desc: "Restore 100 HP" },
    { id: "mpot", name: "Mana Elixir", icon: "💧", cost: 15, effect: "mp", amount: 30, desc: "Restore 30 MP" },
    { id: "revive", name: "Revive Gem", icon: "💎", cost: 50, effect: "revive", amount: 100, desc: "Revive: +100 HP, +30 MP" },
];

const MONSTER_RELICS = [
    { id: "boneFrag", name: "Bone Fragment", icon: "🦴", cost: 0, sellPrice: 12, stats: { atk: 3 }, desc: "+3 ATK", slot: "relic", type: "passive" },
    { id: "cursedRoot", name: "Cursed Root", icon: "🌿", cost: 0, sellPrice: 10, stats: { maxHp: 10 }, desc: "+10 Max HP", slot: "relic", type: "passive" },
    { id: "shadowEss", name: "Shadow Essence", icon: "💠", cost: 0, sellPrice: 15, stats: { crit: 4 }, desc: "+4% Crit", slot: "relic", type: "passive" },
    { id: "bloodVial", name: "Blood Vial", icon: "🩸", cost: 0, sellPrice: 18, stats: {}, desc: "Use: heal 25 HP", slot: "relic", type: "consumable", effect: "heal", amount: 25 },
    { id: "thornSpike", name: "Thorn Spike", icon: "🌵", cost: 0, sellPrice: 14, stats: { def: 2, atk: 2 }, desc: "+2 ATK, +2 DEF", slot: "relic", type: "passive" },
    { id: "voidShard", name: "Void Shard", icon: "🔷", cost: 0, sellPrice: 20, stats: { atk: 4, crit: 3 }, desc: "+4 ATK, +3% Crit", slot: "relic", type: "passive" },
];

const TRINKETS = [
    { id: "veilShadows", name: "Veil of Shadows", icon: "🌑", cost: 0, sellPrice: 35, stats: { crit: 5 }, desc: "Passive: +5% Crit. Active: Enemy 25% miss 2 turns", activeName: "Blind", activeDesc: "Enemy misses 25% for 2 turns", activeType: "blind" },
    { id: "arcaneSliver", name: "Arcane Sliver", icon: "🔮", cost: 0, sellPrice: 30, stats: { manaRegen: 3 }, desc: "Passive: +3 MP/turn. Active: +25 MP instantly", activeName: "Surge", activeDesc: "Instantly restore 25 MP", activeType: "mpSurge" },
    { id: "heartFallen", name: "Heart of the Fallen", icon: "❤️", cost: 0, sellPrice: 32, stats: { maxHp: 15 }, desc: "Passive: +15 Max HP. Active: Heal 35 HP", activeName: "Mend", activeDesc: "Heal 35 HP", activeType: "mend" },
];

const EQUIPMENT = [
    { id: "helmet1", name: "Iron Helmet", icon: "🪖", slot: "head", cost: 40, stats: { def: 4, maxHp: 15 }, desc: "+4 DEF, +15 HP" },
    { id: "helmet2", name: "Mithril Helm", icon: "🪖", slot: "head", cost: 90, stats: { def: 8, maxHp: 25 }, desc: "+8 DEF, +25 HP" },
    { id: "helmet3", name: "Crown of the Fallen", icon: "👑", slot: "head", cost: 140, stats: { def: 10, maxHp: 30 }, desc: "+10 DEF, +30 HP, reflect", passive: "reflect" },
    { id: "wizHat", name: "Wizard's Peaked Hat", icon: "🧙", slot: "head", cost: 80, stats: { maxMp: 35, spd: 8 }, desc: "+35 MP, +8 SPD" },
    { id: "orbHelm", name: "Orbim's Blessed Helm", icon: "🛡️", slot: "head", cost: 160, stats: { def: 14, maxHp: 40 }, desc: "+14 DEF, +40 HP, +2 HP/turn", passive: "holyAura" },
    { id: "blade1", name: "Shadow Blade", icon: "🗡️", slot: "weapon", cost: 50, stats: { atk: 6 }, desc: "+6 ATK" },
    { id: "blade2", name: "Blade of Saxav", icon: "🩸", slot: "weapon", cost: 130, stats: { atk: 10 }, desc: "+10 ATK, steals 5 HP", passive: "lifesteal" },
    { id: "axe1", name: "Graveborn Cleaver", icon: "🪓", slot: "weapon", cost: 140, stats: { atk: 14 }, desc: "+14 ATK, steals 8 HP", passive: "lifesteal2" },
    { id: "sword1", name: "Valdris's Judgement", icon: "⚔️", slot: "weapon", cost: 120, stats: { atk: 8, crit: 6 }, desc: "+8 ATK, +6% Crit, +ability dmg", passive: "abilityBonus" },
    { id: "staff1", name: "Arcane Staff", icon: "🔮", slot: "weapon", cost: 50, stats: { manaRegen: 5, maxMp: 20, spd: 5 }, desc: "+5 MP/turn, +20 MP, +5 SPD" },
    { id: "staff2", name: "Orb of Eternal Flame", icon: "🌟", slot: "weapon", cost: 130, stats: { manaRegen: 8, maxMp: 30, spd: 10 }, desc: "+8 MP/turn, +30 MP, +10 SPD, +15% ability dmg", passive: "abilityBonus" },
    { id: "armor1", name: "Chain Armor", icon: "🥋", slot: "body", cost: 45, stats: { def: 6, maxHp: 20 }, desc: "+6 DEF, +20 HP" },
    { id: "armor2", name: "Soulbound Plate", icon: "🛡️", slot: "body", cost: 140, stats: { def: 12, maxHp: 40 }, desc: "+12 DEF, +40 HP, -2 DR", passive: "flatDR" },
    { id: "robe1", name: "Arcane Robe", icon: "👘", slot: "body", cost: 45, stats: { def: 3, maxMp: 30 }, desc: "+3 DEF, +30 MP" },
    { id: "archArmor", name: "San'alath's Arch Armor", icon: "✨", slot: "body", cost: 180, stats: { def: 16, maxHp: 45, spd: 6 }, desc: "+16 DEF, +45 HP, +6 SPD, -4 magic DR", passive: "magicDR" },
    { id: "cursedArmor", name: "Karthous's Cursed Armor", icon: "💀", slot: "body", cost: 160, stats: { def: 10, maxHp: 30, atk: 12 }, desc: "+10 DEF, +30 HP, +12 ATK, -3 HP/turn", passive: "cursedPlate" },
    { id: "ring1", name: "Ring of Power", icon: "💍", slot: "ring", cost: 55, stats: { atk: 4, crit: 5 }, desc: "+4 ATK, +5% Crit" },
    { id: "ring2", name: "Ring of Vitality", icon: "💍", slot: "ring", cost: 55, stats: { maxHp: 30, manaRegen: 2 }, desc: "+30 HP, +2 MP/turn" },
    { id: "ring3", name: "Ring of the Arcanist", icon: "💍", slot: "ring", cost: 55, stats: { maxMp: 25, manaRegen: 5, spd: 7 }, desc: "+25 MP, +5 MP/turn, +7 SPD" },
    { id: "ring4", name: "Ring of the Abyss", icon: "🖤", slot: "ring", cost: 120, stats: { atk: 6, crit: 6, manaRegen: 3 }, desc: "+6 ATK, +6% Crit, +3 MP/turn" },
];

const MONSTER_LOOT = [
    { type: "relic", id: "boneFrag", tier: 0, chance: 20 }, { type: "relic", id: "cursedRoot", tier: 0, chance: 20 },
    { type: "relic", id: "shadowEss", tier: 1, chance: 15 }, { type: "relic", id: "thornSpike", tier: 1, chance: 15 },
    { type: "relic", id: "bloodVial", tier: 0, chance: 10 }, { type: "relic", id: "voidShard", tier: 2, chance: 10 },
    { type: "trinket", id: "veilShadows", tier: 1, chance: 8 }, { type: "trinket", id: "arcaneSliver", tier: 1, chance: 8 },
    { type: "trinket", id: "heartFallen", tier: 1, chance: 8 }, { type: "equipment", id: "orbHelm", tier: 2, chance: 6 },
    { type: "equipment", id: "axe1", tier: 2, chance: 6 }, { type: "equipment", id: "sword1", tier: 2, chance: 6 },
    { type: "equipment", id: "archArmor", tier: 3, chance: 5 }, { type: "equipment", id: "cursedArmor", tier: 3, chance: 5 },
];

const LOOT_TABLES = [
    [{ type: "consumable", id: "hpot", chance: 40 }, { type: "consumable", id: "mpot", chance: 30 }, { type: "equipment", id: "helmet1", chance: 10 }, { type: "equipment", id: "blade1", chance: 8 }, { type: "gold", amount: [8, 18], chance: 5 }, { type: "monsterLoot", tier: 0, chance: 7 }],
    [{ type: "consumable", id: "hpot", chance: 18 }, { type: "consumable", id: "gpot", chance: 8 }, { type: "consumable", id: "mpot", chance: 14 }, { type: "equipment", id: "helmet2", chance: 10 }, { type: "equipment", id: "armor1", chance: 10 }, { type: "equipment", id: "ring1", chance: 10 }, { type: "equipment", id: "staff1", chance: 8 }, { type: "gold", amount: [20, 40], chance: 8 }, { type: "monsterLoot", tier: 1, chance: 14 }],
    [{ type: "consumable", id: "gpot", chance: 12 }, { type: "consumable", id: "revive", chance: 8 }, { type: "equipment", id: "helmet3", chance: 10 }, { type: "equipment", id: "blade2", chance: 10 }, { type: "equipment", id: "staff2", chance: 10 }, { type: "equipment", id: "armor2", chance: 10 }, { type: "equipment", id: "ring4", chance: 10 }, { type: "gold", amount: [40, 70], chance: 10 }, { type: "monsterLoot", tier: 2, chance: 20 }],
    [{ type: "consumable", id: "gpot", chance: 12 }, { type: "consumable", id: "revive", chance: 15 }, { type: "equipment", id: "blade2", chance: 12 }, { type: "equipment", id: "staff2", chance: 12 }, { type: "equipment", id: "armor2", chance: 10 }, { type: "equipment", id: "ring4", chance: 8 }, { type: "monsterLoot", tier: 3, chance: 31 }],
];

const UPGRADES = [
    { id: "hp", label: "❤️ Health", desc: "+20 Max HP", apply: p => ({ ...p, maxHp: p.maxHp + 20, hp: Math.min(p.hp + 20, p.maxHp + 20) }) },
    { id: "mp", label: "💧 Mana", desc: "+40 Max MP", apply: p => ({ ...p, maxMp: p.maxMp + 40, mp: Math.min(p.mp + 40, p.maxMp + 40) }) },
    { id: "reg", label: "✨ Mana Regen", desc: "+4 per turn", apply: p => ({ ...p, manaRegen: p.manaRegen + 4 }) },
    { id: "atk", label: "⚔️ Attack", desc: "+5 Attack", apply: p => ({ ...p, atk: p.atk + 5 }) },
    { id: "def", label: "🛡️ Defense", desc: "+4 Defense", apply: p => ({ ...p, def: p.def + 4 }) },
    { id: "crit", label: "🎯 Critical Strike", desc: "+8% Crit Chance", apply: p => ({ ...p, crit: p.crit + 8 }) },
];

const getBonus = eq => { const b = { atk: 0, def: 0, maxHp: 0, maxMp: 0, crit: 0, manaRegen: 0, spd: 0 }; Object.values(eq).forEach(it => { if (it && it.stats) Object.entries(it.stats).forEach(([k, v]) => { b[k] = (b[k] || 0) + v; }); }); return b; };
const hasP = (eq, p) => Object.values(eq).some(it => it?.passive === p);
const effStats = (p, eq) => { const b = getBonus(eq); return { ...p, atk: p.atk + b.atk, def: p.def + b.def, spd: (p.spd || 0) + b.spd, crit: (p.crit || 2) + b.crit, manaRegen: (p.manaRegen || 5) + b.manaRegen }; };
const doEquip = (item, eq, p) => { let np = { ...p }; const old = eq[item.slot]; if (old) { if (old.stats.maxHp) { np.maxHp -= old.stats.maxHp; np.hp = clamp(np.hp - old.stats.maxHp, 1, np.maxHp); } if (old.stats.maxMp) { np.maxMp -= old.stats.maxMp; np.mp = clamp(np.mp - old.stats.maxMp, 0, np.maxMp); } } if (item.stats.maxHp) { np.maxHp += item.stats.maxHp; np.hp = clamp(np.hp + item.stats.maxHp, 1, np.maxHp); } if (item.stats.maxMp) { np.maxMp += item.stats.maxMp; np.mp = clamp(np.mp + item.stats.maxMp, 0, np.maxMp); } return { np, newEq: { ...eq, [item.slot]: item } }; };
const doUnequip = (slot, eq, p) => { const old = eq[slot]; if (!old) return { np: p, newEq: eq }; let np = { ...p }; if (old.stats.maxHp) { np.maxHp -= old.stats.maxHp; np.hp = clamp(np.hp - old.stats.maxHp, 1, np.maxHp); } if (old.stats.maxMp) { np.maxMp -= old.stats.maxMp; np.mp = clamp(np.mp - old.stats.maxMp, 0, np.maxMp); } return { np, newEq: { ...eq, [slot]: null } }; };

function AnimatedBar({ val, max, color, label, floats = [] }) {
    const [disp, setDisp] = useState(val); const [ghost, setGhost] = useState(val); const gt = useRef(null);
    useEffect(() => { if (val < disp) { setGhost(disp); clearTimeout(gt.current); gt.current = setTimeout(() => setGhost(val), 600); } setDisp(val); }, [val]);
    const pct = w => `${clamp((w / max) * 100, 0, 100)}%`;
    return (
        <div style={{ marginBottom: 5, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa", marginBottom: 2 }}>
                <span style={{ fontWeight: "bold" }}>{label}</span><span>{Math.max(0, val)}/{max}</span>
            </div>
            <div style={{ background: "#111", borderRadius: 6, height: 10, overflow: "visible", position: "relative", boxShadow: "inset 0 1px 3px #00000080" }}>
                <div style={{ position: "absolute", left: 0, top: 0, width: pct(Math.max(ghost, disp)), background: "rgba(255,255,255,0.18)", height: "100%", borderRadius: 6, transition: "width 0.05s" }} />
                <div style={{ position: "absolute", left: 0, top: 0, width: pct(val), background: color, height: "100%", borderRadius: 6, transition: "width 0.55s ease-out", boxShadow: `0 0 6px ${color}99` }} />
            </div>
            {floats.map(f => <div key={f.id} style={{ position: "absolute", right: 4, top: -6, fontSize: 13, fontWeight: "bold", color: f.color, pointerEvents: "none", animation: "floatUp 1.2s ease-out forwards", zIndex: 50 }}>{f.text}</div>)}
        </div>
    );
}

function StatusPill({ label, color }) {
    return <span style={{ background: color + "22", border: `1px solid ${color}66`, color, borderRadius: 99, padding: "1px 7px", fontSize: 9, fontWeight: "bold", whiteSpace: "nowrap" }}>{label}</span>;
}

// Visual overlay that plays on top of an HP bar when an action fires
const ANIM_CFG = {
    slash:  { emoji: "⚔️",  bg: "linear-gradient(90deg,#ff440000,#ff444488,#ff440000)", keyframe: "slashAnim",  dur: 500 },
    fire:   { emoji: "🔥",  bg: "linear-gradient(90deg,#ff660000,#ff664488,#ff660000)", keyframe: "fireAnim",   dur: 650 },
    arcane: { emoji: "🔮",  bg: "linear-gradient(90deg,#6040ff00,#6040ff88,#6040ff00)", keyframe: "arcaneAnim", dur: 600 },
    holy:   { emoji: "✨",  bg: "linear-gradient(90deg,#ffff8800,#ffff8877,#ffff8800)", keyframe: "holyAnim",   dur: 650 },
    dark:   { emoji: "💀",  bg: "linear-gradient(90deg,#44008800,#44008877,#44008800)", keyframe: "darkAnim",   dur: 600 },
    drain:  { emoji: "🩸",  bg: "linear-gradient(90deg,#cc006600,#cc006677,#cc006600)", keyframe: "drainAnim",  dur: 650 },
    arrow:  { emoji: "🏹",  bg: "linear-gradient(90deg,#00cc6600,#00cc6677,#00cc6600)", keyframe: "arrowAnim",  dur: 500 },
    heal:   { emoji: "💚",  bg: "linear-gradient(90deg,#00cc4400,#00cc4466,#00cc4400)", keyframe: "healAnim",   dur: 700 },
    poison: { emoji: "☣️", bg: "linear-gradient(90deg,#44cc0000,#44cc0066,#44cc0000)", keyframe: "poisonAnim", dur: 600 },
    buff:   { emoji: "⬆️",  bg: "linear-gradient(90deg,#ffff0000,#ffff0055,#ffff0000)", keyframe: "buffAnim",   dur: 750 },
    debuff: { emoji: "⬇️",  bg: "linear-gradient(90deg,#ff440000,#ff440055,#ff440000)", keyframe: "debuffAnim", dur: 700 },
    shield: { emoji: "🛡️", bg: "linear-gradient(90deg,#f0c06000,#f0c06066,#f0c06000)", keyframe: "buffAnim",   dur: 750 },
    power:  { emoji: "💥",  bg: "linear-gradient(90deg,#cc222200,#cc222266,#cc222200)", keyframe: "buffAnim",   dur: 750 },
    smoke:  { emoji: "💨",  bg: "linear-gradient(90deg,#00cc6600,#00cc6655,#00cc6600)", keyframe: "debuffAnim", dur: 700 },
    flight: { emoji: "😇",  bg: "linear-gradient(90deg,#e8e0ff00,#e8e0ff55,#e8e0ff00)", keyframe: "buffAnim",   dur: 750 },
};

function CombatAnimOverlay({ anim }) {
    if (!anim) return null;
    const cfg = ANIM_CFG[anim.type] || ANIM_CFG.slash;
    return (
        <div style={{ position: "absolute", inset: 0, borderRadius: 10, overflow: "hidden", pointerEvents: "none", zIndex: 10 }}>
            {/* Bar sweep */}
            <div style={{ position: "absolute", inset: 0, background: cfg.bg, animation: `${cfg.keyframe} ${cfg.dur}ms ease-out forwards` }} />
            {/* Central emoji burst */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 32, lineHeight: 1, animation: `${cfg.keyframe} ${cfg.dur}ms ease-out forwards`, filter: "drop-shadow(0 0 8px #fff8)" }}>
                {cfg.emoji}
            </div>
        </div>
    );
}

function Particles() {
    const pts = Array.from({ length: 18 }, (_, i) => ({ id: i, x: rand(5, 95), delay: rand(0, 4000), dur: rand(3000, 7000), size: rand(2, 5), opacity: rand(20, 60) / 100 }));
    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            {pts.map(p => <div key={p.id} style={{ position: "absolute", left: `${p.x}%`, bottom: "-10px", width: p.size, height: p.size, borderRadius: "50%", background: `rgba(240,192,96,${p.opacity})`, animation: `particleRise ${p.dur}ms ${p.delay}ms infinite ease-in`, boxShadow: `0 0 ${p.size * 2}px rgba(240,192,96,0.8)` }} />)}
        </div>
    );
}

const initInv = () => [{ ...CONSUMABLES[0], qty: 2 }, { ...CONSUMABLES[2], qty: 1 }];
const initEq = () => ({ head: null, weapon: null, body: null, ring: null, trinket: null });

const CSS = `
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #000; overflow-x: hidden; }
    @keyframes floatUp{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-40px)}}
    @keyframes particleRise{0%{opacity:0;transform:translateY(0)}20%{opacity:1}80%{opacity:.6}100%{opacity:0;transform:translateY(-120px)}}
    @keyframes glow{0%,100%{text-shadow:0 0 10px #f0c06088,0 0 20px #f0c06044}50%{text-shadow:0 0 20px #f0c060cc,0 0 40px #f0c06088}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
    @keyframes flashRed{0%,100%{filter:none}50%{filter:brightness(1.8) saturate(2)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.5}}
    @keyframes slashAnim{0%{opacity:0;transform:translateX(-60%) skewX(-20deg) scaleX(0.2)}30%{opacity:1;transform:translateX(0%) skewX(-10deg) scaleX(1)}70%{opacity:0.8}100%{opacity:0;transform:translateX(20%) scaleX(1.1)}}
    @keyframes fireAnim{0%{opacity:0;transform:scale(0.5) translateY(10px)}30%{opacity:1;transform:scale(1.2) translateY(-5px)}70%{opacity:0.7;transform:scale(1) translateY(-10px)}100%{opacity:0;transform:scale(0.8) translateY(-20px)}}
    @keyframes arcaneAnim{0%{opacity:0;transform:scale(0.3) rotate(-20deg)}25%{opacity:1;transform:scale(1.15) rotate(5deg)}60%{opacity:0.8;transform:scale(1) rotate(0deg)}100%{opacity:0;transform:scale(1.3) rotate(10deg)}}
    @keyframes holyAnim{0%{opacity:0;transform:scale(0.4)}25%{opacity:1;transform:scale(1.2)}65%{opacity:0.9;transform:scale(1)}100%{opacity:0;transform:scale(1.4)}}
    @keyframes darkAnim{0%{opacity:0;transform:scale(1.2)}30%{opacity:1;transform:scale(0.95)}70%{opacity:0.8}100%{opacity:0;transform:scale(0.7) translateY(8px)}}
    @keyframes drainAnim{0%{opacity:0;transform:scale(0.5)}20%{opacity:1;transform:scale(1.1)}50%{opacity:0.9}80%{opacity:0.5}100%{opacity:0;transform:scale(0.8)}}
    @keyframes arrowAnim{0%{opacity:0;transform:translateX(-80%) scaleX(0.3)}25%{opacity:1;transform:translateX(0) scaleX(1)}60%{opacity:0.8}100%{opacity:0;transform:translateX(15%)}}
    @keyframes healAnim{0%{opacity:0;transform:scale(0.5) translateY(5px)}25%{opacity:1;transform:scale(1.1) translateY(-5px)}60%{opacity:0.9;transform:scale(1) translateY(-8px)}100%{opacity:0;transform:scale(1.2) translateY(-14px)}}
    @keyframes poisonAnim{0%{opacity:0;transform:scale(0.6)}30%{opacity:1;transform:scale(1.05)}70%{opacity:0.7}100%{opacity:0;transform:scale(0.9) translateY(6px)}}
    @keyframes buffAnim{0%{opacity:0;transform:scale(0.6) translateY(6px)}20%{opacity:1;transform:scale(1.15) translateY(-4px)}55%{opacity:1;transform:scale(1) translateY(0)}85%{opacity:0.6}100%{opacity:0;transform:scale(1.1) translateY(-6px)}}
    @keyframes debuffAnim{0%{opacity:0;transform:scale(1.1)}20%{opacity:1;transform:scale(0.95)}55%{opacity:0.9;transform:scale(1)}85%{opacity:0.5}100%{opacity:0;transform:scale(0.85) translateY(5px)}}
  `;

// ── Helper: build champion object from game state ──────────────────────────
function buildChampion(playerTitle, playerClass, level, gold, encounters, player, equipped, relics, effStatsFn, getRelicBonusFn) {
    const ep = effStatsFn(player, equipped);
    const rb = getRelicBonusFn();
    return {
        playerTitle,
        playerClass,
        level,
        gold,
        encounters,
        date: new Date().toLocaleDateString("sv-SE"),
        stats: {
            hp: player.maxHp, maxHp: player.maxHp,
            mp: player.maxMp, maxMp: player.maxMp,
            atk: ep.atk + rb.atk,
            def: ep.def + rb.def,
            spd: (ep.spd || 0) + rb.spd,
            crit: (ep.crit || 2) + rb.crit,
            manaRegen: ep.manaRegen + rb.manaRegen,
        },
        equippedNames: Object.fromEntries(
            Object.entries(equipped).filter(([, v]) => v).map(([k, v]) => [k, v.name])
        ),
        equippedIds: Object.fromEntries(
            Object.entries(equipped).filter(([, v]) => v).map(([k, v]) => [k, v.id])
        ),
        relicNames: relics.map(r => r.name),
    };
}

// ── VictoryScreen ───────────────────────────────────────────────────────────
function VictoryScreen({ player, playerTitle, playerClass, level, gold, encounters, equipped, relics, effStats, getRelicBonus, reset, challengeOnVictory }) {
    const [champName, setChampName] = useState("");
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");
    const [copyMsg, setCopyMsg] = useState("");
    const [savedChamp, setSavedChamp] = useState(null);

    const handleSave = async () => {
        if (saving || saved) return;
        setSaving(true);
        try {
            const name = champName.trim() || playerTitle;
            const champ = buildChampion(name, playerClass, level, gold, encounters, player, equipped, relics, effStats, getRelicBonus);
            const docRef = await addDoc(collection(db, "champions"), champ);
            champ.id = docRef.id;
            setSavedChamp(champ);
            setSaved(true);
            setSaveMsg("Champion immortalized! ✅");
        } catch (e) {
            setSaveMsg("Failed to save. Check connection.");
        }
        setSaving(false);
    };

    const handleCopyLink = () => {
        if (!savedChamp) return;
        const encoded = btoa(JSON.stringify(savedChamp));
        const url = `${window.location.origin}${window.location.pathname}?challenge=${encoded}`;
        navigator.clipboard.writeText(url);
        setCopyMsg("Copied!"); setTimeout(() => setCopyMsg(""), 2000);
    };

    const cls = CLASSES[playerClass];
    return (
        <div style={{ background: "linear-gradient(160deg,#0a0a00,#1a1800,#0d0d00)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Georgia", color: "#eee", padding: 20, paddingTop: 28 }}>
            <style>{CSS}</style>
            <div style={{ fontSize: 48, filter: "drop-shadow(0 0 16px #f0c06099)" }}>🏆</div>
            <h2 style={{ color: "#f0c060", fontSize: 20, animation: "glow 2s infinite", marginBottom: 4 }}>The Abyss is Vanquished!</h2>
            <p style={{ color: "#ccc", textAlign: "center" }}>{playerTitle}</p>
            <p style={{ color: "#666", fontSize: 10, marginBottom: 10 }}>Level {level} · {gold} Gold · {encounters} battles</p>
            {playerClass && <ClassPortrait className={playerClass} size={100} style={{ margin: "0 auto 14px" }} />}
            <div style={{ background: "#ffffff08", borderRadius: 10, padding: 12, textAlign: "left", width: "100%", maxWidth: 340, marginBottom: 12 }}>
                <div style={{ color: "#f0c060", fontWeight: "bold", fontSize: 12, marginBottom: 8 }}>🎽 Final Equipment</div>
                {["head", "weapon", "body", "ring", "trinket"].map(slot => (
                    <div key={slot} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, fontSize: 11 }}>
                        <span style={{ color: "#555", textTransform: "capitalize", width: 46, flexShrink: 0 }}>{slot}:</span>
                        {equipped[slot] ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <ItemPortrait itemId={equipped[slot].id} size={28} />
                                <span style={{ color: "#eee" }}>{equipped[slot].name}</span>
                            </div>
                        ) : <span style={{ color: "#333" }}>—</span>}
                    </div>
                ))}
                {relics.map((r, i) => <div key={i} style={{ fontSize: 10, color: "#ffcc44", marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}><ItemPortrait itemId={r.id} size={24} />{r.name}</div>)}
            </div>
            {!saved ? (
                <div style={{ width: "100%", maxWidth: 340, background: "#ffffff08", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    <div style={{ color: "#f0c060", fontWeight: "bold", fontSize: 12, marginBottom: 6 }}>⚔️ Immortalize Your Champion</div>
                    <div style={{ color: "#666", fontSize: 10, marginBottom: 8 }}>Save to the global Hall of Champions and challenge others!</div>
                    <input value={champName} onChange={e => setChampName(e.target.value)} placeholder={playerTitle} maxLength={32}
                        style={{ width: "100%", padding: "6px 10px", background: "#0d0d1a", border: "1px solid #f0c06055", borderRadius: 6, color: "#eee", fontFamily: "Georgia", fontSize: 11, marginBottom: 8, boxSizing: "border-box" }} />
                    <button onClick={handleSave} disabled={saving || encounters > 12}
                        style={{ width: "100%", padding: "8px", background: saving ? "#333" : "linear-gradient(90deg,#8a6000,#f0c060)", color: saving ? "#666" : "#0d0d0a", border: "none", borderRadius: 7, fontSize: 12, cursor: saving ? "default" : "pointer", fontFamily: "Georgia", fontWeight: "bold" }}>
                        {encounters > 12 ? "⚠️ Duel winners cannot save (beat main game only)" : saving ? "Saving..." : "🏆 Save to Hall of Champions"}
                    </button>
                    {saveMsg && <div style={{ color: "#ff8060", fontSize: 10, marginTop: 5, textAlign: "center" }}>{saveMsg}</div>}
                </div>
            ) : (
                <div style={{ width: "100%", maxWidth: 340, background: "#ffffff08", borderRadius: 10, padding: 12, marginBottom: 12, textAlign: "center" }}>
                    <div style={{ color: "#60f060", fontSize: 12, marginBottom: 6 }}>{saveMsg}</div>
                    <div style={{ color: "#666", fontSize: 10, marginBottom: 8 }}>Share this link to challenge others:</div>
                    <button onClick={handleCopyLink}
                        style={{ width: "100%", padding: "8px", background: "linear-gradient(90deg,#004488,#0080ff)", color: "#fff", border: "none", borderRadius: 7, fontSize: 11, cursor: "pointer", fontFamily: "Georgia", fontWeight: "bold" }}>
                        {copyMsg ? "✅ " + copyMsg : "📋 Copy Challenge Link"}
                    </button>
                </div>
            )}
            {challengeOnVictory && (
                <div style={{ width: "100%", maxWidth: 340, background: "linear-gradient(140deg,#1a0008,#2a0010)", border: "1px solid #ff446644", borderRadius: 10, padding: 12, marginBottom: 12, textAlign: "center" }}>
                    <div style={{ color: "#ff4466", fontWeight: "bold", fontSize: 12, marginBottom: 4 }}>⚔️ Pending Challenge!</div>
                    <div style={{ color: "#888", fontSize: 10, marginBottom: 8 }}>{challengeOnVictory.playerTitle} awaits your challenge.</div>
                    <button onClick={() => window.dispatchEvent(new CustomEvent("startDuel", { detail: challengeOnVictory }))}
                        style={{ width: "100%", padding: "8px", background: "linear-gradient(90deg,#880000,#cc2222)", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, cursor: "pointer", fontFamily: "Georgia", fontWeight: "bold" }}>
                        ⚔️ Fight {challengeOnVictory.playerTitle}!
                    </button>
                </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => window.dispatchEvent(new CustomEvent("gotoHall"))}
                    style={{ padding: "7px 16px", background: "#ffffff10", color: "#f0c060", border: "1px solid #f0c06044", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "Georgia" }}>🏛️ Hall of Champions</button>
                <button onClick={reset}
                    style={{ padding: "7px 16px", background: "linear-gradient(90deg,#c0a020,#f0c060)", color: "#0d0d0a", border: "none", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "Georgia", fontWeight: "bold" }}>Play Again</button>
            </div>
        </div>
    );
}

// ── HallScreen ───────────────────────────────────────────────────────────────
function HallScreen({ reset }) {
    const [champions, setChampions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copyIdx, setCopyIdx] = useState(null);
    const [challenge, setChallenge] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const q = query(collection(db, "champions"), orderBy("date", "desc"));
                const snap = await getDocs(q);
                setChampions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch { setChampions([]); }
            setLoading(false);
        })();
    }, []);

    const handleCopyChallenge = (champ, i) => {
        const encoded = btoa(JSON.stringify(champ));
        const url = `${window.location.origin}${window.location.pathname}?challenge=${encoded}`;
        navigator.clipboard.writeText(url);
        setCopyIdx(i); setTimeout(() => setCopyIdx(null), 2000);
    };

    const cls = challenge ? CLASSES[challenge.playerClass] : null;
    return (
        <div style={{ background: "linear-gradient(160deg,#050510,#0d0d1a)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Georgia", color: "#eee", padding: 20, paddingTop: 28 }}>
            <style>{CSS}</style>
            <div style={{ fontSize: 36, filter: "drop-shadow(0 0 14px #f0c06099)" }}>🏛️</div>
            <h2 style={{ color: "#f0c060", fontSize: 18, animation: "glow 2s infinite", marginBottom: 2 }}>Hall of Champions</h2>
            <p style={{ color: "#555", fontSize: 10, marginBottom: 16, letterSpacing: 1 }}>THOSE WHO CONQUERED THE REALM</p>
            {loading ? (
                <div style={{ color: "#444", fontSize: 12, marginTop: 40 }}>Loading champions...</div>
            ) : champions.length === 0 ? (
                <div style={{ color: "#444", fontSize: 12, marginTop: 40 }}>No champions yet. Be the first to conquer the Realm!</div>
            ) : (
                <div style={{ width: "100%", maxWidth: 500, display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                    {champions.map((champ, i) => {
                        const c = CLASSES[champ.playerClass];
                        return (
                            <div key={champ.id} style={{ background: "linear-gradient(140deg,#0d0d1a,#15152a)", border: `1px solid ${c?.color || "#444"}44`, borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                                <ClassPortrait className={champ.playerClass} size={48} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: c?.color || "#f0c060", fontWeight: "bold", fontSize: 12 }}>{champ.playerTitle}</div>
                                    <div style={{ color: "#555", fontSize: 9 }}>Lv.{champ.level} · {champ.encounters} battles · {champ.date}</div>
                                    <div style={{ color: "#777", fontSize: 9, marginTop: 2 }}>❤️{champ.stats?.hp} ⚔️{champ.stats?.atk} 🛡️{champ.stats?.def} 💨{champ.stats?.spd}</div>
                                </div>
                                <button onClick={() => handleCopyChallenge(champ, i)}
                                    style={{ padding: "6px 10px", background: copyIdx === i ? "linear-gradient(90deg,#006600,#00aa00)" : "linear-gradient(90deg,#880000,#cc2222)", color: "#fff", border: "none", borderRadius: 7, fontSize: 10, cursor: "pointer", fontFamily: "Georgia", fontWeight: "bold", whiteSpace: "nowrap" }}>
                                    {copyIdx === i ? "✅ Copied!" : "⚔️ Challenge"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
            <button onClick={reset}
                style={{ padding: "7px 20px", background: "#ffffff10", color: "#888", border: "1px solid #333", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "Georgia" }}>← Back to Menu</button>
        </div>
    );
}

export default function App() {
    const [screen, setScreen] = useState("title");
    const [pendingCls, setPendingCls] = useState(null);
    const [charName, setCharName] = useState("");
    const [playerClass, setPlayerClass] = useState(null);
    const [playerTitle, setPlayerTitle] = useState("");
    const [player, setPlayer] = useState(null);
    const [enemy, setEnemy] = useState(null);
    const [savedEnemy, setSavedEnemy] = useState(null);
    const [zone, setZone] = useState(0);
    const [log, setLog] = useState([]);
    const [finalLog, setFinalLog] = useState([]);
    const [turn, setTurn] = useState("player");
    const [combat, setCombat] = useState(false);
    const [inventory, setInventory] = useState(initInv());
    const [equipped, setEquipped] = useState(initEq());
    const [relics, setRelics] = useState([]);
    const [gold, setGold] = useState(50);
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [buffs, setBuffs] = useState({ player: [], enemy: [] });
    const [se, setSe] = useState({ burn: 0, stunned: false, dodgeReady: false, flightBonus: 0, enemyDot: 0, playerPoison: 0, plagueDot: 0, enemyBlind: 0, demonPactBonus: 0, cursedPlateOn: false, frailCurse: 0 });
    const [encounters, setEncounters] = useState(0);
    const [defeatedUniques, setDefeatedUniques] = useState([]);
    const [showShop, setShowShop] = useState(false);
    const [shopTab, setShopTab] = useState("consumables");
    const [showEquip, setShowEquip] = useState(false);
    const [lvlUp, setLvlUp] = useState(false);
    const [lootNotif, setLootNotif] = useState(null);
    const [lootQueue, setLootQueue] = useState([]);
    const [showingLoot, setShowingLoot] = useState(false);
    const [shopMsg, setShopMsg] = useState("");
    const [playerFloats, setPlayerFloats] = useState([]);
    const [enemyFloats, setEnemyFloats] = useState([]);
    const [trinketUsed, setTrinketUsed] = useState(false);
    const [hitFlash, setHitFlash] = useState(null);
    const [combatAnim, setCombatAnim] = useState(null); // { target: "enemy"|"player", type: "slash"|"fire"|"arcane"|"holy"|"dark"|"poison"|"arrow"|"heal"|"drain" }
    const [challengeOnVictory, setChallengeOnVictory] = useState(null);
    const [defeatedEnemy, setDefeatedEnemy] = useState(null); // holds slain enemy while loot shows
    const [pendingVictory, setPendingVictory] = useState(null); // deferred post-loot action

    // Hall nav event + challenge URL parsing
    useEffect(() => {
        const goHall = () => setScreen("hall");
        window.addEventListener("gotoHall", goHall);
        const onStartDuel = (e) => {
            const champ = e.detail;
            const champEnemy = {
                name: champ.playerTitle,
                id: champ.playerClass?.toLowerCase().replace(/ /g, "_") || "champion",
                hp: champ.stats.hp, maxHp: champ.stats.hp,
                atk: champ.stats.atk, def: champ.stats.def,
                xp: 0, gold: 0, style: "duel", champClass: champ.playerClass, crit: champ.stats.crit || 5,
            };
            setEnemy(champEnemy);
            setSavedEnemy({ ...champEnemy });
            setCombat(true);
            setBuffs({ player: [], enemy: [] });
            setSe({ burn: 0, stunned: false, dodgeReady: false, flightBonus: 0, enemyDot: 0, playerPoison: 0, plagueDot: 0, enemyBlind: 0, demonPactBonus: 0, cursedPlateOn: hasP(equipped, "cursedPlate"), frailCurse: 0 });
            setTurn("player");
            setLog([{ msg: `⚔️ Duel begins! ${playerTitle} vs ${champ.playerTitle}!`, color: "#ff4466" }]);
            setScreen("explore");
        };
        window.addEventListener("startDuel", onStartDuel);
        // Parse challenge link
        try {
            const params = new URLSearchParams(window.location.search);
            const enc = params.get("challenge");
            if (enc) {
                const champ = JSON.parse(atob(enc));
                setChallengeOnVictory(champ);
                setScreen("challengeIntro");
            }
        } catch {}
        return () => { window.removeEventListener("gotoHall", goHall); window.removeEventListener("startDuel", onStartDuel); };
    }, []);
    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(200);
    useEffect(() => {
        if (!headerRef.current) return;
        const obs = new ResizeObserver(() => {
            if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
        });
        obs.observe(headerRef.current);
        return () => obs.disconnect();
    }, []);
    const floatId = useRef(0);
    const logRef = useRef(null);

    const addLog = (msg, color = "#ccc") => setLog(l => [...l, { msg, color }]);
    useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);
    const spawnFloat = (t, text, color) => { const id = floatId.current++; const s = t === "player" ? setPlayerFloats : setEnemyFloats; s(f => [...f, { id, text, color }]); setTimeout(() => s(f => f.filter(x => x.id !== id)), 1300); };
    const flash = t => { setHitFlash(t); setTimeout(() => setHitFlash(null), 300); };
    const triggerAnim = (target, type) => { setCombatAnim({ target, type }); setTimeout(() => setCombatAnim(null), 700); };
    const notify = (msg, icon, desc, type) => {
        setLootQueue(q => [...q, { msg, icon, desc, type: type || "item" }]);
    };

    const reset = () => { setScreen("title"); setPendingCls(null); setCharName(""); setPlayerClass(null); setPlayerTitle(""); setPlayer(null); setEnemy(null); setSavedEnemy(null); setZone(0); setLog([]); setFinalLog([]); setTurn("player"); setCombat(false); setInventory(initInv()); setEquipped(initEq()); setRelics([]); setGold(50); setXp(0); setLevel(1); setBuffs({ player: [], enemy: [] }); setSe({ burn: 0, stunned: false, dodgeReady: false, flightBonus: 0, enemyDot: 0, playerPoison: 0, plagueDot: 0, enemyBlind: 0, demonPactBonus: 0, cursedPlateOn: false, frailCurse: 0 }); setEncounters(0); setDefeatedUniques([]); setLvlUp(false); setLootNotif(null); setLootQueue([]); setShopMsg(""); setShowShop(false); setShowEquip(false); setPlayerFloats([]); setEnemyFloats([]); setTrinketUsed(false); setHitFlash(null); setCombatAnim(null); setDefeatedEnemy(null); setPendingVictory(null); };

    const selectClass = cls => { setPendingCls(cls); setCharName(""); setScreen("naming"); };
    const randomName = () => { const n = CLASS_NAMES[pendingCls]; setCharName(n[rand(0, n.length - 1)]); };
    const confirmName = () => { const name = charName.trim() || CLASS_NAMES[pendingCls][rand(0, 9)]; const title = `${name}, the ${pendingCls}`; setPlayerTitle(title); setPlayerClass(pendingCls); setPlayer({ ...CLASSES[pendingCls].stats }); setLog([{ msg: `${title} enters the Whispering Forest...`, color: "#f0c060" }]); setScreen("explore"); };

    const unequipSlot = slot => {
        const item = equipped[slot];
        if (!item) return;
        const { np, newEq } = doUnequip(slot, equipped, player);
        setEquipped(newEq);
        setPlayer(np);
        const alreadyInBag = inventory.some(i => i.id === item.id && i.isGear);
        if (!alreadyInBag) setInventory(inv => [...inv, { ...item, qty: 1, isGear: true }]);
        addLog(`Unequipped ${item.name} → moved to bag.`, "#aaa");
    };
    const equipFromBag = (item) => {
        const oldEquipped = equipped[item.slot];
        const { np: np2, newEq } = doEquip(item, equipped, player);
        setEquipped(newEq);
        setPlayer(np2);
        setInventory(inv => {
            let newInv = inv.filter(i => !(i.id === item.id && i.isGear));
            if (oldEquipped) newInv = [...newInv, { ...oldEquipped, qty: 1, isGear: true }];
            return newInv;
        });
        addLog(`🎽 Equipped ${item.icon} ${item.name}${oldEquipped ? ` (swapped from ${oldEquipped.name})` : ""}!`, "#c060f0");
    };
    const getRelicBonus = () => { const b = { atk: 0, def: 0, maxHp: 0, maxMp: 0, crit: 0, manaRegen: 0, spd: 0 }; relics.forEach(r => { if (r.stats) Object.entries(r.stats).forEach(([k, v]) => { b[k] = (b[k] || 0) + v; }); }); return b; };

    const applyLoot = (loot, np, eq, inv, g, rl) => {
        if (!loot) return { np, inv, g, rl };
        if (loot.type === "gold") { const amt = rand(loot.amount[0], loot.amount[1]); addLog(`🪙 +${amt} Gold!`, "#f0c060"); notify(`+${amt} Gold`, "🪙", null, "gold"); return { np, inv, g: g + amt, rl }; }
        if (loot.type === "monsterLoot") {
            const pool = MONSTER_LOOT.filter(m => m.tier <= zone); if (!pool.length) return { np, inv, g, rl }; if (rand(1, 100) > 40) return { np, inv, g, rl };
            const ml = pool[rand(0, pool.length - 1)];
            const rItem = [...MONSTER_RELICS, ...TRINKETS].find(x => x.id === ml.id);
            if (!rItem) return { np, inv, g, rl };
            if (ml.type === "trinket" && !eq.trinket) { const { np: nnp, newEq } = doEquip({ ...rItem, slot: "trinket" }, eq, np); setEquipped(newEq); addLog(`✨ Trinket: ${rItem.icon} ${rItem.name} (Equipped!)`, "#ff88ff"); notify(rItem.name, rItem.icon, rItem.desc, "equip"); return { np: nnp, inv, g, rl }; }
            if (ml.type === "relic" && rItem.type === "consumable") { addLog(`✨ Loot: ${rItem.icon} ${rItem.name}!`, "#60f0a0"); notify(rItem.name, rItem.icon, rItem.desc, "consumable"); const ex = inv.find(i => i.id === rItem.id); return { np, inv: ex ? inv.map(i => i.id === rItem.id ? { ...i, qty: i.qty + 1 } : i) : [...inv, { ...rItem, qty: 1 }], g, rl }; }
            if (ml.type === "relic" && rItem.type === "passive") { addLog(`✨ Relic: ${rItem.icon} ${rItem.name}!`, "#ffcc44"); notify(rItem.name, rItem.icon, rItem.desc, "relic"); return { np, inv, g, rl: [...rl, rItem] }; }
            if (ml.type === "trinket") { addLog(`✨ Trinket: ${rItem.icon} ${rItem.name}!`, "#ff88ff"); notify(`${rItem.icon} ${rItem.name}`); const ex = inv.find(i => i.id === rItem.id); return { np, inv: ex ? inv.map(i => i.id === rItem.id ? { ...i, qty: i.qty + 1 } : i) : [...inv, { ...rItem, qty: 1 }], g, rl }; }
            return { np, inv, g, rl };
        }
        if (loot.type === "consumable") { const item = CONSUMABLES.find(c => c.id === loot.id); if (!item) return { np, inv, g, rl }; if (item.id === "revive" && inv.some(i => i.id === "revive" && i.qty > 0)) return { np, inv, g, rl }; addLog(`✨ Loot: ${item.icon} ${item.name}!`, "#60f0a0"); notify(item.name, item.icon, item.desc, "consumable"); const ex = inv.find(i => i.id === item.id && !i.isGear); return { np, inv: ex ? inv.map(i => i.id === item.id && !i.isGear ? { ...i, qty: i.qty + 1 } : i) : [...inv, { ...item, qty: 1 }], g, rl }; }
        if (loot.type === "equipment") { const item = EQUIPMENT.find(e => e.id === loot.id); if (!item) return { np, inv, g, rl }; if (!eq[item.slot]) { const { np: nnp, newEq } = doEquip(item, eq, np); setEquipped(newEq); addLog(`✨ Loot: ${item.icon} ${item.name} (Auto-equipped!)`, "#c060f0"); notify(item.name, item.icon, item.desc, "equip"); return { np: nnp, inv, g, rl }; } const alreadyInInv = inv.some(i => i.id === item.id && i.isGear); if (!alreadyInInv) { addLog(`✨ Loot: ${item.icon} ${item.name} (Saved to bag!)`, "#c060f0"); notify(item.name, item.icon, item.desc, "bag"); return { np, inv: [...inv, { ...item, qty: 1, isGear: true }], g, rl }; } addLog(`✨ Loot: ${item.icon} ${item.name} (Already have one)`, "#888"); return { np, inv, g, rl }; }
        return { np, inv, g, rl };
    };

    const getNextEnemy = (z, du) => {
        if (z === 3) { const next = ENEMIES_BY_ZONE[3].find(e => !du.includes(e.uniqueId)); return next ? { ...next, raged: false, deathMarked: false } : null; }
        const pool = ENEMIES_BY_ZONE[z]; return { ...pool[rand(0, pool.length - 1)] };
    };

    const startCombat = () => {
        if (lvlUp) return;
        const e = getNextEnemy(zone, defeatedUniques); if (!e) return;
        let ef = { ...e }; if (ef.minorSuffix === "armored") ef = { ...ef, def: ef.def + 6 };
        setDefeatedEnemy(null); setPendingVictory(null);
        setEnemy(ef); setSavedEnemy({ ...ef }); setCombat(true); setBuffs({ player: [], enemy: [] });
        setSe({ burn: 0, stunned: false, dodgeReady: false, flightBonus: 0, enemyDot: 0, playerPoison: 0, plagueDot: 0, enemyBlind: 0, demonPactBonus: 0, cursedPlateOn: hasP(equipped, "cursedPlate"), frailCurse: 0 });
        setTurn("player"); setPlayerFloats([]); setEnemyFloats([]); setTrinketUsed(false);
        const tags = [e.unique ? "💠 UNIQUE" : "", e.elite ? "⚡ ELITE" : "", e.affix ? `[${AFFIX_LABELS[e.affix]}]` : "", e.affix2 ? `[${AFFIX_LABELS[e.affix2]}]` : "", e.minorSuffix ? `[${MINOR_SUFFIXES[e.minorSuffix].label}]` : ""].filter(Boolean).join(" ");
        addLog(`⚔️ ${ef.name} appears! ${tags}`, e.unique ? "#ff8844" : e.elite ? "#ffaa00" : "#ff6060");
    };

    const calcDmg = (raw, def) => Math.max(1, raw - Math.floor(def / 2));
    const isCrit = pct => rand(1, 100) <= pct;

    const resolveVictory = (np, ne, nb, inv, g, eq, cse, rl) => {
        addLog(`🏆 ${ne.name} defeated! +${ne.xp} XP, +${ne.gold} Gold`, "#f0c060"); if (ne.gold > 0) notify(`+${ne.gold} Gold`, "🪙", null, "gold");
        const hpRec = Math.floor(np.maxHp * (rand(15, 20) / 100)); const mpRec = Math.floor(np.maxMp * (rand(15, 20) / 100));
        np.hp = clamp(np.hp + hpRec, 0, np.maxHp); np.mp = clamp(np.mp + mpRec, 0, np.maxMp);
        addLog(`💫 Recovered ${hpRec} HP, ${mpRec} MP.`, "#a0f0c0");
        const earnedXp = xp + ne.xp, earnedGold = g + ne.gold;
        let newDU = [...defeatedUniques]; if (ne.unique) newDU = [...newDU, ne.uniqueId]; setDefeatedUniques(newDU);
        const loot = rand(1, 100) <= 65 ? LOOT_TABLES[zone][rand(0, LOOT_TABLES[zone].length - 1)] : null;
        const { np: fnp, inv: finv, g: fg, rl: frl } = applyLoot(loot, np, eq, inv, earnedGold, rl);
        const newEnc = encounters + 1; setEncounters(newEnc); setXp(earnedXp); setGold(fg); setInventory(finv); setRelics(frl);
        // Keep the dead enemy visible (grayed out) while loot popups show
        setDefeatedEnemy({ ...ne });
        setCombat(false); setEnemy(null); setSe({ burn: 0, stunned: false, dodgeReady: false, flightBonus: 0, enemyDot: 0, playerPoison: 0, plagueDot: 0, enemyBlind: 0, demonPactBonus: 0, cursedPlateOn: false, frailCurse: 0 });
        setFinalLog(l => l.length ? l : [...log]);
        setPlayer(fnp); setBuffs(nb);
        // Store what should happen after all loot popups are dismissed
        let afterLoot = null;
        if (earnedXp >= level * 60) afterLoot = "levelup";
        else if (newEnc >= 12) afterLoot = "victory";
        else if (newEnc % 3 === 0) {
            const nz = Math.min(3, zone + 1); setZone(nz);
            addLog(`🗺️ Descending into ${ZONES[nz].name}...`, nz === 3 ? "#ff4400" : "#60c0f0");
        }
        setPendingVictory(afterLoot);
        // If no loot popups will appear, just fire the transition after a short pause
        // The corpse stays until startCombat clears it
        if (!loot && ne.gold <= 0) {
            setTimeout(() => {
                if (afterLoot === "levelup") { setLvlUp(true); setPendingVictory(null); }
                else if (afterLoot === "victory") { setScreen("victory"); setPendingVictory(null); }
                else { setPendingVictory(null); }
            }, 1800);
        }
    };

    const useTrinket = () => {
        if (trinketUsed || !equipped.trinket) return;
        const t = equipped.trinket; let np = { ...player };
        if (t.activeType === "blind") { setSe(s => ({ ...s, enemyBlind: 2 })); addLog(`${t.icon} ${t.activeName}! Enemy 25% miss x 2!`, "#ff88ff"); }
        else if (t.activeType === "mpSurge") { np.mp = clamp(np.mp + 25, 0, np.maxMp); spawnFloat("player", "+25💧", "#60c0ff"); addLog(`${t.icon} ${t.activeName}! +25 MP!`, "#60c0ff"); }
        else if (t.activeType === "mend") { np.hp = clamp(np.hp + 35, 0, np.maxHp); spawnFloat("player", "+35❤️", "#ff6090"); addLog(`${t.icon} ${t.activeName}! +35 HP!`, "#ff6090"); }
        setPlayer(np); setTrinketUsed(true);
    };

    const playerAction = (type, payload) => {
        if (turn !== "player" || !combat) return;
        if (se.stunned) { addLog("💀 Stunned — turn lost!", "#ff4444"); setSe(s => ({ ...s, stunned: false })); setTurn("enemy"); setTimeout(() => enemyTurn({ ...player }, { ...enemy }, { player: [...buffs.player], enemy: [...buffs.enemy] }, [...inventory], gold, { ...equipped }, { ...se, stunned: false }, [...relics]), 900); return; }
        let np = { ...player }, ne = { ...enemy }, nb = { player: [...buffs.player], enemy: [...buffs.enemy] };
        let inv = [...inventory], g = gold, eq = { ...equipped }, cse = { ...se }, rl = [...relics];
        const ep = effStats(np, eq); const rb = getRelicBonus();
        const totalAtk = ep.atk + rb.atk + nb.player.filter(b => b.stat === "atk" && b.amount > 0).reduce((s, b) => s + b.amount, 0);
        const totalDef = ep.def + rb.def + nb.player.filter(b => b.stat === "def" && b.amount > 0).reduce((s, b) => s + b.amount, 0);
        const totalSpd = (ep.spd || 0) + rb.spd + nb.player.filter(b => b.stat === "spd" && b.amount > 0).reduce((s, b) => s + b.amount, 0);
        const spdMult = 1 + totalSpd * 0.015;
        const totalCrit = (ep.crit || 2) + rb.crit;
        if (hasP(eq, "holyAura")) { np.hp = clamp(np.hp + 2, 0, np.maxHp); spawnFloat("player", "+2✨", "#f0f060"); }
        if (cse.cursedPlateOn) { np.hp = clamp(np.hp - 3, 0, np.maxHp); spawnFloat("player", "-3💀", "#cc2222"); if (np.hp <= 0) { setPlayer(np); setFinalLog([...log]); setScreen("gameover"); return; } }
        if (cse.burn > 0) { np.hp = clamp(np.hp - 3, 0, np.maxHp); cse.burn--; spawnFloat("player", "-3🔥", "#ff6030"); if (np.hp <= 0) { setPlayer(np); setFinalLog([...log]); setScreen("gameover"); return; } }
        if (cse.playerPoison > 0) { np.hp = clamp(np.hp - 3, 0, np.maxHp); cse.playerPoison--; spawnFloat("player", "-3🐍", "#80ff80"); if (np.hp <= 0) { setPlayer(np); setFinalLog([...log]); setScreen("gameover"); return; } }
        if (cse.plagueDot > 0) { const pd = Math.max(1, Math.floor(np.maxHp * 0.15)); np.hp = clamp(np.hp - pd, 0, np.maxHp); cse.plagueDot--; spawnFloat("player", `-${pd}☣️`, "#cc44ff"); if (np.hp <= 0) { setPlayer(np); setFinalLog([...log]); setScreen("gameover"); return; } }
        if (cse.enemyDot > 0 && ne.hp > 0) { const dd = Math.max(1, Math.floor(ne.maxHp * 0.08)); ne.hp -= dd; cse.enemyDot--; spawnFloat("enemy", `-${dd}💀`, "#a0ffa0"); if (ne.hp <= 0) { setEnemy(ne); setPlayer(np); setTimeout(() => resolveVictory(np, ne, nb, inv, g, eq, cse, rl), 700); return; } }
        const regenBuff = nb.player.filter(b => b.stat === "manaRegen" && b.amount > 0).reduce((s, b) => s + b.amount, 0);
        const regen = (ep.manaRegen || 5) + rb.manaRegen + regenBuff; np.mp = clamp(np.mp + regen, 0, np.maxMp);
        const abilBonus = hasP(eq, "abilityBonus") ? 1.15 : 1.0;
        const healMult = ne.minorSuffix === "cursed" ? 0.7 : (cse.frailCurse > 0 ? 0.5 : 1.0);
        const demonMult = 1 + (cse.demonPactBonus || 0);

        const dealDmg = (dmg, label, critHit) => {
            if (ne.minorSuffix === "shadowed" && isCrit(20)) { spawnFloat("enemy", "DODGE!", "#8888ff"); addLog(`🌑 ${ne.name} dodges your attack!`, "#8888ff"); return 0; }
            if (miss()) { spawnFloat("player", "MISS!", "#888"); addLog(`You missed!`, "#888"); return 0; }
            ne.hp -= dmg; flash("enemy"); spawnFloat("enemy", `-${dmg}`, critHit ? "#ffdd00" : "#ff4444");
            addLog(`${label} hits for ${dmg}${critHit ? " 🎯 CRIT!" : ""}`, critHit ? "#ffdd00" : "#60f060"); return dmg;
        };

        if (type === "attack") {
            const c = isCrit(totalCrit); const raw = rand(totalAtk - 2, totalAtk + 5);
            const fb = cse.flightBonus > 0 ? Math.floor(raw * 0.3) : 0;
            const dmg = calcDmg(c ? Math.floor((raw + fb) * 1.5 * demonMult) : (raw + fb) * demonMult | 0, ne.def);
            dealDmg(dmg, "⚔️ Your attack", c); triggerAnim("enemy", "slash"); if (cse.flightBonus > 0) cse.flightBonus--;
            if (hasP(eq, "lifesteal")) { np.hp = clamp(np.hp + 5, 0, np.maxHp); spawnFloat("player", "+5🩸", "#ff6090"); }
            if (hasP(eq, "lifesteal2")) { np.hp = clamp(np.hp + 8, 0, np.maxHp); spawnFloat("player", "+8🩸", "#cc2222"); }
            if (ne.minorSuffix === "thorned") { const ref = Math.max(1, Math.floor(dmg * 0.15)); np.hp = clamp(np.hp - ref, 0, np.maxHp); spawnFloat("player", `-${ref}🌵`, "#88ff44"); }
        } else if (type === "ability") {
            const ab = payload;
            if (ab.type === "holyShield") { if (np.mp < ab.cost) { addLog("Not enough MP!", "#ff9060"); setPlayer(np); return; } if (nb.player.some(b => b.tag === "holyShield")) { addLog("⚔️ Holy Shield already active!", "#f0c060"); setPlayer(np); return; } np.mp -= ab.cost; const baseDefForShield = ep.def + rb.def; const db = Math.max(1, Math.floor(baseDefForShield * 0.5)); nb.player.push({ stat: "def", amount: db, turns: 6, tag: "holyShield" }); spawnFloat("player", `🛡️+${db}DEF`, "#f0c060"); triggerAnim("player", "shield"); addLog(`⚔️ Holy Shield! +${db} DEF for 6 turns!`, "#f0c060"); nb.player = nb.player.map(b => { if (b.tag === "holyShield" || b.tag === "demonPact" || b.tag === "darkSacrifice" || b.tag === "arcaneBoost") return b; return { ...b, turns: b.turns - 1 }; }).filter(b => b.turns > 0); setSe(cse); setPlayer(np); setBuffs(nb); setTurn("enemy"); setTimeout(() => enemyTurn(np, ne, nb, inv, g, eq, cse, rl), 900); return; }
            if (ab.type === "darkSacrifice") { const hc = Math.floor(np.hp * 0.20); if (np.hp - hc <= 0) { addLog("⚠️ Not enough HP!", "#ff6060"); setPlayer(np); return; } if (nb.player.some(b => b.tag === "darkSacrifice")) { addLog("💀 Dark Sacrifice already active!", "#cc2222"); setPlayer(np); return; } np.hp -= hc; spawnFloat("player", `-${hc}💀`, "#cc2222"); const baseAtkForSac = ep.atk + rb.atk; const baseDefForSac = ep.def + rb.def; const ab2 = Math.floor(baseAtkForSac * 0.5); const db2 = Math.floor(baseDefForSac * 0.5); nb.player.push({ stat: "atk", amount: ab2, turns: 6, tag: "darkSacrifice" }); nb.player.push({ stat: "def", amount: db2, turns: 6, tag: "darkSacrifice" }); spawnFloat("player", `💀+${ab2}ATK+${db2}DEF`, "#cc2222"); triggerAnim("player", "power"); addLog(`💀 Dark Sacrifice! -${hc} HP => ATK+${ab2}, DEF+${db2} x 6!`, "#cc2222"); nb.player = nb.player.map(b => { if (b.tag === "holyShield" || b.tag === "demonPact" || b.tag === "darkSacrifice" || b.tag === "arcaneBoost") return b; return { ...b, turns: b.turns - 1 }; }).filter(b => b.turns > 0); setSe(cse); setPlayer(np); setBuffs(nb); setTurn("enemy"); setTimeout(() => enemyTurn(np, ne, nb, inv, g, eq, cse, rl), 900); return; }
            if (ab.type === "demonPact") { if (cse.demonPactBonus > 0) { addLog("👹 Demon Pact already active!", "#c060f0"); setPlayer(np); return; } np.mp -= ab.cost; cse.demonPactBonus = 0.30; nb.player.push({ stat: "atk", amount: 0, turns: 6, tag: "demonPact" }); spawnFloat("player", "👹+30%DMG", "#c060f0"); triggerAnim("player", "power"); addLog(`👹 Demon Pact! +30% dmg x 6 turns!`, "#c060f0"); nb.player = nb.player.map(b => { if (b.tag === "demonPact") return b; return { ...b, turns: b.turns - 1 }; }).filter(b => b.turns > 0); setSe(cse); setPlayer(np); setBuffs(nb); setTurn("enemy"); setTimeout(() => enemyTurn(np, ne, nb, inv, g, eq, cse, rl), 900); return; }
            if (np.mp < ab.cost) { addLog("Not enough MP!", "#ff9060"); setPlayer(np); return; }
            np.mp -= ab.cost;
            if (ab.type === "atk") { const c = isCrit(totalCrit); const atkBonus = Math.floor(totalAtk * 0.4); const raw = rand(ab.damage[0], ab.damage[1]) + atkBonus; const fb = cse.flightBonus > 0 ? Math.floor(raw * 0.3) : 0; const dmg = calcDmg(c ? Math.floor((raw + fb) * 1.5 * abilBonus * spdMult * demonMult) : Math.floor((raw + fb) * abilBonus * spdMult * demonMult), ne.def); dealDmg(dmg, `✨ Your ${ab.name}`, c); const animMap = { "Divine Strike": "holy", "Hellfire": "fire", "Arcane Bolt": "arcane", "Mana Burst": "arcane", "Snipe": "arrow" }; triggerAnim("enemy", animMap[ab.name] || "slash"); if (cse.flightBonus > 0) cse.flightBonus--; }
            else if (ab.type === "soulRend") { const c = isCrit(totalCrit); const atkBonus = Math.floor(totalAtk * 0.4); const raw = rand(ab.damage[0], ab.damage[1]) + atkBonus; const dmg = calcDmg(c ? Math.floor(raw * 1.5 * spdMult * demonMult) : Math.floor(raw * spdMult * demonMult), Math.floor(ne.def * 0.7)); dealDmg(dmg, "💀 Your Soul Rend", c); triggerAnim("enemy", "dark"); }
            else if (ab.type === "deathSuffering") { cse.enemyDot = 4; spawnFloat("enemy", "💀DoT", "#a0ffa0"); triggerAnim("enemy", "dark"); addLog("💀 Your Death's Suffering — 8% HP/turn x4!", "#a0ffa0"); }
            else if (ab.type === "heal") { const h = Math.floor(rand(-ab.damage[1], -ab.damage[0]) * healMult); np.hp = clamp(np.hp + h, 0, np.maxHp); spawnFloat("player", `+${h}`, "#60f0a0"); triggerAnim("player", "heal"); addLog(`💚 Your ${ab.name} restores ${h} HP`, "#60f0a0"); }
            else if (ab.type === "scaleHeal") { const pct = rand(Math.floor(ab.damage[0]*100), Math.floor(ab.damage[1]*100)) / 100; const h = Math.floor(np.maxHp * pct * healMult); np.hp = clamp(np.hp + h, 0, np.maxHp); spawnFloat("player", `+${h}`, "#60f0a0"); triggerAnim("player", "heal"); addLog(`💚 Your ${ab.name} restores ${h} HP (${Math.round(pct*100)}% MaxHP)`, "#60f0a0"); }
            else if (ab.type === "drain") { const atkBonus = Math.floor(totalAtk * 0.4); const raw = rand(ab.damage[0], ab.damage[1]) + atkBonus; const dmg = calcDmg(Math.floor(raw * abilBonus * spdMult * demonMult), ne.def); if (!miss()) { ne.hp -= dmg; flash("enemy"); const heal = Math.floor(dmg * healMult); np.hp = clamp(np.hp + heal, 0, np.maxHp); spawnFloat("enemy", `-${dmg}`, "#c060f0"); spawnFloat("player", `+${heal}`, "#c060f0"); triggerAnim("enemy", "drain"); addLog(`🩸 Your Soul Drain deals ${dmg} and steals ${heal} HP`, "#c060f0"); } else addLog("Your Soul Drain missed!", "#888"); }
            else if (ab.type === "arcaneBoost") { if (nb.player.some(b => b.tag === "arcaneBoost")) { addLog("🔮 Arcane Surge already active!", "#60c0f0"); setPlayer(np); return; } nb.player.push({ stat: "spd", amount: 14, turns: 6, tag: "arcaneBoost" }); nb.player.push({ stat: "manaRegen", amount: 5, turns: 6, tag: "arcaneBoost" }); spawnFloat("player", "🔮+14SPD +5MP/t", "#60c0f0"); triggerAnim("player", "arcane"); addLog(`🔮 Arcane Surge! +14 SPD, +5 MP/turn x 6!`, "#60c0f0"); nb.player = nb.player.map(b => { if (b.tag === "holyShield" || b.tag === "demonPact" || b.tag === "darkSacrifice" || b.tag === "arcaneBoost") return b; return { ...b, turns: b.turns - 1 }; }).filter(b => b.turns > 0); setSe(cse); setPlayer(np); setBuffs(nb); setTurn("enemy"); setTimeout(() => enemyTurn(np, ne, nb, inv, g, eq, cse, rl), 900); return; }
            else if (ab.type === "buff") { nb.player.push({ ...ab.buff }); addLog(`✨ ${ab.name}!`, "#f0f060"); }
            else if (ab.type === "debuff") { nb.enemy.push({ ...ab.debuff }); addLog(`💨 ${ab.name}! Enemy ATK reduced.`, "#60f0a0"); }
            else if (ab.type === "smokeBomb") { const reduction = Math.floor(ne.atk * 0.30); nb.enemy.push({ stat: "atk", amount: -reduction, turns: 6, tag: "smokeBomb" }); spawnFloat("enemy", `💨-${reduction}ATK`, "#60f0a0"); triggerAnim("enemy", "smoke"); addLog(`💨 Your Smoke Bomb reduces ${ne.name}'s ATK by ${reduction} for 6 turns`, "#60f0a0"); }
            else if (ab.type === "multi") { const hits = rand(2, 3); let tot = 0; const atkBonusM = Math.floor(totalAtk * 0.4); for (let i = 0; i < hits; i++) { if (!miss()) { const c = isCrit(totalCrit); const raw = rand(ab.damage[0], ab.damage[1]) + atkBonusM; const d = calcDmg(c ? Math.floor(raw * 1.5 * spdMult * demonMult) : Math.floor(raw * spdMult * demonMult), Math.floor(ne.def * 0.6)); ne.hp -= d; tot += d; } } flash("enemy"); triggerAnim("enemy", "arrow"); spawnFloat("enemy", `-${tot}`, "#60f0a0"); addLog(`🏹 Your Lethal Volley — ${hits} hits for ${tot} total`, "#60f0a0"); }
            else if (ab.type === "divineWrath") { const c = isCrit(totalCrit); const base = Math.floor(np.maxHp * 0.20); const dmg = calcDmg(c ? Math.floor(base * 1.5 * spdMult * demonMult) : Math.floor(base * spdMult * demonMult), ne.def); dealDmg(dmg, "😇 Your Divine Wrath", c); triggerAnim("enemy", "holy"); }
            else if (ab.type === "takeFlight") { cse.dodgeReady = true; cse.flightBonus = 2; spawnFloat("player", "😇 Flight+Dodge", "#e8e0ff"); triggerAnim("player", "flight"); addLog("😇 Your Take Flight — next attack dodged, +30% dmg x2!", "#e8e0ff"); }
            else if (ab.type === "celestialHeal") { const pct = rand(Math.floor(ab.damage[0]*100), Math.floor(ab.damage[1]*100)) / 100; const h = Math.floor(np.maxHp * pct * healMult); np.hp = clamp(np.hp + h, 0, np.maxHp); np.mp = clamp(np.mp + 10, 0, np.maxMp); spawnFloat("player", `+${h}`, "#e8e0ff"); triggerAnim("player", "holy"); addLog(`😇 Your Celestial Heal restores ${h} HP (${Math.round(pct*100)}%) and +10 MP`, "#e8e0ff"); }
        } else if (type === "item") {
            const item = inventory[payload]; if (!item || item.qty <= 0) return;
            if (item.effect === "heal") { const h = Math.floor(item.amount * healMult); np.hp = clamp(np.hp + h, 0, np.maxHp); spawnFloat("player", `+${h}`, "#60f0a0"); addLog(`You use ${item.icon} ${item.name} — restored ${h} HP`, "#60f0a0"); }
            else if (item.effect === "mp") { np.mp = clamp(np.mp + item.amount, 0, np.maxMp); addLog(`You use ${item.icon} ${item.name} — restored ${item.amount} MP`, "#60c0f0"); }
            inv = inventory.map((it, i) => i === payload ? { ...it, qty: it.qty - 1 } : it).filter(it => it.qty > 0); setInventory(inv);
        } else if (type === "flee") {
            if (rand(1, 100) > 40) { addLog("🏃 Fled!", "#f0c060"); setCombat(false); setEnemy(null); setPlayer(np); return; }
            else addLog("Couldn't escape!", "#ff6060");
        }
        nb.player = nb.player.map(b => { if (b.tag === "holyShield" || b.tag === "darkSacrifice" || b.tag === "arcaneBoost" || b.tag === "demonPact") return b; return { ...b, turns: b.turns - 1 }; }).filter(b => b.turns > 0);
        setSe(cse); setSavedEnemy({ ...ne });
        if (ne.hp <= 0) {
            // Show the killing blow animation before transitioning — update enemy so the flash/anim renders
            setEnemy(ne); setPlayer(np); setBuffs(nb);
            setTimeout(() => resolveVictory(np, ne, nb, inv, g, eq, cse, rl), 700);
            return;
        }
        setPlayer(np); setEnemy(ne); setBuffs(nb); setTurn("enemy");
        setTimeout(() => enemyTurn(np, ne, nb, inv, g, eq, cse, rl), 900);
    };

    const enemyTurn = (np, ne, nb, inv, g, eq, cse, rl) => {
        let fnp = { ...np }, fne = { ...ne }, fnb = { player: [...nb.player], enemy: [...nb.enemy] }, fse = { ...cse };
        const ep = effStats(fnp, eq); const rb = getRelicBonus();
        const pDef = ep.def + rb.def + fnb.player.filter(b => b.stat === "def").reduce((s, b) => s + b.amount, 0);
        const flatDR = hasP(eq, "flatDR") ? 2 : 0; const magicDR = hasP(eq, "magicDR") ? 4 : 0;
        const eAtkMod = fnb.enemy.filter(b => b.stat === "atk").reduce((s, b) => s + b.amount, 0);
        let eAtk = fne.atk + eAtkMod;
        if (fne.affix === "infernalRage" && !fne.raged && fne.hp <= (fne.maxHp * 0.5)) { fne = { ...fne, atk: fne.atk + 10, raged: true }; eAtk += 10; spawnFloat("enemy", "😤RAGE+10ATK", "#ff4400"); triggerAnim("enemy", "fire"); addLog(`🔥 Infernal Behemoth RAGES! +10 ATK!`, "#ff4400"); }
        if (fne.affix2 === "deathMark" && !fne.deathMarked && fne.hp <= (fne.maxHp * 0.5)) { fne = { ...fne, deathMarked: true }; fnb.player.push({ stat: "atk", amount: -6, turns: 99 }); spawnFloat("player", "💀DEATHMARK-6ATK", "#880000"); triggerAnim("player", "dark"); addLog(`💀 DEATH MARK! ATK -6 permanently!`, "#880000"); }
        if (fne.minorSuffix === "frenzied" && fne.hp <= (fne.maxHp * 0.5)) eAtk += 8;
        const doHit = (atkVal, defVal, bypassDef = false, isMagic = false) => {
            if (fse.dodgeReady) { fse.dodgeReady = false; addLog(`😇 Take Flight dodges!`, "#e8e0ff"); return 0; }
            const mc = 5 + (fse.enemyBlind > 0 ? 25 : 0);
            if (rand(1, 100) <= mc) { spawnFloat("enemy", "MISS!", "#888"); addLog(`${fne.icon || ""} ${fne.name} missed!`, "#888"); return 0; }
            const c = isCrit(fne.crit || 5); const raw = rand(atkVal, atkVal + 4);
            const dr = isMagic ? magicDR : flatDR;
            const dmg = bypassDef ? Math.max(1, raw) : Math.max(0, calcDmg(c ? Math.floor(raw * 1.5) : raw, defVal) - dr);
            flash("player"); fnp.hp -= dmg; spawnFloat("player", `-${dmg}`, c ? "#ff2200" : "#ff6060");
            // Animate based on enemy style/type
            const eStyle = fne.style || "aggressive";
            const eAnimType = eStyle === "magic" ? "arcane" : eStyle === "plague" ? "poison" : eStyle === "duel" ? "slash" : "slash";
            triggerAnim("player", eAnimType);
            addLog(`${fne.icon || ""} ${fne.name} hits you for ${dmg}!${c ? " ☠️ CRIT!" : ""}`, c ? "#ff2200" : "#ff6060"); return dmg;
        };
        if (fne.style === "duel") {
            const champClass = fne.champClass || "";
            const roll = rand(1, 100);
            if (champClass === "Death Knight" && roll <= 30 && !fnb.enemy.some(b => b.tag === "duelSacrifice")) {
                const hc = Math.floor(fne.hp * 0.20);
                if (fne.hp - hc > 0) {
                    fne.hp -= hc; spawnFloat("enemy", `-${hc}💀`, "#cc2222");
                    const ab2 = Math.floor(eAtk * 0.5); const db2 = Math.floor(fne.def * 0.5);
                    fnb.enemy.push({ stat: "atk", amount: ab2, turns: 3, tag: "duelSacrifice" });
                    fnb.enemy.push({ stat: "def", amount: db2, turns: 3, tag: "duelSacrifice" });
                    spawnFloat("enemy", `💀+${ab2}ATK+${db2}DEF`, "#cc2222"); triggerAnim("enemy", "power");
                    addLog(`💀 ${fne.name} uses Dark Sacrifice! ATK+${ab2}, DEF+${db2}!`, "#cc2222");
                } else doHit(eAtk, pDef);
            } else if (champClass === "Demonic Beast" && roll <= 25 && !fnb.enemy.some(b => b.tag === "duelPact")) {
                const pactAtk = Math.floor(eAtk * 0.30);
                fnb.enemy.push({ stat: "atk", amount: pactAtk, turns: 4, tag: "duelPact" });
                spawnFloat("enemy", `👹+${pactAtk}ATK`, "#c060f0"); triggerAnim("enemy", "power");
                addLog(`👹 ${fne.name} uses Demon Pact! +30% ATK x 4!`, "#c060f0");
            } else if (champClass === "Holy Knight" && roll <= 25 && !fnb.enemy.some(b => b.tag === "duelShield")) {
                const db = Math.max(1, Math.floor(fne.def * 0.5));
                fnb.enemy.push({ stat: "def", amount: db, turns: 3, tag: "duelShield" });
                spawnFloat("enemy", `🛡️+${db}DEF`, "#f0c060"); triggerAnim("enemy", "shield");
                addLog(`⚔️ ${fne.name} uses Holy Shield! DEF+${db} x 3!`, "#f0c060");
            } else if (champClass === "Arch Angel" && roll <= 20 && fne.hp < fne.maxHp * 0.6) {
                const heal = Math.floor(fne.maxHp * 0.15);
                fne.hp = Math.min(fne.hp + heal, fne.maxHp);
                spawnFloat("enemy", `+${heal}`, "#e8e0ff"); addLog(`😇 ${fne.name} heals ${heal} HP!`, "#e8e0ff");
            } else if (champClass === "Arcane Magician" && roll <= 35) {
                doHit(Math.floor(eAtk * 1.4), Math.floor(pDef * 0.6), false, true);
                addLog(`🔮 ${fne.name} casts a spell!`, "#60c0f0");
            } else if (champClass === "Ranged Assassin" && roll <= 30) {
                const c = isCrit((fne.crit || 5) + 15);
                const raw = rand(eAtk, eAtk + 4);
                const dmg = Math.max(0, calcDmg(c ? Math.floor(raw * 1.5) : raw, Math.floor(pDef * 0.5)));
                flash("player"); fnp.hp -= dmg; spawnFloat("player", `-${dmg}`, c ? "#ff2200" : "#ff6060");
                addLog(`🏹 ${fne.name} snipes you for ${dmg}!${c ? " ☠️ CRIT!" : ""}`, c ? "#ff2200" : "#60f0a0");
            } else {
                doHit(eAtk, pDef);
            }
        } else if (fne.style === "aggressive") {
            // Xaroon the Dragon — Fire Breath + Wing Slam
            if (fne.id === "xaroon_dragon" && rand(1, 100) <= 30) {
                const roll2 = rand(1, 100);
                if (roll2 <= 50) {
                    // Fire Breath: SPD-based dmg + 2-turn burn
                    if (fse.dodgeReady) { fse.dodgeReady = false; addLog(`😇 Take Flight dodges Xaroon's Fire Breath!`, "#e8e0ff"); }
                    else {
                        const spd = ep.spd + rb.spd; const dmg = Math.max(4, spd * 2);
                        fnp.hp -= dmg; flash("player"); spawnFloat("player", `-${dmg}🔥`, "#ff6030"); triggerAnim("player", "fire");
                        fse.burn = 2;
                        addLog(`🐉 Xaroon breathes fire — ${dmg} dmg + Burning 2 turns!`, "#ff6030");
                    }
                } else {
                    // Wing Slam: heavy hit + SPD debuff
                    const dmg = doHit(Math.floor(eAtk * 1.2), Math.floor(pDef * 0.5));
                    if (dmg > 0) { triggerAnim("player", "slash"); fnb.player.push({ stat: "spd", amount: -5, turns: 2, tag: "wingSlam" }); addLog(`🐉 Xaroon's Wing Slam! Your SPD -5 for 2 turns!`, "#ff8800"); }
                }
            } else {
                const bp = fne.affix === "defBypass" && isCrit(15); if (bp) addLog(`🐉 Dragonfire! DEF bypassed!`, "#ff8800"); doHit(eAtk, pDef, bp);
            }
            // Infernal Behemoth — Stomp + Frenzy Roar
            if (fne.id === "infernal_behemoth" && rand(1, 100) <= 30 && fnp.hp > 0) {
                const roll2 = rand(1, 100);
                if (roll2 <= 50) {
                    // Stomp: high dmg ignoring half DEF
                    const dmg = doHit(Math.floor(eAtk * 1.2), Math.floor(pDef * 0.5));
                    if (dmg > 0) { triggerAnim("player", "slash"); addLog(`🔥 Infernal Stomp! Crushed for ${dmg}!`, "#ff4400"); }
                } else {
                    // Frenzy Roar: self ATK buff
                    fnb.enemy.push({ stat: "atk", amount: 8, turns: 2, tag: "frenzyRoar" });
                    spawnFloat("enemy", "😤+8ATK", "#ff4400"); triggerAnim("enemy", "fire");
                    addLog(`😤 Infernal Behemoth Frenzy Roar! ATK +8 for 2 turns!`, "#ff4400");
                }
            }
        }
        else if (fne.style === "defensive") { if (rand(1, 100) > 50) doHit(eAtk - 2, pDef); else { fnb.enemy.push({ stat: "def", amount: 5, turns: 2 }); spawnFloat("enemy", "🛡️+5DEF", "#f0a060"); triggerAnim("enemy", "shield"); addLog(`${fne.icon || "🛡️"} ${fne.name} braces! +5 DEF for 2 turns`, "#f0a060"); } }
        else if (fne.style === "magic") {
            // Demon Lord Falaxir — Hellblast + Dark Shroud
            if (fne.id === "demon_lord_falaxir" && rand(1, 100) <= 30) {
                if (rand(1, 100) <= 50) {
                    // Hellblast: magic dmg ignoring DEF
                    if (fse.dodgeReady) { fse.dodgeReady = false; addLog(`😇 Take Flight dodges Hellblast!`, "#e8e0ff"); }
                    else {
                        const dmg = Math.max(1, Math.floor(eAtk * 1.3) - magicDR);
                        fnp.hp -= dmg; flash("player"); spawnFloat("player", `-${dmg}🔥`, "#ff4400"); triggerAnim("player", "fire");
                        addLog(`👿 Falaxir's Hellblast — ${dmg} magic dmg (ignores DEF)!`, "#ff4400");
                    }
                } else {
                    // Dark Shroud: DEF debuff
                    fnb.player.push({ stat: "def", amount: -4, turns: 3, tag: "darkShroud" });
                    spawnFloat("player", "🌑-4DEF", "#cc44ff"); triggerAnim("player", "dark");
                    addLog(`👿 Falaxir's Dark Shroud — your DEF -4 for 3 turns!`, "#cc44ff");
                }
            }
            // Veltharion the Undying — Soul Leech + Curse of Frailty
            else if (fne.id === "veltharion" && rand(1, 100) <= 30) {
                if (rand(1, 100) <= 50) {
                    // Soul Leech: heals 15% of missing HP
                    const missing = fne.maxHp - fne.hp; const heal = Math.max(1, Math.floor(missing * 0.15));
                    fne.hp = Math.min(fne.hp + heal, fne.maxHp);
                    spawnFloat("enemy", `+${heal}🩸`, "#cc44ff"); triggerAnim("enemy", "drain");
                    addLog(`💀 Veltharion's Soul Leech — steals ${heal} HP from the void!`, "#cc44ff");
                } else {
                    // Curse of Frailty: halves heal effectiveness
                    fse.frailCurse = (fse.frailCurse || 0) + 3;
                    spawnFloat("player", "💀Frail", "#aa44ff"); triggerAnim("player", "dark");
                    addLog(`💀 Veltharion's Curse of Frailty — your heals halved for 3 turns!`, "#aa44ff");
                }
                if (fnp.hp > 0 && rand(1, 100) > 30) doHit(eAtk + 3, Math.floor(pDef / 2), false, true);
            }
            // Abyssal Overlord — Mind Shatter + Void Pull
            else if (fne.id === "abyssal_overlord" && rand(1, 100) <= 30) {
                if (rand(1, 100) <= 50) {
                    // Mind Shatter: ATK + DEF debuff
                    fnb.player.push({ stat: "atk", amount: -3, turns: 3, tag: "mindShatter" });
                    fnb.player.push({ stat: "def", amount: -3, turns: 3, tag: "mindShatter" });
                    spawnFloat("player", "👁️Shatter", "#cc00ff"); triggerAnim("player", "arcane");
                    addLog(`👁️ Abyssal Overlord's Mind Shatter — ATK & DEF -3 for 3 turns!`, "#cc00ff");
                } else {
                    // Void Pull: dmg scales with player's missing HP
                    if (fse.dodgeReady) { fse.dodgeReady = false; addLog(`😇 Take Flight dodges Void Pull!`, "#e8e0ff"); }
                    else {
                        const missingHp = fnp.maxHp - fnp.hp; const dmg = Math.max(5, Math.floor(missingHp * 0.2) - magicDR);
                        fnp.hp -= dmg; flash("player"); spawnFloat("player", `-${dmg}👁️`, "#cc00ff"); triggerAnim("player", "arcane");
                        addLog(`👁️ Void Pull — the abyss tears at your wounds for ${dmg}!`, "#cc00ff");
                    }
                }
                if (fnp.hp > 0 && rand(1, 100) > 30) { if (fne.affix === "voidRupture" && isCrit(20)) { addLog(`👁️ VOID RUPTURE — TWICE!`, "#cc00ff"); doHit(eAtk + 3, Math.floor(pDef / 2), false, true); if (fnp.hp > 0) doHit(eAtk + 3, Math.floor(pDef / 2), false, true); } else doHit(eAtk + 3, Math.floor(pDef / 2), false, true); }
            }
            // Doomreaper — Wither (max 2 uses, already has soulStun + deathMark)
            else if (fne.id === "doomreaper" && rand(1, 100) <= 25 && (fne.witherCount || 0) < 2) {
                fne.witherCount = (fne.witherCount || 0) + 1;
                const witherAmt = 10; fnp.maxHp = Math.max(20, fnp.maxHp - witherAmt); fnp.hp = Math.min(fnp.hp, fnp.maxHp);
                spawnFloat("player", `☠️-${witherAmt}MaxHP`, "#880000"); triggerAnim("player", "dark");
                addLog(`☠️ Doomreaper's Wither — your Max HP reduced by ${witherAmt} permanently!`, "#880000");
                if (fnp.hp > 0) doHit(eAtk + 3, Math.floor(pDef / 2), false, true);
            }
            else {
                if (fne.affix === "voidRupture" && isCrit(20)) { addLog(`👁️ VOID RUPTURE — TWICE!`, "#cc00ff"); doHit(eAtk + 3, Math.floor(pDef / 2), false, true); if (fnp.hp > 0) doHit(eAtk + 3, Math.floor(pDef / 2), false, true); } else doHit(eAtk + 3, Math.floor(pDef / 2), false, true);
            }
        }
        else if (fne.style === "plague") { if (rand(1, 100) > 50) doHit(eAtk, pDef); else { fse.plagueDot = 2; spawnFloat("player", "☣️PLAGUE", "#cc44ff"); triggerAnim("player", "poison"); addLog(`☣️ Diseased Plague! 15% HP/turn x 2!`, "#cc44ff"); } }
        fnb.player = fnb.player.map(b => {
            if (b.tag === "holyShield") { const nt = b.turns - 1; return { ...b, turns: nt }; }
            if (b.tag === "darkSacrifice") { const nt = b.turns - 1; return { ...b, turns: nt }; }
            if (b.tag === "arcaneBoost") { const nt = b.turns - 1; return { ...b, turns: nt }; }
            if (b.tag === "demonPact") { const nt = b.turns - 1; if (nt <= 0) fse.demonPactBonus = 0; return { ...b, turns: nt }; }
            return { ...b, turns: b.turns - 1 };
        }).filter(b => b.turns > 0);
        if (fse.frailCurse > 0) fse.frailCurse--;
        if (fnp.hp > 0) {
            if (fne.affix === "burn" && isCrit(20)) { fse.burn = 2; triggerAnim("player", "fire"); addLog(`🔥 Hellbound! Burning 2 turns!`, "#ff6030"); }
            if (fne.affix === "atkCurse" && isCrit(15)) { fnb.player.push({ stat: "atk", amount: -4, turns: 2 }); spawnFloat("player", "💀-4ATK", "#aa44ff"); triggerAnim("player", "debuff"); addLog(`💀 Undying Curse! ATK -4 x 2!`, "#aa44ff"); }
            if (fne.affix === "soulStun" && isCrit(20)) { fse.stunned = true; spawnFloat("player", "💀STUNNED", "#cc44cc"); triggerAnim("player", "dark"); addLog(`💀 SOUL STUN!`, "#cc44cc"); }
            if (fne.minorSuffix === "venomous" && isCrit(35)) { fse.playerPoison = 2; spawnFloat("player", "🐍POISON", "#80ff80"); triggerAnim("player", "poison"); addLog(`🐍 Poisoned!`, "#80ff80"); }
        }
        if (fse.enemyBlind > 0) fse.enemyBlind--;
        if (hasP(eq, "reflect") && fnp.hp > 0) { const ref = Math.floor(Math.abs(np.hp - fnp.hp) * 0.1); if (ref > 0) { fne.hp -= ref; spawnFloat("enemy", `-${ref}👑`, "#f0f060"); addLog(`👑 Reflects ${ref}!`, "#f0f060"); } }
        fnb.enemy = fnb.enemy.map(b => ({ ...b, turns: b.turns - 1 })).filter(b => b.turns > 0);
        setSavedEnemy({ ...fne });
        if (fne.hp <= 0) { resolveVictory(fnp, fne, fnb, inv, g, eq, fse, rl); return; }
        if (fnp.hp <= 0) { fnp.hp = 0; setPlayer(fnp); setFinalLog([...log]); setScreen("gameover"); return; }
        setEnemy(fne); setPlayer(fnp); setBuffs(fnb); setSe(fse); setTurn("player");
    };

    const useItemOutside = idx => { const item = inventory[idx]; if (!item || item.qty <= 0 || item.effect === "revive") return; let np = { ...player }; if (item.effect === "heal") { np.hp = clamp(np.hp + item.amount, 0, np.maxHp); spawnFloat("player", `+${item.amount}`, "#60f0a0"); } else if (item.effect === "mp") { np.mp = clamp(np.mp + item.amount, 0, np.maxMp); } setInventory(inventory.map((it, i) => i === idx ? { ...it, qty: it.qty - 1 } : it).filter(it => it.qty > 0)); setPlayer(np); };
    const hasRevive = inventory.some(i => i.id === "revive" && i.qty > 0);
    const useRevive = () => { const idx = inventory.findIndex(i => i.id === "revive" && i.qty > 0); if (idx === -1) return; const e = { ...savedEnemy }; let np = { ...player, hp: clamp(100, 0, player.maxHp), mp: clamp((player.mp || 0) + 30, 0, player.maxMp) }; setInventory(inventory.map((it, i) => i === idx ? { ...it, qty: it.qty - 1 } : it).filter(it => it.qty > 0)); setPlayer(np); setEnemy(e); setCombat(true); setBuffs({ player: [], enemy: [] }); setSe({ burn: 0, stunned: false, dodgeReady: false, flightBonus: 0, enemyDot: 0, playerPoison: 0, plagueDot: 0, enemyBlind: 0, demonPactBonus: 0, cursedPlateOn: hasP(equipped, "cursedPlate"), frailCurse: 0 }); setTurn("player"); setScreen("explore"); setTrinketUsed(false); addLog(`💎 Revived! ${e.name} has ${Math.max(0, e.hp)} HP!`, "#c060f0"); };
    const buyConsumable = item => { if (gold < item.cost) { setShopMsg("Not enough gold!"); setTimeout(() => setShopMsg(""), 2000); return; } if (item.id === "revive" && hasRevive) { setShopMsg("Already have a Revive Gem!"); setTimeout(() => setShopMsg(""), 2000); return; } setGold(g => g - item.cost); setInventory(inv => { const ex = inv.find(i => i.id === item.id && !i.isGear); return ex ? inv.map(i => i.id === item.id && !i.isGear ? { ...i, qty: i.qty + 1 } : i) : [...inv, { ...item, qty: 1 }]; }); setShopMsg(`Bought ${item.name}!`); setTimeout(() => setShopMsg(""), 2000); };
    const buyEquipment = item => { if (gold < item.cost) { setShopMsg("Not enough gold!"); setTimeout(() => setShopMsg(""), 2000); return; } setGold(g => g - item.cost); const { np, newEq } = doEquip(item, equipped, player); setEquipped(newEq); setPlayer(np); setShopMsg(`Equipped ${item.name}!`); setTimeout(() => setShopMsg(""), 2000); };
    const sellItem = (item, idx) => { const price = item.sellPrice || Math.floor(item.cost / 2); setGold(g => g + price); setInventory(inv => inv.map((it, i) => i === idx ? { ...it, qty: it.qty - 1 } : it).filter(it => it.qty > 0)); setShopMsg(`Sold for ${price}g`); setTimeout(() => setShopMsg(""), 2000); };
    const sellEquipped = slot => { const item = equipped[slot]; if (!item) return; const price = item.sellPrice || Math.floor(item.cost / 2); const { np, newEq } = doUnequip(slot, equipped, player); setEquipped(newEq); setPlayer(np); setGold(g => g + price); setShopMsg(`Sold ${item.name} for ${price}g`); setTimeout(() => setShopMsg(""), 2000); };
    const sellRelic = idx => { const r = relics[idx]; if (!r) return; setGold(g => g + r.sellPrice); setRelics(rl => rl.filter((_, i) => i !== idx)); setShopMsg(`Sold ${r.name} for ${r.sellPrice}g`); setTimeout(() => setShopMsg(""), 2000); };
    const pickUpgrade = upg => { const np = upg.apply({ ...player }); setPlayer(np); setLevel(l => l + 1); setLvlUp(false); addLog(`🌟 Level Up! ${upg.label}`, "#f0f060"); if (encounters >= 12) { setScreen("victory"); return; } if (encounters > 0 && encounters % 3 === 0) { const nz = Math.min(3, zone + 1); setZone(nz); addLog(`🗺️ Into ${ZONES[nz].name}...`, nz === 3 ? "#ff4400" : "#60c0f0"); } };

    const ep = player ? effStats(player, equipped) : null;
    const rb = getRelicBonus();
    const zoneData = ZONES[zone];
    const classData = playerClass ? CLASSES[playerClass] : null;

    const Btn = ({ onClick, disabled, border, bg, color = "#eee", children, style: s = {} }) => (
        <button onClick={onClick} disabled={disabled}
            style={{ background: bg, border: `1px solid ${border}`, color: disabled ? "#444" : color, borderRadius: 8, padding: "5px 9px", cursor: disabled ? "not-allowed" : "pointer", fontFamily: "Georgia", fontSize: 11, opacity: disabled ? 0.5 : 1, transition: "all 0.15s", boxShadow: disabled ? "none" : `0 0 5px ${border}33`, ...s }}
            onMouseEnter={e => { if (!disabled) { e.currentTarget.style.boxShadow = `0 0 10px ${border}88`; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = disabled ? "none" : `0 0 5px ${border}33`; }}
        >{children}</button>
    );

    const StatusPills = () => {
        const pills = [];
        if (se.burn > 0) pills.push(<StatusPill key="burn" label={`🔥 Burn(${se.burn})`} color="#ff6030" />);
        if (se.playerPoison > 0) pills.push(<StatusPill key="p" label={`🐍 Poison(${se.playerPoison})`} color="#80ff80" />);
        if (se.plagueDot > 0) pills.push(<StatusPill key="pl" label={`☣️ Plague(${se.plagueDot})`} color="#cc44ff" />);
        if (se.stunned) pills.push(<StatusPill key="st" label="💀 Stunned" color="#cc44cc" />);
        if (se.dodgeReady) pills.push(<StatusPill key="d" label="😇 Dodge" color="#e8e0ff" />);
        if (se.flightBonus > 0) pills.push(<StatusPill key="f" label={`✈️ Flight(${se.flightBonus})`} color="#e8e0ff" />);
        if (se.enemyDot > 0) pills.push(<StatusPill key="dot" label={`💀 DoT(${se.enemyDot})`} color="#a0ffa0" />);
        if (se.demonPactBonus > 0) { const pactBuff = buffs.player.find(b => b.tag === "demonPact"); pills.push(<StatusPill key="dp" label={`👹 Pact+30%${pactBuff ? `(${pactBuff.turns})` : ""}`} color="#c060f0" />); }
        if (se.frailCurse > 0) pills.push(<StatusPill key="frail" label={`💀 Frail(${se.frailCurse})`} color="#aa44ff" />);
        buffs.player.filter(b => b.amount > 0 && b.tag !== "demonPact").forEach((b, i) => pills.push(<StatusPill key={`pb${i}`} label={`${b.stat === "manaRegen" ? "MP/t" : b.stat === "spd" ? "SPD" : b.stat.toUpperCase()}+${b.amount}(${b.turns})`} color={b.tag === "holyShield" ? "#f0c060" : b.tag === "darkSacrifice" ? "#cc2222" : b.tag === "arcaneBoost" ? "#60c0f0" : "#f0f060"} />));
        buffs.player.filter(b => b.amount < 0).forEach((b, i) => pills.push(<StatusPill key={`nd${i}`} label={`${b.stat.toUpperCase()}${b.amount}(${b.turns === 99 ? "∞" : b.turns})`} color="#ff8888" />));
        return pills.length ? <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 3 }}>{pills}</div> : null;
    };

    const getEnemyPortraitId = (e) => {
        if (!e) return null;
        if (e.id === "infernal_behemoth" && e.raged) return "infernal_behemoth_raged";
        return e.id;
    };


    if (screen === "challengeIntro" && challengeOnVictory) {
        const champ = challengeOnVictory;
        const cls = CLASSES[champ.playerClass];
        return (
            <div style={{ background: "linear-gradient(160deg,#0a0005,#1a0010,#0d000a)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia", color: "#eee", padding: 20 }}>
                <style>{CSS}</style>
                <div style={{ fontSize: 42, filter: "drop-shadow(0 0 16px #ff006699)", marginBottom: 8 }}>⚔️</div>
                <h2 style={{ color: "#ff4466", fontSize: 18, animation: "glow 2s infinite", marginBottom: 12 }}>You Have Been Challenged!</h2>
                <div style={{ background: "#ffffff08", borderRadius: 14, padding: 16, textAlign: "center", marginBottom: 16, width: "100%", maxWidth: 320 }}>
                    <ClassPortrait className={champ.playerClass} size={90} style={{ margin: "0 auto 10px" }} />
                    <div style={{ color: cls?.color || "#f0c060", fontWeight: "bold", fontSize: 15, marginBottom: 2 }}>{champ.playerTitle}</div>
                    <div style={{ color: "#555", fontSize: 10, marginBottom: 10 }}>Level {champ.level} · {champ.date}</div>

                    {champ.equippedNames && Object.keys(champ.equippedNames).length > 0 && (
                        <div style={{ marginTop: 12, borderTop: "1px solid #ffffff10", paddingTop: 10 }}>
                            {Object.entries(champ.equippedNames).map(([slot, name]) => (
                                <div key={slot} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    {champ.equippedIds?.[slot] && <ItemPortrait itemId={champ.equippedIds[slot]} size={28} />}
                                    <div style={{ textAlign: "left" }}>
                                        <div style={{ color: "#eee", fontSize: 11, fontWeight: "bold" }}>{name}</div>
                                        <div style={{ color: "#555", fontSize: 9, textTransform: "capitalize" }}>{slot}{(() => { const it = EQUIPMENT.find(e => e.id === champ.equippedIds?.[slot]) || TRINKETS.find(e => e.id === champ.equippedIds?.[slot]); return it ? <span style={{ color: "#888", marginLeft: 4 }}>· {it.desc}</span> : null; })()}</div>
                                    </div>
                                </div>
                            ))}
                            {champ.relicNames?.length > 0 && champ.relicNames.map((r, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💎</div>
                                    <div style={{ color: "#ffcc44", fontSize: 11 }}>{r}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 12, padding: "8px 0", borderTop: "1px solid #ffffff10", fontSize: 11 }}>
                        <div style={{ textAlign: "center" }}><div style={{ color: "#ff6060", fontSize: 13 }}>❤️</div><div style={{ color: "#eee", fontWeight: "bold" }}>{champ.stats?.hp}</div><div style={{ color: "#555", fontSize: 9 }}>HP</div></div>
                        <div style={{ textAlign: "center" }}><div style={{ color: "#f0a060", fontSize: 13 }}>⚔️</div><div style={{ color: "#eee", fontWeight: "bold" }}>{champ.stats?.atk}</div><div style={{ color: "#555", fontSize: 9 }}>ATK</div></div>
                        <div style={{ textAlign: "center" }}><div style={{ color: "#60a0ff", fontSize: 13 }}>🛡️</div><div style={{ color: "#eee", fontWeight: "bold" }}>{champ.stats?.def}</div><div style={{ color: "#555", fontSize: 9 }}>DEF</div></div>
                        <div style={{ textAlign: "center" }}><div style={{ color: "#60c0f0", fontSize: 13 }}>💨</div><div style={{ color: "#eee", fontWeight: "bold" }}>{champ.stats?.spd}</div><div style={{ color: "#555", fontSize: 9 }}>SPD</div></div>
                        <div style={{ textAlign: "center" }}><div style={{ color: "#f0f060", fontSize: 13 }}>🎯</div><div style={{ color: "#eee", fontWeight: "bold" }}>{champ.stats?.crit}%</div><div style={{ color: "#555", fontSize: 9 }}>CRIT</div></div>
                    </div>
                </div>
                <p style={{ color: "#666", fontSize: 11, textAlign: "center", marginBottom: 16, maxWidth: 300 }}>
                    Beat the game first to accept this challenge — then return to fight this champion!
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setScreen("title")} style={{ padding: "8px 20px", background: "linear-gradient(90deg,#880000,#cc2222)", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "Georgia", fontWeight: "bold" }}>
                        ⚔️ Accept Challenge
                    </button>
                    <button onClick={() => { setChallengeOnVictory(null); setScreen("title"); window.history.replaceState({}, "", window.location.pathname); }} style={{ padding: "8px 16px", background: "#ffffff10", color: "#888", border: "1px solid #333", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "Georgia" }}>
                        Decline
                    </button>
                </div>
            </div>
        );
    }

    if (screen === "title") return (
        <div style={{ background: "linear-gradient(160deg,#050510,#0d0d1a,#05050e)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia", color: "#eee", padding: 16, position: "relative", overflow: "hidden" }}>
            <style>{CSS}</style>
            <Particles />
            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 48, animation: "pulse 2s infinite", filter: "drop-shadow(0 0 14px #f0c06099)" }}>⚔️</div>
                <h1 style={{ fontSize: 26, margin: "6px 0 2px", animation: "glow 2.5s infinite", background: "linear-gradient(90deg,#f0c060,#fff8e0,#f0c060)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 2 }}>Realm of Shadows</h1>
                <p style={{ color: "#555", marginBottom: 10, fontSize: 10, letterSpacing: 2 }}>4 ZONES · 12 BATTLES · 6 CLASSES</p>
                <button onClick={() => setScreen("hall")} style={{ marginBottom: 16, padding: "6px 20px", background: "#ffffff08", color: "#f0c060", border: "1px solid #f0c06044", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "Georgia", letterSpacing: 1 }}>🏛️ Hall of Champions</button>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                    {Object.entries(CLASSES).map(([cls, data]) => (
                        <div key={cls} onClick={() => selectClass(cls)}
                            style={{ background: "linear-gradient(140deg,#0d0d1a,#15152a)", border: `2px solid ${data.color}33`, borderRadius: 14, padding: "12px 10px", width: 128, cursor: "pointer", textAlign: "center", transition: "all 0.2s", boxShadow: `0 4px 14px ${data.color}18` }}
                            onMouseOver={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.border = `2px solid ${data.color}`; e.currentTarget.style.boxShadow = `0 10px 26px ${data.color}44`; }}
                            onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.border = `2px solid ${data.color}33`; e.currentTarget.style.boxShadow = `0 4px 14px ${data.color}18`; }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                                <ClassPortrait className={cls} size={80} />
                            </div>
                            <div style={{ color: data.color, fontWeight: "bold", fontSize: 11, marginBottom: 2 }}>{cls}</div>
                            <div style={{ color: "#777", fontSize: 9, marginBottom: 4, lineHeight: 1.4 }}>{data.desc}</div>
                            <div style={{ fontSize: 9, color: "#555", borderTop: `1px solid ${data.color}22`, paddingTop: 3 }}>HP {data.stats.maxHp} · ATK {data.stats.atk} · Crit {data.stats.crit}%</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (screen === "naming") {
        const cd = CLASSES[pendingCls]; return (
            <div style={{ background: "linear-gradient(160deg,#050510,#0d0d1a)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia", color: "#eee", padding: 20 }}>
                <style>{CSS}</style>
                <div style={{ textAlign: "center", animation: "fadeIn 0.4s ease-out" }}>
                    <ClassPortrait className={pendingCls} size={120} style={{ margin: "0 auto 12px" }} />
                    <h2 style={{ color: cd.color, marginBottom: 3, fontSize: 16, textShadow: `0 0 14px ${cd.color}` }}>{pendingCls}</h2>
                    <p style={{ color: "#888", marginBottom: 12, fontSize: 11 }}>Name your hero:</p>
                    <input value={charName} onChange={e => setCharName(e.target.value.slice(0, 20))} placeholder="Enter name..." maxLength={20}
                        style={{ background: "#0d0d1a", border: `1px solid ${cd.color}88`, borderRadius: 8, padding: "8px 14px", color: "#eee", fontFamily: "Georgia", fontSize: 13, width: 200, outline: "none", marginBottom: 4, textAlign: "center", boxShadow: `0 0 8px ${cd.color}44` }}
                        onKeyDown={e => e.key === "Enter" && confirmName()} />
                    <div style={{ fontSize: 9, color: charName.length >= 20 ? "#ff6060" : "#444", marginBottom: 8, textAlign: "center" }}>{charName.length}/20</div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 }}>
                        <Btn onClick={randomName} border="#888" bg="#1a1a2e">🎲 Random</Btn>
                        <Btn onClick={confirmName} border={cd.color} bg="#1a1a2e" color={cd.color}>▶ Begin</Btn>
                    </div>
                    {charName && <p style={{ color: "#666", fontSize: 11, fontStyle: "italic" }}>"{charName}, the {pendingCls}"</p>}
                    <div style={{ marginTop: 14 }}><Btn onClick={() => setScreen("title")} border="#444" bg="#0d0d1a">← Back</Btn></div>
                </div>
            </div>
        );
    }

    if (screen === "gameover") return (
        <div style={{ background: "linear-gradient(160deg,#0d0000,#1a0000)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia", color: "#eee", padding: 20 }}>
            <style>{CSS}</style>
            <div style={{ textAlign: "center", animation: "fadeIn 0.5s" }}>
                <div style={{ fontSize: 52, filter: "drop-shadow(0 0 14px #ff000099)" }}>💀</div>
                <h2 style={{ color: "#ff4444", fontSize: 20, textShadow: "0 0 20px #ff0000", marginBottom: 4 }}>You have fallen...</h2>
                <p style={{ color: "#cc8888" }}>{playerTitle}</p>
                <p style={{ color: "#555", fontSize: 10, marginBottom: 12 }}>{zoneData.name} · Level {level} · {encounters} battles</p>
                {playerClass && <ClassPortrait className={playerClass} size={80} style={{ margin: "0 auto 12px", filter: "grayscale(80%) brightness(0.4)" }} />}
                {hasRevive && (
                    <div style={{ margin: "10px 0", background: "#1a0d2e", border: "1px solid #c060f0", borderRadius: 10, padding: "10px 14px" }}>
                        <p style={{ color: "#c060f0", fontSize: 11, marginBottom: 6 }}>💎 You have a Revive Gem!</p>
                        <Btn onClick={useRevive} border="#c060f0" bg="#1a0d2e" color="#c060f0">💎 Revive (+100 HP, +30 MP)</Btn>
                    </div>
                )}
                <button onClick={reset} style={{ marginTop: 14, padding: "8px 20px", background: "linear-gradient(90deg,#cc2222,#ff4444)", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "Georgia", boxShadow: "0 0 12px #ff000066" }}>New Game</button>
                <div style={{ background: "#00000050", borderRadius: 8, padding: 8, maxHeight: 130, overflowY: "auto", marginTop: 12, fontSize: 10, textAlign: "left" }}>
                    {(finalLog.length ? finalLog : log).slice(-20).map((l, i) => <div key={i} style={{ color: l.color, marginBottom: 2 }}>› {l.msg}</div>)}
                </div>
            </div>
        </div>
    );

    if (screen === "victory") return <VictoryScreen player={player} playerTitle={playerTitle} playerClass={playerClass} level={level} gold={gold} encounters={encounters} equipped={equipped} relics={relics} effStats={effStats} getRelicBonus={getRelicBonus} reset={reset} challengeOnVictory={challengeOnVictory} />;

    if (screen === "hall") return <HallScreen reset={reset} />;

    if (lvlUp) return (
        <div style={{ background: "linear-gradient(160deg,#0a0a00,#1a1800)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia", color: "#eee", padding: 20 }}>
            <style>{CSS}</style>
            <div style={{ fontSize: 40, filter: "drop-shadow(0 0 14px #f0f06099)" }}>🌟</div>
            <h2 style={{ color: "#f0f060", marginBottom: 3, textShadow: "0 0 16px #f0f060" }}>Level Up!</h2>
            <p style={{ color: "#888", marginBottom: 14, fontSize: 11 }}>{playerTitle} — Level {level + 1}. Choose a bonus:</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", animation: "fadeIn 0.4s" }}>
                {UPGRADES.map(upg => (
                    <div key={upg.id} onClick={() => pickUpgrade(upg)}
                        style={{ background: "linear-gradient(140deg,#1a1800,#252200)", border: "2px solid #f0f06055", borderRadius: 14, padding: "12px 10px", width: 108, cursor: "pointer", textAlign: "center", transition: "all 0.2s", boxShadow: "0 4px 12px #f0f06018" }}
                        onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.border = "2px solid #f0f060"; e.currentTarget.style.boxShadow = "0 8px 20px #f0f06044"; }}
                        onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.border = "2px solid #f0f06055"; e.currentTarget.style.boxShadow = "0 4px 12px #f0f06018"; }}>
                        <div style={{ fontSize: 18 }}>{upg.label.split(" ")[0]}</div>
                        <div style={{ color: "#f0f060", fontWeight: "bold", fontSize: 10, margin: "4px 0 2px" }}>{upg.label.split(" ").slice(1).join(" ")}</div>
                        <div style={{ color: "#888", fontSize: 9 }}>{upg.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );

    // ── EXPLORE / COMBAT ───────────────────────────────────────────────────────
    return (
        <div style={{ background: zoneData.bg, minHeight: "100vh", fontFamily: "Georgia", color: "#eee", padding: "10px 10px 20px", paddingTop: 0, transition: "background 1.2s", position: "relative", overflowX: "hidden" }}>
            <style>{CSS}</style>
            {lootQueue.length > 0 && (() => {
                const loot = lootQueue[0];
                const typeColors = { gold: "#f0c060", equip: "#c060f0", bag: "#60a0ff", relic: "#ffcc44", consumable: "#60f0a0" };
                const typeLabels = { gold: "Gold!", equip: "Equipped!", bag: "Saved to Bag", relic: "Relic Found!", consumable: "Item Found!" };
                const color = typeColors[loot.type] || "#c060f0";
                const dismissLoot = () => {
                    const remaining = lootQueue.length - 1;
                    setLootQueue(q => q.slice(1));
                    if (remaining === 0) {
                        // Fire deferred screen transition — but keep the corpse visible until Explore
                        if (pendingVictory === "levelup") { setLvlUp(true); setPendingVictory(null); }
                        else if (pendingVictory === "victory") { setScreen("victory"); setPendingVictory(null); }
                        else { setPendingVictory(null); }
                    }
                };
                return (
                    <div style={{ position: "fixed", inset: 0, background: "#00000088", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
                        onClick={dismissLoot}>
                        <div style={{ background: "linear-gradient(160deg,#0d0d1a,#1a1020)", border: `2px solid ${color}66`, borderRadius: 16, padding: "24px 28px", textAlign: "center", maxWidth: 260, width: "90%", boxShadow: `0 0 40px ${color}44`, animation: "fadeIn 0.2s" }}
                            onClick={e => e.stopPropagation()}>
                            <div style={{ fontSize: 10, color: color, letterSpacing: 2, marginBottom: 8, fontWeight: "bold" }}>{typeLabels[loot.type] || "LOOT!"}</div>
                            <div style={{ fontSize: 52, marginBottom: 8, filter: `drop-shadow(0 0 12px ${color}88)` }}>{loot.icon}</div>
                            <div style={{ color: "#eee", fontWeight: "bold", fontSize: 15, marginBottom: 4 }}>{loot.msg}</div>
                            {loot.desc && <div style={{ color: "#666", fontSize: 10, marginBottom: 16 }}>{loot.desc}</div>}
                            <button onClick={dismissLoot}
                                style={{ padding: "8px 28px", background: `linear-gradient(90deg,${color}44,${color}88)`, color: "#fff", border: `1px solid ${color}`, borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "Georgia", fontWeight: "bold" }}>
                                ✓ Continue{lootQueue.length > 1 ? ` (${lootQueue.length - 1} more)` : ""}
                            </button>
                        </div>
                    </div>
                );
            })()}

            {/* Fixed header — stays at top while page scrolls */}
            <div ref={headerRef} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: zoneData.bg, padding: "8px 10px 4px", borderBottom: "1px solid #ffffff08", boxShadow: "0 2px 12px #00000088" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, background: "#00000070", borderRadius: 10, padding: "5px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {playerClass && <ClassPortrait className={playerClass} size={32} />}
                        <div>
                            <div style={{ color: classData?.color, fontWeight: "bold", fontSize: 11, textShadow: `0 0 6px ${classData?.color}88` }}>{playerTitle}</div>
                            <div style={{ color: "#555", fontSize: 9 }}>{zoneData.name}</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, fontSize: 10, alignItems: "center" }}>
                        <span style={{ color: "#f0c060", fontWeight: "bold" }}>💰{gold}</span>
                        <span style={{ color: "#a0c0ff" }}>Lv.{level}</span>
                        <span style={{ color: "#555" }}>⚔️{encounters}/12</span>
                    </div>
                </div>
                {/* XP bar */}
                {player && <div style={{ marginBottom: 3 }}>
                    <div style={{ background: "#111", borderRadius: 3, height: 3, boxShadow: "inset 0 1px 2px #000" }}>
                        <div style={{ width: `${Math.min(100, (xp / (level * 60)) * 100)}%`, height: "100%", background: "linear-gradient(90deg,#8080ff,#60f0ff)", borderRadius: 3, transition: "width 0.5s", boxShadow: "0 0 4px #60f0ff88" }} />
                    </div>
                    <div style={{ textAlign: "right", fontSize: 8, color: "#444", marginTop: 1 }}>{xp}/{level * 60} XP</div>
                </div>}
                {/* Player HP/MP bars + stats */}
                {player && ep && (
                    <div style={{ background: "#00000040", border: `1px solid ${classData?.color}22`, borderRadius: 10, padding: "6px 10px", animation: hitFlash === "player" ? "flashRed 0.3s" : undefined, position: "relative" }}>
                        <CombatAnimOverlay anim={combatAnim?.target === "player" ? combatAnim : null} />
                        <AnimatedBar val={player.hp} max={player.maxHp} color={player.hp / player.maxHp > 0.5 ? "#3de060" : player.hp / player.maxHp > 0.25 ? "#f0c060" : "#ff4444"} label="❤️ HP" floats={playerFloats} />
                        <AnimatedBar val={player.mp} max={player.maxMp} color="#5080ff" label="💙 MP" floats={[]} />
                        <div style={{ fontSize: 10, color: "#666", marginTop: 2, display: "flex", gap: 5, flexWrap: "wrap" }}>
                            <span>ATK <b style={{ color: "#ddd" }}>{ep.atk + rb.atk}</b></span>
                            <span>DEF <b style={{ color: "#ddd" }}>{ep.def + rb.def}</b></span>
                            <span>🎯<b style={{ color: "#ddd" }}>{(ep.crit || 2) + rb.crit}%</b></span>
                            <span>💨<b style={{ color: "#ddd" }}>SPD {ep.spd + rb.spd}</b></span>
                            <span>✨<b style={{ color: "#ddd" }}>{ep.manaRegen + rb.manaRegen}/t</b></span>
                            {hasP(equipped, "lifesteal") && <span style={{ color: "#ff6090" }}>🩸LS5</span>}
                            {hasP(equipped, "lifesteal2") && <span style={{ color: "#cc2222" }}>🩸LS8</span>}
                            {hasP(equipped, "reflect") && <span style={{ color: "#f0f060" }}>👑Ref</span>}
                            {hasP(equipped, "flatDR") && <span style={{ color: "#60a0ff" }}>🛡-2DR</span>}
                            {hasP(equipped, "magicDR") && <span style={{ color: "#88ccff" }}>✨-4 magic DR</span>}
                            {hasP(equipped, "abilityBonus") && <span style={{ color: "#ffa060" }}>🌟+Abil</span>}
                            {hasP(equipped, "holyAura") && <span style={{ color: "#ffe0a0" }}>✨+2/t</span>}
                            {hasP(equipped, "cursedPlate") && <span style={{ color: "#cc2222" }}>💀-3/t</span>}
                        </div>
                        <StatusPills />
                    </div>
                )}
            </div>
            {/* Spacer — sized to exactly the fixed header so content starts below it */}
            <div style={{ height: headerHeight + 4 }} />

            {/* Defeated enemy — grayed out while loot popups are shown */}
            {defeatedEnemy && !combat && (
                <div style={{ background: "#00000050", border: "1px solid #44444433", borderRadius: 12, padding: "8px 10px", marginBottom: 5, filter: "grayscale(100%) brightness(0.45)", opacity: 0.7, transition: "opacity 0.4s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <EnemyPortrait enemyId={getEnemyPortraitId(defeatedEnemy)} size={72} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, color: "#888", fontWeight: "bold", marginBottom: 2 }}>☠️ {defeatedEnemy.name} — Defeated</div>
                            <AnimatedBar val={0} max={defeatedEnemy.maxHp} color="#444" label="💔 HP" floats={[]} />
                        </div>
                    </div>
                </div>
            )}

            {/* Enemy card */}
            {combat && enemy && (
                <div style={{ background: "#00000050", border: `1px solid ${zone === 3 ? "#ff440044" : "#ff404033"}`, borderRadius: 12, padding: "8px 10px", marginBottom: 5, animation: hitFlash === "enemy" ? "flashRed 0.3s" : undefined, position: "relative" }}>
                    <CombatAnimOverlay anim={combatAnim?.target === "enemy" ? combatAnim : null} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <EnemyPortrait enemyId={getEnemyPortraitId(enemy)} size={72} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, color: zone === 3 ? "#ff8844" : enemy.elite ? "#ffaa00" : "#ff8080", fontWeight: "bold", marginBottom: 2 }}>{enemy.name}</div>
                            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                                {enemy.unique && <StatusPill label="💠UNIQUE" color="#c060f0" />}
                                {enemy.elite && <StatusPill label="⚡ELITE" color="#ffaa00" />}
                                {enemy.affix && <StatusPill label={AFFIX_LABELS[enemy.affix]} color="#ff9944" />}
                                {enemy.affix2 && <StatusPill label={AFFIX_LABELS[enemy.affix2]} color="#cc3333" />}
                                {enemy.minorSuffix && <StatusPill label={MINOR_SUFFIXES[enemy.minorSuffix].label} color={MINOR_SUFFIXES[enemy.minorSuffix].color} />}
                                {enemy.raged && <StatusPill label="😤RAGED" color="#ff4400" />}
                                {enemy.deathMarked && <StatusPill label="💀DMARK" color="#880000" />}
                                {se.enemyBlind > 0 && <StatusPill label={`🌑Blind(${se.enemyBlind})`} color="#ff88ff" />}
                            </div>
                            <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>ATK {enemy.atk} · DEF {enemy.def}</div>
                        </div>
                    </div>
                    <AnimatedBar val={enemy.hp} max={enemy.maxHp} color={zone === 3 ? "#cc3300" : enemy.elite ? "#ff8800" : "#e05050"} label="💔 Enemy HP" floats={enemyFloats} />
                </div>
            )}

            {/* Log */}
            <div ref={logRef} style={{ background: "#00000060", borderRadius: 8, padding: "5px 8px", height: 76, overflowY: "auto", marginBottom: 5, fontSize: 10, border: "1px solid #ffffff08" }}>
                {log.map((l, i) => <div key={i} style={{ color: l.color, marginBottom: 2, lineHeight: 1.3 }}>› {l.msg}</div>)}
            </div>

            {/* Combat actions */}
            {combat && turn === "player" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {equipped.trinket && !trinketUsed && (
                        <Btn onClick={useTrinket} border="#ff88ff" bg="#1a0d2e" color="#ff88ff">
                            {equipped.trinket.icon} {equipped.trinket.activeName} — {equipped.trinket.activeDesc} <span style={{ opacity: 0.5, fontSize: 9 }}>(Free)</span>
                        </Btn>
                    )}
                    {equipped.trinket && trinketUsed && <div style={{ fontSize: 9, color: "#333", marginBottom: 1 }}>{equipped.trinket.icon} {equipped.trinket.activeName} — used</div>}
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        <Btn onClick={() => playerAction("attack")} border="#60f060" bg="#0d2e0d" color="#60f060">⚔️ Attack</Btn>
                        <Btn onClick={() => playerAction("flee")} border="#f0a060" bg="#2e1a0d" color="#f0a060">🏃 Flee</Btn>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {classData?.abilities.map((ab, i) => {
                            const isDarkSac = ab.type === "darkSacrifice";
                            const hpCost = isDarkSac && player ? Math.floor(player.hp * 0.2) : 0;
                            const cantAfford = isDarkSac ? (player && player.hp - hpCost <= 0) : (player && player.mp < ab.cost);
                            return (
                                <Btn key={i} onClick={() => playerAction("ability", ab)} disabled={cantAfford} border={classData.color} bg="#1a1a2e" color={classData.color}>
                                    {isDarkSac ? `☠️ ${ab.name} (-${hpCost}HP)` : `✨ ${ab.name}`}
                                    <span style={{ opacity: 0.5, fontSize: 9 }}>{isDarkSac ? "" : `(${ab.cost}MP)`}</span>
                                </Btn>
                            );
                        })}
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {inventory.filter(it => it.effect !== "revive" && !it.isGear).map(item => (
                            <button key={item.id} onClick={() => playerAction("item", inventory.indexOf(item))}
                                style={{ background: "#0d1a2e", border: "1px solid #60c0f044", color: "#60c0f0", borderRadius: 8, padding: "4px 7px", cursor: "pointer", fontFamily: "Georgia", fontSize: 10, display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 8px #60c0f066"}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                                <ItemPortrait itemId={item.id} size={22} />
                                {item.name}×{item.qty}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {combat && turn === "enemy" && (
                <div style={{ textAlign: "center", color: "#ff8080", padding: 8, fontSize: 11, background: "#ff000010", borderRadius: 8, animation: "blink 0.8s infinite" }}>
                    ⌛ Enemy acting...
                </div>
            )}

            {/* Explore / Shop / Equip */}
            {!combat && !lvlUp && (
                <div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 5 }}>
                        <Btn onClick={startCombat} border="#f0c060" bg="#2e2000" color="#f0c060">⚔️ Explore</Btn>
                        <Btn onClick={() => { setShowShop(s => !s); setShowEquip(false); }} border="#60c0f0" bg="#0d1a2e" color="#60c0f0">🏪 Shop</Btn>
                        <Btn onClick={() => { setShowEquip(s => !s); setShowShop(false); }} border="#c060f0" bg="#1a0d2e" color="#c060f0">🎽 Equipment</Btn>
                    </div>

                    {inventory.filter(it => it.effect !== "revive" && !it.isGear).length > 0 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 5 }}>
                            {inventory.filter(it => it.effect !== "revive" && !it.isGear).map(item => (
                                <div key={item.id}>
                                    <button onClick={() => !showShop && useItemOutside(inventory.indexOf(item))}
                                        style={{ background: showShop ? "#0d0d0d" : "#0d1a2e", border: `1px solid ${showShop ? "#33333344" : "#60c0f033"}`, color: showShop ? "#444" : "#60c0f0", borderRadius: 8, padding: "4px 7px", cursor: showShop ? "not-allowed" : "pointer", fontFamily: "Georgia", fontSize: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, opacity: showShop ? 0.5 : 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><ItemPortrait itemId={item.id} size={20} /> Use {item.name}×{item.qty}</div>
                                        {showShop && <div style={{ color: "#ff4444", fontSize: 8 }}>Cannot be used while shopping</div>}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Shop */}
                    {showShop && (
                        <div style={{ background: "#00000055", border: "1px solid #60c0f022", borderRadius: 12, padding: 10, marginBottom: 5 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <span style={{ color: "#f0c060", fontWeight: "bold", fontSize: 11 }}>🏪 Merchant · 💰{gold}g</span>
                                {shopMsg && <span style={{ color: "#60f0a0", fontSize: 10 }}>{shopMsg}</span>}
                            </div>
                            <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
                                {["consumables", "equipment", "sell"].map(t => (
                                    <Btn key={t} onClick={() => setShopTab(t)} border={shopTab === t ? "#f0c060" : "#333"} bg={shopTab === t ? "#2e2000" : "#1a1a2e"} color={shopTab === t ? "#f0c060" : "#666"}>{t.charAt(0).toUpperCase() + t.slice(1)}</Btn>
                                ))}
                            </div>

                            {shopTab === "consumables" && (
                                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                    {CONSUMABLES.map(item => {
                                        const ro = item.id === "revive" && hasRevive;
                                        return (
                                            <button key={item.id} onClick={() => buyConsumable(item)} disabled={gold < item.cost || ro}
                                                style={{ background: "#1a1a1a", border: "1px solid #555", color: gold < item.cost || ro ? "#444" : "#ddd", borderRadius: 8, padding: "6px 8px", cursor: gold < item.cost || ro ? "not-allowed" : "pointer", fontFamily: "Georgia", fontSize: 10, display: "flex", alignItems: "center", gap: 5, opacity: gold < item.cost || ro ? 0.5 : 1 }}>
                                                <ItemPortrait itemId={item.id} size={26} />
                                                <span style={{ lineHeight: 1.3 }}>{item.name}<br /><span style={{ fontSize: 8, color: "#888" }}>{item.cost}g{ro ? " (owned)" : ""}</span></span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {shopTab === "equipment" && (
                                <div>
                                    {[
                                        { slot: "head", label: "🪖 Helmets" },
                                        { slot: "weapon", label: "⚔️ Weapons" },
                                        { slot: "body", label: "🥋 Body Armor" },
                                        { slot: "ring", label: "💍 Rings" },
                                    ].map(({ slot, label }) => (
                                        <div key={slot} style={{ marginBottom: 8 }}>
                                            <div style={{ color: "#555", fontSize: 9, fontWeight: "bold", letterSpacing: 1, marginBottom: 4, borderBottom: "1px solid #ffffff08", paddingBottom: 2 }}>{label}</div>
                                            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                                {EQUIPMENT.filter(e => e.slot === slot).map(item => {
                                                    const owned = equipped[item.slot]?.id === item.id;
                                                    return (
                                                        <button key={item.id} onClick={() => buyEquipment(item)} disabled={gold < item.cost || owned}
                                                            style={{ background: owned ? "#0d2e0d" : "#1a1a1a", border: `1px solid ${owned ? "#60f060" : "#555"}`, color: gold < item.cost || owned ? "#555" : "#ddd", borderRadius: 8, padding: "6px 8px", cursor: gold < item.cost || owned ? "not-allowed" : "pointer", fontFamily: "Georgia", fontSize: 10, display: "flex", alignItems: "center", gap: 5, opacity: gold < item.cost ? 0.5 : 1 }}>
                                                            <ItemPortrait itemId={item.id} size={26} />
                                                            <span style={{ lineHeight: 1.3 }}>
                                                                {item.name}<br />
                                                                <span style={{ fontSize: 10, color: "#aaa" }}>{item.desc}</span><br />
                                                                <span style={{ fontSize: 8, color: "#f0c060" }}>{item.cost}g{owned ? " ✓" : ""}</span>
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {shopTab === "sell" && (
                                <div>
                                    <div style={{ color: "#555", fontSize: 9, marginBottom: 6 }}>Sell items from your bag (unequip first to sell gear):</div>
                                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                        {inventory.map((item, idx) => (
                                            <button key={idx} onClick={() => sellItem(item, idx)}
                                                style={{ background: "#1a1a1a", border: "1px solid #555", color: "#ddd", borderRadius: 8, padding: "6px 8px", cursor: "pointer", fontFamily: "Georgia", fontSize: 10, display: "flex", alignItems: "center", gap: 5 }}>
                                                <ItemPortrait itemId={item.id} size={22} />
                                                <span style={{ lineHeight: 1.3 }}>{item.name}×{item.qty}<br /><span style={{ fontSize: 8, color: "#f0c060" }}>{item.sellPrice || Math.floor(item.cost / 2)}g</span></span>
                                            </button>
                                        ))}
                                        {relics.map((r, i) => (
                                            <button key={i} onClick={() => sellRelic(i)}
                                                style={{ background: "#1a1a1a", border: "1px solid #ffcc4444", color: "#ddd", borderRadius: 8, padding: "6px 8px", cursor: "pointer", fontFamily: "Georgia", fontSize: 10, display: "flex", alignItems: "center", gap: 5 }}>
                                                <ItemPortrait itemId={r.id} size={22} />
                                                <span style={{ lineHeight: 1.3 }}>{r.name}<br /><span style={{ fontSize: 8, color: "#f0c060" }}>{r.sellPrice}g</span></span>
                                            </button>
                                        ))}
                                        {inventory.length === 0 && relics.length === 0 && (
                                            <div style={{ color: "#333", fontSize: 10 }}>Nothing to sell. Unequip items first.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Equipment panel */}
                    {showEquip && (
                        <div style={{ background: "#00000055", border: "1px solid #c060f022", borderRadius: 12, padding: 10, marginBottom: 5 }}>
                            <div style={{ color: "#c060f0", marginBottom: 6, fontWeight: "bold", fontSize: 11 }}>🎽 Equipment</div>
                            {["head", "weapon", "body", "ring", "trinket"].map(slot => (
                                <div key={slot} style={{ display: "flex", alignItems: "center", marginBottom: 5, gap: 5, fontSize: 10, borderBottom: "1px solid #ffffff06", paddingBottom: 4 }}>
                                    <span style={{ color: slot === "trinket" ? "#ff88ff" : "#555", textTransform: "capitalize", width: 46, flexShrink: 0 }}>{slot}:</span>
                                    {equipped[slot] ? (
                                        <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 5 }}>
                                            <ItemPortrait itemId={equipped[slot].id} size={26} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: "#ddd" }}>{equipped[slot].name}</div>
                                                <div style={{ color: "#aaa", fontSize: 11 }}>{equipped[slot].desc}</div>
                                            </div>
                                            <Btn onClick={() => unequipSlot(slot)} border="#ff6060" bg="#2e0d0d" color="#ff6060" style={{ fontSize: 9, padding: "2px 6px" }}>Move to Bag</Btn>
                                        </div>
                                    ) : (
                                        <span style={{ color: "#333", fontSize: 9 }}>
                                            {slot === "trinket" ? "— drops from monsters only —" : "— none equipped —"}
                                        </span>
                                    )}
                                </div>
                            ))}
                            {relics.length > 0 && (
                                <div style={{ marginTop: 4, paddingTop: 4 }}>
                                    <div style={{ color: "#ffcc44", fontSize: 10, marginBottom: 3 }}>🦴 Passive Relics</div>
                                    {relics.map((r, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, fontSize: 9, color: "#ffcc44" }}>
                                            <ItemPortrait itemId={r.id} size={20} />{r.name} — {r.desc}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {Object.values(getBonus(equipped)).some(v => v > 0) && (
                                <div style={{ marginTop: 4, fontSize: 9, color: "#60f0a0", borderTop: "1px solid #ffffff06", paddingTop: 4 }}>
                                    Bonuses: {Object.entries(getBonus(equipped)).filter(([, v]) => v > 0).map(([k, v]) => `+${v} ${k}`).join(" · ")}
                                </div>
                            )}
                            {inventory.filter(i => i.isGear).length > 0 && (
                                <div style={{ marginTop: 8, borderTop: "1px solid #ffffff10", paddingTop: 8 }}>
                                    <div style={{ color: "#f0c060", fontSize: 10, marginBottom: 6, fontWeight: "bold" }}>🎒 In Bag</div>
                                    {inventory.filter(i => i.isGear).map((item, idx) => (
                                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, background: "#ffffff06", borderRadius: 7, padding: "4px 6px" }}>
                                            <ItemPortrait itemId={item.id} size={26} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: "#ddd", fontSize: 10, fontWeight: "bold" }}>{item.name}</div>
                                                <div style={{ color: "#aaa", fontSize: 9 }}>{item.desc}</div>
                                            </div>
                                            <Btn onClick={() => equipFromBag(item)} border="#60c060" bg="#0d2e0d" color="#60f060" style={{ fontSize: 9, padding: "2px 8px", flexShrink: 0 }}>Equip</Btn>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}