// The palettes the picker offers. Each one sets the backdrop (a base gradient
// and five glowing blobs) and the app's own colors (surfaces, text, roles), so
// panels and the prompt box match the background.
//
// To add one: copy an entry, give it a new `id`, add `author: '<your GitHub handle>'`,
// and run `claude plugin validate .` and `claude plugin test .`. See CONTRIBUTING.md.
// Keep surfaces dark and close together, and `text-muted` readable on them.

export type Palette = {
  id: string
  name: string
  // GitHub handle of whoever made it (community palettes), shown in the picker.
  author?: string
  // The background style it looks best in (see hooks/styles.ts). Absent: the current one.
  style?: string
  // Base gradient, bottom-left to top-right.
  base: readonly [string, string, string]
  // The five glows, largest-and-centre first.
  glows: readonly [string, string, string, string, string]
  // The app's surfaces, darkest first; surface0 also tints the reading column
  // and the see-through panels.
  surfaces: readonly [string, string, string, string]
  text: { primary: string; secondary: string; muted: string }
  roles: { accent: string; danger: string; success: string; warning: string; pro: string }
}

export const PALETTES: readonly Palette[] = [
  {
    id: 'ember',
    name: 'Ember',
    base: ['#1a0500', '#4a0d06', '#7a1a08'],
    glows: ['#8b1e0f', '#4a0d08', '#ff4e1a', '#d13a12', '#ffa23a'],
    surfaces: ['#2a0e08', '#331209', '#3c170c', '#40190d'],
    text: { primary: '#fff3ea', secondary: '#f0d6c6', muted: '#d9b6a2' },
    roles: { accent: '#ff7a2e', danger: '#ff4d6a', success: '#7fd88a', warning: '#ffc04d', pro: '#c79bff' },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    base: ['#1f0b2e', '#5a1846', '#3b1d6e'],
    glows: ['#9c2a6b', '#3b1d6e', '#e0457b', '#ff8a3d', '#ffd36b'],
    surfaces: ['#2a1230', '#311536', '#38193d', '#3b1b41'],
    text: { primary: '#fff1f4', secondary: '#f0d3de', muted: '#d6b2c2' },
    roles: { accent: '#ff8a3d', danger: '#ff4d6a', success: '#7fe0a0', warning: '#ffd36b', pro: '#c79bff' },
  },
  {
    id: 'violet',
    name: 'Violet',
    base: ['#2a1a8a', '#4a1fa8', '#3a1670'],
    glows: ['#5b22c9', '#2e3bd6', '#13c6f2', '#b532dc', '#ff4e5a'],
    surfaces: ['#1d1448', '#23194f', '#281e58', '#2a205c'],
    text: { primary: '#f6f2ff', secondary: '#d3cbef', muted: '#b4abd6' },
    roles: { accent: '#ff6a5c', danger: '#ff5d7a', success: '#5fe0b0', warning: '#ffb054', pro: '#a88bff' },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    base: ['#0a0030', '#1d0040', '#120024'],
    glows: ['#3a0080', '#2a5cff', '#00f0ff', '#7a00ff', '#ff00a0'],
    surfaces: ['#1a0b33', '#200f3d', '#261347', '#29164c'],
    text: { primary: '#f7f0ff', secondary: '#dccdf5', muted: '#bfaee6' },
    roles: { accent: '#00e5ff', danger: '#ff3d7f', success: '#3dffb0', warning: '#ffd23d', pro: '#c77dff' },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    base: ['#020d1f', '#061a40', '#03305a'],
    glows: ['#023e7d', '#0353a4', '#00a6c8', '#00c2a8', '#7fffd4'],
    surfaces: ['#08182f', '#0c1f3a', '#102644', '#122948'],
    text: { primary: '#eaf6ff', secondary: '#c4dcec', muted: '#9fbfd4' },
    roles: { accent: '#3fd8f0', danger: '#ff5d7a', success: '#5fe0b0', warning: '#ffc04d', pro: '#a88bff' },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    base: ['#04101e', '#0b1a2e', '#10243a'],
    glows: ['#14a37f', '#3a7bd5', '#1fd1a5', '#8e44ad', '#5b6cff'],
    surfaces: ['#0b1828', '#0f1f31', '#13253a', '#15283e'],
    text: { primary: '#eafff8', secondary: '#c3e0d8', muted: '#9cc0b6' },
    roles: { accent: '#1fd1a5', danger: '#ff5d7a', success: '#7be0a0', warning: '#ffc04d', pro: '#b07cff' },
  },
  {
    id: 'mint',
    name: 'Mint lime',
    base: ['#04201e', '#0f3b3a', '#0b2b20'],
    glows: ['#0f6b5f', '#11998e', '#38ef7d', '#7be0a0', '#d4fc79'],
    surfaces: ['#0c2420', '#102b26', '#14322c', '#163530'],
    text: { primary: '#effff6', secondary: '#cde8da', muted: '#a9cbb9' },
    roles: { accent: '#38ef7d', danger: '#ff5d7a', success: '#7be0a0', warning: '#f2d14b', pro: '#b07cff' },
  },
  {
    id: 'rose',
    name: 'Rose gold',
    base: ['#1f0e14', '#3d1f2b', '#2e1520'],
    glows: ['#8a4a57', '#b76e79', '#d98c8c', '#f4a7b9', '#f7d6a8'],
    surfaces: ['#2a161d', '#321a23', '#3a1f29', '#3d212c'],
    text: { primary: '#fff4f2', secondary: '#f0d6d3', muted: '#d6b3b0' },
    roles: { accent: '#f4a7b9', danger: '#ff5d6a', success: '#7fd8a0', warning: '#f7c98a', pro: '#c79bff' },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    base: ['#05050f', '#0b0d24', '#141838'],
    glows: ['#252a66', '#1b1f4b', '#3a3f8f', '#4b52b8', '#7d83d6'],
    surfaces: ['#0f1024', '#13152c', '#171a33', '#191c37'],
    text: { primary: '#eef0ff', secondary: '#c9cdf0', muted: '#a5aad6' },
    roles: { accent: '#8e96ff', danger: '#ff5d7a', success: '#5fe0b0', warning: '#ffc04d', pro: '#c79bff' },
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    base: ['#12002a', '#2b0a4a', '#4a0b5c'],
    glows: ['#6a1b9a', '#ff2e97', '#ff8c42', '#3d1a78', '#f9c80e'],
    surfaces: ['#1e0a33', '#240d3d', '#2a1047', '#2d124c'],
    text: { primary: '#fff0fb', secondary: '#ecd0e8', muted: '#ccaed0' },
    roles: { accent: '#ff2e97', danger: '#ff5d6a', success: '#5fe0b0', warning: '#f9c80e', pro: '#b07cff' },
  },
  {
    id: 'lagoon',
    name: 'Lagoon',
    base: ['#001a1f', '#00313a', '#00454f'],
    glows: ['#006d77', '#00b4b4', '#83e8d7', '#0a9396', '#ffd6a5'],
    surfaces: ['#062226', '#08292e', '#0b3036', '#0d343a'],
    text: { primary: '#eafffd', secondary: '#c4e6e2', muted: '#9fc6c1' },
    roles: { accent: '#3fe0d0', danger: '#ff5d7a', success: '#7be0a0', warning: '#ffc04d', pro: '#b07cff' },
  },
  {
    id: 'forest',
    name: 'Forest',
    base: ['#07140c', '#10241a', '#1b3326'],
    glows: ['#1b4332', '#2d6a4f', '#52b788', '#40916c', '#d4a373'],
    surfaces: ['#0d1d14', '#112319', '#15291e', '#172c21'],
    text: { primary: '#f0fbf2', secondary: '#cfe5d5', muted: '#abc6b3' },
    roles: { accent: '#74c69d', danger: '#ff5d6a', success: '#95d5b2', warning: '#e9c46a', pro: '#c79bff' },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    base: ['#140f24', '#231a3d', '#2e2250'],
    glows: ['#5a4a9c', '#9d8df1', '#c3b1e1', '#7b6ccf', '#f1c0e8'],
    surfaces: ['#1c1630', '#211a38', '#261e40', '#292144'],
    text: { primary: '#f6f2ff', secondary: '#dcd3f2', muted: '#bdb3d9' },
    roles: { accent: '#b8a9ff', danger: '#ff6b8a', success: '#7fe0b0', warning: '#ffd27a', pro: '#d9a8ff' },
  },
  {
    id: 'citrus',
    name: 'Citrus',
    base: ['#1a1000', '#2e1d02', '#3a2a06'],
    glows: ['#ff8800', '#ffb703', '#c3e536', '#fb5607', '#ffe066'],
    surfaces: ['#241806', '#2b1d08', '#32220a', '#35240b'],
    text: { primary: '#fffaf0', secondary: '#f0e2c8', muted: '#d6c4a2' },
    roles: { accent: '#ffb703', danger: '#ff5d6a', success: '#a7d93c', warning: '#ffd166', pro: '#c79bff' },
  },
  {
    id: 'neon-tokyo',
    name: 'Neon Tokyo',
    base: ['#05031a', '#0e0830', '#1a0a3a'],
    glows: ['#1a1a6e', '#ff0080', '#00d9ff', '#7a00ff', '#ff5ec4'],
    surfaces: ['#120d2a', '#161033', '#1a133c', '#1c1540'],
    text: { primary: '#f5f2ff', secondary: '#d6cff0', muted: '#b6addb' },
    roles: { accent: '#ff3fa4', danger: '#ff4d6a', success: '#3dffb0', warning: '#ffd23d', pro: '#9b7dff' },
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    base: ['#03020f', '#0d0826', '#1c0f3d'],
    glows: ['#2b1a6b', '#5a189a', '#c77dff', '#3a86ff', '#ff70a6'],
    surfaces: ['#110c26', '#150f2e', '#191236', '#1b143a'],
    text: { primary: '#f4f0ff', secondary: '#d5cdf0', muted: '#b4aad8' },
    roles: { accent: '#c77dff', danger: '#ff5d7a', success: '#5fe0b0', warning: '#ffc04d', pro: '#8fb8ff' },
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry blossom',
    base: ['#1c0b14', '#33152a', '#40193a'],
    glows: ['#7a2d55', '#e56b9f', '#ffb3c6', '#a83279', '#fbe2e8'],
    surfaces: ['#26101c', '#2d1321', '#341726', '#381929'],
    text: { primary: '#fff2f6', secondary: '#f0d2dd', muted: '#d6b0be' },
    roles: { accent: '#ff8fb8', danger: '#ff5d6a', success: '#7fd8a0', warning: '#ffc87a', pro: '#c79bff' },
  },
  {
    id: 'arctic',
    name: 'Arctic',
    base: ['#04111c', '#0a2236', '#12324d'],
    glows: ['#1b4965', '#5fa8d3', '#bee9f5', '#62b6cb', '#e8f6ff'],
    surfaces: ['#0c1b2a', '#0f2132', '#13273a', '#152a3e'],
    text: { primary: '#f0f9ff', secondary: '#cfe2ee', muted: '#a9c3d4' },
    roles: { accent: '#7cc8f0', danger: '#ff5d7a', success: '#6fe0b8', warning: '#ffc04d', pro: '#b8a2ff' },
  },
  {
    id: 'desert',
    name: 'Desert',
    base: ['#1a0e06', '#2e1a0d', '#3d2414'],
    glows: ['#8c4a2f', '#c96f3b', '#e9b872', '#a65d3a', '#f2d7a6'],
    surfaces: ['#26160c', '#2d1a0e', '#341f11', '#382113'],
    text: { primary: '#fff6ec', secondary: '#eedbc8', muted: '#d4bba2' },
    roles: { accent: '#e9a35a', danger: '#ff5d6a', success: '#9cd38a', warning: '#f2c46b', pro: '#c79bff' },
  },
  {
    id: 'autumn',
    name: 'Autumn',
    base: ['#140b04', '#2a1608', '#33200c'],
    glows: ['#7f2e0f', '#bc5215', '#e09f3e', '#606c38', '#f4d58d'],
    surfaces: ['#21140a', '#28180c', '#2e1c0e', '#321e0f'],
    text: { primary: '#fff5e8', secondary: '#ecd9c0', muted: '#d1ba9b' },
    roles: { accent: '#e09f3e', danger: '#ff5d5d', success: '#a3c46a', warning: '#f4c95d', pro: '#c79bff' },
  },
  {
    id: 'matrix',
    name: 'Matrix',
    base: ['#000a03', '#001a08', '#002b0f'],
    glows: ['#003b13', '#00a83a', '#39ff6a', '#007a2a', '#b6ffbf'],
    surfaces: ['#06160b', '#081b0e', '#0b2011', '#0c2313'],
    text: { primary: '#ecffef', secondary: '#c3e6c9', muted: '#9fc8a7' },
    roles: { accent: '#39ff6a', danger: '#ff5d6a', success: '#7dff9a', warning: '#e6ff4d', pro: '#b07cff' },
  },
  {
    id: 'coffee',
    name: 'Coffee',
    base: ['#120b07', '#22150e', '#2e1d14'],
    glows: ['#4a2c1d', '#7f5539', '#b08968', '#9c6644', '#ddb892'],
    surfaces: ['#1e140e', '#241811', '#2a1c14', '#2d1e16'],
    text: { primary: '#fbf3ec', secondary: '#e6d6c8', muted: '#c9b5a3' },
    roles: { accent: '#d4a373', danger: '#ff6b6b', success: '#a3c48a', warning: '#e9c46a', pro: '#c7a2ff' },
  },
  {
    id: 'graphite',
    name: 'Graphite',
    base: ['#0b0b0d', '#16161a', '#202026'],
    glows: ['#2a2a32', '#4a4a56', '#8a8a99', '#3a3a44', '#c8c8d4'],
    surfaces: ['#18181c', '#1c1c21', '#212126', '#232329'],
    text: { primary: '#f4f4f7', secondary: '#d4d4dc', muted: '#b2b2bd' },
    roles: { accent: '#a9b4ff', danger: '#ff6b7a', success: '#6fe0a8', warning: '#ffc857', pro: '#c7a2ff' },
  },
]

export const DEFAULT_PALETTE = 'ember'

export const paletteById = (id: string | undefined): Palette =>
  PALETTES.find(p => p.id === id) ?? PALETTES.find(p => p.id === DEFAULT_PALETTE) ?? (PALETTES[0] as Palette)
