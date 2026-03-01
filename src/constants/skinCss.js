// @ts-nocheck
/* ═══ THEME SYSTEM — Extracted from IBMasterySuite.jsx v211 ═══ */

export const THEMES = {
  default: {
    id: 'default', name: 'Classic IB', desc: 'Clean & professional', preview: '📘',
    bg: '#f0f4f8',
    cardBg: 'rgba(30,41,59,0.25)', cardBorder: 'rgba(51,65,85,0.3)',
    levels: null, achievements: null, // use defaults
    motivations: null,
  },
  spacemarine: {
    id: 'spacemarine', name: 'Space Marine HUD', desc: 'For the Emperor!', preview: '⚔️',
    bg: '#f1f5f9',
    cardBg: '#ffffff', cardBorder: '#e2e8f0',
    accentOverride: '#00ffff',
    accentSecondary: '#d4a017',
    darkSkin: true,
    geometry: 'armor-plate',
    atmosphere: { scanLines: true, vignette: true, grain: true, ambientPulse: true, hudCorners: true },
    levels: [
      { xp: 0, name: 'Scout', emoji: '⚔️' }, { xp: 100, name: 'Battle-Brother', emoji: '🛡️' },
      { xp: 300, name: 'Tactical Marine', emoji: '🔫' }, { xp: 700, name: 'Sergeant', emoji: '⚡' },
      { xp: 1200, name: 'Veteran', emoji: '💀' }, { xp: 2000, name: 'Lieutenant', emoji: '🦅' },
      { xp: 3500, name: 'Captain', emoji: '🏛️' }, { xp: 5000, name: 'Chapter Champion', emoji: '🏆' },
      { xp: 6000, name: 'Chapter Master', emoji: '👑' },
      { xp: 10000, name: 'Lord Commander', emoji: '☀️' }
    ],
    achievements: {
      streak3: { name: 'Rite of Discipline', icon: '⚔️' }, streak7: { name: 'Iron Vigil', icon: '🛡️' },
      streak14: { name: 'Crusade Veteran', icon: '💀' }, streak30: { name: 'Eternal Crusade', icon: '☀️' },
      q50: { name: 'First Blood', icon: '🩸' }, q100: { name: 'Centurion', icon: '🏛️' },
      q250: { name: 'Chapter Champion', icon: '⚔️' }, q500: { name: 'Destroyer of Ignorance', icon: '💀' },
      first7: { name: 'Level 7 Achieved', icon: '⭐' }, improve2: { name: 'Big Leap', icon: '📈' },
      time1h: { name: 'Watch Duty', icon: '⏱️' }, time5h: { name: 'Campaign Service', icon: '🎖️' },
      time10h: { name: 'Siege Endurance', icon: '🏰' }, time25h: { name: 'Siege Veteran', icon: '⭐' },
      plan1: { name: 'Battle Plan Alpha', icon: '📋' }, plan7: { name: 'Strategic Command', icon: '🗺️' },
      planWeek: { name: 'Full Deployment', icon: '🦅' },
      polymath: { name: 'Multi-Front Assault', icon: '⚡' }, perfect: { name: 'No Heresy Detected', icon: '🔥' },
    },
    motivations: [
      'Knowledge is the greatest weapon. Wield it well, Battle-Brother.',
      'The Emperor protects — but studying helps.',
      'A moment of laxity spawns a lifetime of heresy. Stay vigilant.',
      'In the grim darkness of exams, there is only study.',
      'The codex supports this action. Press on.',
      'Suffer not the ignorance to live. Purge it with knowledge.'
    ],
  },
  cyberpunk: {
    id: 'cyberpunk', name: 'Cyberpunk', desc: 'Jack into the net', preview: '🌃',
    bg: '#f0f0f8',
    cardBg: 'rgba(30,0,60,0.2)', cardBorder: 'rgba(100,0,200,0.2)',
    accentOverride: '#ff00ff',
    levels: [
      { xp: 0, name: 'Streetkid', emoji: '🔌' }, { xp: 100, name: 'Netrunner', emoji: '💻' },
      { xp: 300, name: 'Edge Runner', emoji: '⚡' }, { xp: 700, name: 'Solo', emoji: '🎯' },
      { xp: 1200, name: 'Fixer', emoji: '🔧' }, { xp: 2000, name: 'Corpo Elite', emoji: '🏢' },
      { xp: 3500, name: 'Legendary', emoji: '⭐' }, { xp: 6000, name: 'Night City Boss', emoji: '🌃' },
      { xp: 10000, name: 'Digital God', emoji: '🧠' }
    ],
    achievements: {
      streak3: { name: 'First Hack', icon: '💻' }, streak7: { name: 'System Override', icon: '⚡' },
      streak14: { name: 'Deep Net Dive', icon: '🌐' }, streak30: { name: 'The Matrix', icon: '🟢' },
      q50: { name: 'Data Miner', icon: '💎' }, q100: { name: 'Code Breaker', icon: '🔓' },
      q250: { name: 'Algorithm Master', icon: '🧮' }, q500: { name: 'AI Transcendence', icon: '🤖' },
      first7: { name: 'Critical Hit', icon: '💥' }, improve2: { name: 'Upgrade Installed', icon: '⬆️' },
      time1h: { name: 'Time Online', icon: '📡' }, time5h: { name: 'Deep Dive', icon: '🌊' },
      time10h: { name: 'Wired In', icon: '🔌' }, time25h: { name: 'Braindance Marathon', icon: '🧠' },
      plan1: { name: 'Mission Brief', icon: '📋' }, plan7: { name: 'Gig Economy', icon: '💰' },
      planWeek: { name: 'Full Protocol', icon: '🔋' },
      polymath: { name: 'Multi-Jack', icon: '🔀' }, perfect: { name: 'Zero Day Exploit', icon: '💯' },
    },
    motivations: [
      'Knowledge is chrome, choom. Install it.',
      'In 2077, what makes someone a top student? Getting up to study.',
      'Jack in. Focus up. Flatline that exam.',
      'Your neural link is upgrading. Keep grinding.',
      'The net rewards those who show up.'
    ],
  },
  samurai: {
    id: 'samurai', name: 'Samurai', desc: 'The way of discipline', preview: '⛩️',
    bg: '#f5f2f0',
    cardBg: 'rgba(40,20,10,0.2)', cardBorder: 'rgba(180,80,20,0.15)',
    accentOverride: '#e85d04',
    levels: [
      { xp: 0, name: 'Apprentice', emoji: '🥋' }, { xp: 100, name: 'Ronin', emoji: '⚔️' },
      { xp: 300, name: 'Samurai', emoji: '🗡️' }, { xp: 700, name: 'Kensei', emoji: '🎯' },
      { xp: 1200, name: 'Daimyo', emoji: '🏯' }, { xp: 2000, name: 'Shogun', emoji: '👹' },
      { xp: 3500, name: 'Grandmaster', emoji: '🐉' }, { xp: 6000, name: 'Mythic Blade', emoji: '⭐' },
      { xp: 10000, name: 'Living Legend', emoji: '☀️' }
    ],
    achievements: null,
    motivations: [
      'The sword is only as sharp as the mind that wields it.',
      'Fall seven times, stand up eight.',
      'Discipline is the bridge between goals and accomplishment.',
      'A student who trains is twice as dangerous.',
      'The path to mastery has no shortcuts.'
    ],
  },
  wizard: {
    id: 'wizard', name: 'Arcane Academy', desc: 'Master the arcane arts', preview: '🧙',
    bg: '#f2f0f5',
    cardBg: 'rgba(30,0,50,0.2)', cardBorder: 'rgba(100,50,150,0.2)',
    accentOverride: '#a855f7',
    levels: [
      { xp: 0, name: 'Novice', emoji: '📖' }, { xp: 100, name: 'Apprentice', emoji: '🪄' },
      { xp: 300, name: 'Acolyte', emoji: '🔮' }, { xp: 700, name: 'Conjurer', emoji: '✨' },
      { xp: 1200, name: 'Sorcerer', emoji: '🌙' }, { xp: 2000, name: 'Archmage', emoji: '🧙' },
      { xp: 3500, name: 'Grand Wizard', emoji: '⭐' }, { xp: 6000, name: 'Mythic Sage', emoji: '🌟' },
      { xp: 10000, name: 'Ascended One', emoji: '☀️' }
    ],
    achievements: null,
    motivations: [
      'Every spell begins with study. Every grade begins with practice.',
      'The arcane knowledge flows through those who are disciplined.',
      'Your spellbook grows stronger with each session.',
      'A true mage never stops learning.',
      'Channel your focus. The exam will yield to your will.'
    ],
  },
};
