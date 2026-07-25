(() => {
  // Source avatars:
  // - Copilot: DiceBear "Lorelei", seed "Ludwig", CC0 1.0
  // - Companion: Original Ludwigia animal companion SVG set
  const createAnimalSvg = ({
    key = "animal",
    bgA = "#ffe4c7",
    bgB = "#ffd1dc",
    fur = "#d7864c",
    face = "#fff4ea",
    innerEar = "#fff2e2",
    blush = "#ffb3bf",
    nose = "#2c2f42",
    mouth = "#7c3f1d",
    leftEar = "M16 24L22 9L31 21L16 24Z",
    rightEar = "M48 24L42 9L33 21L48 24Z",
    leftInnerEar = "M20 20L23.5 13.5L28.5 20H20Z",
    rightInnerEar = "M44 20L40.5 13.5L35.5 20H44Z",
    faceRx = 15.5,
    faceRy = 14.5,
    eyeLeftX = 24,
    eyeRightX = 40,
    eyeY = 28,
    forehead = "",
    leftMark = "",
    rightMark = "",
    muzzle = "",
    accessory = "",
    whiskers = "",
  } = {}) => `
    <svg class="site-copilot-avatar__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="${key}Bg" x1="10" y1="8" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stop-color="${bgA}"/>
          <stop offset="1" stop-color="${bgB}"/>
        </linearGradient>
        <radialGradient id="${key}Glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(24 18) rotate(43) scale(36 32)">
          <stop stop-color="#ffffff" stop-opacity=".92"/>
          <stop offset=".44" stop-color="#ffffff" stop-opacity=".18"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#${key}Bg)"/>
      <circle cx="32" cy="32" r="22.5" fill="url(#${key}Glow)"/>
      <path d="${leftEar}" fill="${fur}"/>
      <path d="${rightEar}" fill="${fur}"/>
      <path d="${leftInnerEar}" fill="${innerEar}"/>
      <path d="${rightInnerEar}" fill="${innerEar}"/>
      <ellipse cx="32" cy="34" rx="22" ry="21" fill="${fur}"/>
      ${leftMark}
      ${rightMark}
      <ellipse cx="32" cy="38.2" rx="${faceRx}" ry="${faceRy}" fill="${face}"/>
      ${forehead}
      ${muzzle}
      <ellipse cx="${eyeLeftX}" cy="${eyeY}" rx="5.25" ry="6.2" fill="#fff"/>
      <ellipse cx="${eyeRightX}" cy="${eyeY}" rx="5.25" ry="6.2" fill="#fff"/>
      <circle cx="${eyeLeftX}" cy="${eyeY - 1.6}" r="1.2" fill="#fff"/>
      <circle cx="${eyeRightX}" cy="${eyeY - 1.6}" r="1.2" fill="#fff"/>
      <circle cx="${eyeLeftX - 0.55}" cy="${eyeY + 0.35}" r="2.05" fill="${nose}" data-avatar-pupil="left"/>
      <circle cx="${eyeRightX + 0.55}" cy="${eyeY + 0.35}" r="2.05" fill="${nose}" data-avatar-pupil="right"/>
      <path d="M32 31L35.3 34.3H28.7L32 31Z" fill="${nose}"/>
      <path d="M29.2 36.2C30.2 37.4 31.3 38 32 38C32.7 38 33.8 37.4 34.8 36.2" stroke="${mouth}" stroke-width="1.75" stroke-linecap="round"/>
      <path d="M28 38.8C29.35 40.55 31 41.45 32 41.45C33 41.45 34.65 40.55 36 38.8" stroke="${mouth}" stroke-width="2.1" stroke-linecap="round"/>
      <ellipse cx="21.1" cy="36.2" rx="3.25" ry="2.35" fill="${blush}" fill-opacity=".7"/>
      <ellipse cx="42.9" cy="36.2" rx="3.25" ry="2.35" fill="${blush}" fill-opacity=".7"/>
      ${whiskers}
      ${accessory}
      <circle cx="49.5" cy="17" r="1.4" fill="#fff" fill-opacity=".82"/>
      <path d="M13.8 17.5L15.1 19.7L17.7 20L15.8 21.7L16.3 24.2L13.8 22.9L11.3 24.2L11.8 21.7L9.9 20L12.5 19.7L13.8 17.5Z" fill="#fff" fill-opacity=".54"/>
    </svg>
  `.trim();

  const createCompanionPlaceholderSvg = () => `
    <svg class="site-copilot-avatar__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="companionPlaceholderBg" x1="10" y1="9" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stop-color="#d7defc"/>
          <stop offset="1" stop-color="#f0d8ff"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#companionPlaceholderBg)"/>
      <circle cx="32" cy="27" r="12" fill="#fff7ff" fill-opacity=".92"/>
      <path d="M20 47C23.6 41.67 27.6 39 32 39C36.4 39 40.4 41.67 44 47" stroke="#6f6aa8" stroke-width="3" stroke-linecap="round"/>
      <circle cx="27.5" cy="26.5" r="2" fill="#3c3f5b" data-avatar-pupil="left"/>
      <circle cx="36.5" cy="26.5" r="2" fill="#3c3f5b" data-avatar-pupil="right"/>
      <path d="M32 29.8L34.8 32.8H29.2L32 29.8Z" fill="#3c3f5b"/>
      <path d="M29.4 35.2C30.25 36 31.1 36.4 32 36.4C32.9 36.4 33.75 36 34.6 35.2" stroke="#6f6aa8" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M16.5 16.5L20 19.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M44 19.5L47.5 16.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="18" cy="18" r="2.1" fill="#fff" fill-opacity=".82"/>
      <circle cx="46" cy="18" r="1.7" fill="#fff" fill-opacity=".72"/>
    </svg>
  `.trim();

  const companionOptions = [];

  const variants = {
    copilot: `
      <svg class="site-copilot-avatar__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 980" fill="none" aria-hidden="true"><mask id="copilotLoreleiMask"><rect width="980" height="980" rx="274.4" ry="274.4" x="0" y="0" fill="#fff"/></mask><g mask="url(#copilotLoreleiMask)"><rect fill="url(#copilotLoreleiGradient)" width="980" height="980" x="0" y="0"/><defs><linearGradient id="copilotLoreleiGradient" gradientTransform="rotate(331 .5 .5)"><stop stop-color="#c0aede"/><stop offset="1" stop-color="#d1d4f9"/></linearGradient></defs><g transform="translate(10 -60)"><path d="M586 147c15-1 29 1 42 8 4 2 8 2 11 5 2 3 1 7-2 9-3 1-6-1-9-2h-28a95 95 0 0 0-79 57c15-7 30-13 47-14 14-2 28-1 42 2 29 7 56 21 78 41 20 18 35 41 43 66l3 11c10 20 17 43 18 66 2 36-9 73-33 101-11 13-23 23-38 32l4 44 1 17a143 143 0 0 1-111 128c-17 4-35 6-52 5h-33c-23 1-47 7-69 15l-24 7c-11 3-23 1-34 3a79 79 0 0 1-57-22c-8 2-15 5-23 4s-16-4-20-11c3-1 6-2 9-5 5-5 6-12 5-19-1-16-7-29-14-43l-17-36-14-30-23-52a211 211 0 0 1-3-160 282 282 0 0 1 148-154c26-10 55-17 83-14 16 1 34 6 47 16-1-9 4-18 9-26 12-18 33-32 53-40 13-6 26-8 40-9Z" fill="#000"/><path d="M495 231a231 231 0 0 1 219 204c1 10 2 21 0 30-1 4-1 7-4 8-3-10-3-19-4-29a220 220 0 0 0-239-205c-42 4-83 19-117 44l-17 13a221 221 0 0 0-78 164c0 23 7 43 15 64h17c3 1 4 4 2 6l-6 2c-15 1-31 7-42 17-8 9-14 19-16 31-3 15 0 32 8 45 9 15 24 27 40 33 14 5 29 7 43 5 4-1 8-2 11 0v3c-5 5-11 6-18 7-16 3-33-1-47-8a86 86 0 0 1-47-58c-4-18-1-37 9-53 8-12 20-21 34-26-7-14-10-28-12-43-2-18-2-35 0-53 1-13 4-25 8-38a227 227 0 0 1 99-122c41-28 92-43 142-41Z" fill="#000"/><path d="M535 244a220 220 0 0 1 171 200c1 10 1 19 4 29l-2 18v22c-3 4-4 9-4 14-2 8-2 15-2 23v65c0 21-3 42-11 61-4 13-10 24-18 35-10 12-21 22-34 31-11 9-24 17-37 24l-22 14-12 8 9-2c-3 11-3 24-4 36 0 8 1 16 7 22a235 235 0 0 0 81 45c6 7 11 16 13 25 1 9 0 18-4 27-6 10-14 18-23 24-13 10-28 17-43 22a417 417 0 0 1-217 11c-16-3-33-9-48-17-10-5-21-12-28-21-6-6-10-14-11-22-2-10 0-21 5-30 21-13 39-32 49-54 5-11 7-22 8-34 1-16 0-32-1-47-2-20-3-41-8-61 11 12 23 24 37 32 17 11 36 20 55 26 20 7 41 13 63 18l25 3c3 0 6 0 8-2 2-1 1-2 2-3l-17-2c-29-7-58-16-87-27-18-7-36-15-53-27-18-13-33-30-47-47l-11-16-1-1v-3c-3-2-7-1-11 0-14 2-29 0-43-5-16-6-31-18-40-33-8-13-11-30-8-45 2-12 8-22 16-31 11-10 27-16 42-17l6-2c2-2 1-5-2-6h-17c-8-21-15-41-15-64-1-14 2-27 5-41a221 221 0 0 1 73-123l17-13a230 230 0 0 1 185-39Z" fill="#fff"/><path d="M708 513c3 3 2 7 3 12v29c0 26 2 54 0 80-3 31-14 63-36 86-25 28-57 51-93 64l2 7v35c1 6 4 10 8 14l26 19 32 20 24 12c2 0 3 1 5 3l-19-5c-19-6-37-14-54-25-9-5-19-12-26-20-6-6-7-14-7-22 1-12 1-25 4-36l-9 2 12-8 22-14c13-7 26-15 37-24 13-9 24-19 34-31a178 178 0 0 0 29-96v-65c0-8 0-15 2-23 0-5 1-10 4-14ZM278 574c5 5 4 14 0 19l-3 7c1 3 5 5 7 6 6 3 12 7 19 9 0 4-3 5-7 5-6-1-13-3-18-6-7-3-13-8-13-16 0-6 5-9 6-14 2-4 0-7-1-11 4-1 7-2 10 1ZM328 667l11 16c14 17 29 34 47 47 17 12 35 20 53 27a714 714 0 0 0 104 29c-1 1 0 2-2 3-2 2-5 2-8 2l-25-3a478 478 0 0 1-118-44c-14-8-26-20-37-32 5 20 6 41 8 61 1 15 2 31 1 47-1 12-3 23-8 34-10 22-28 41-49 54l-14 8c2-4 6-6 9-9 13-11 24-25 34-39 6-10 12-21 14-33 4-19 3-39 3-58l-3-59 2-10c-10-11-19-26-22-41Z" fill="#000"/><path d="M670 463c7 1 14 4 18 10 6 7 7 15 8 24 0 4-1 9-3 12-3 4-9 4-12 0-2-3-2-8-3-12 0-7-3-15-10-18 10 15 11 33 7 50-2 9-6 16-13 22-4 4-11 6-17 4-6-1-10-6-13-11-4-8-6-16-6-25l-5 14c-1 3-2 6-5 9-3-3-3-6-4-10a83 83 0 0 1 34-61c7-5 15-8 24-8ZM455 468c14 0 29 5 40 14 14 10 24 25 28 42v14c-1 1-2 2-4 1a163 163 0 0 0-17-27c1 14-2 28-11 39-6 8-15 14-26 15-11 0-21-7-27-16-8-12-9-27-6-41 2-9 7-17 13-23l-13 5c-6 5-13 9-18 16l-5 6c-3 4-9 4-12 0-3-3-3-8-1-12 6-8 13-16 22-22 11-8 24-11 37-11Z" fill="#000"/><path d="M659 498c1 7-1 13-3 20l-5 9c-1 2-4 2-5 1l-4-7c-3-6-5-13-4-19 0-3 2-4 5-4 3 1 4 3 5 5 1-2 2-6 4-7 2-2 6-1 7 2ZM475 500c4 0 6 3 7 6 1 8-2 14-4 22 0 4-2 8-6 11-2 1-4 0-5-2l-10-15-3-8c-1-4-1-8 2-12 2-2 5-2 8 0l5 6c1-4 2-7 6-8Z" fill="#fff"/><path d="M492 386c7 0 13 0 19 2 8 2 15 5 18 13 4 7 4 14 2 22-1 4-4 7-9 8-8 3-17 1-26-1-7-1-15-3-22-6-6-3-12-8-13-14-2-6 2-13 7-16 7-6 16-7 24-8ZM658 388c5 1 9 4 11 9 2 3 1 8 0 11-1 4-5 8-8 10-5 5-11 6-18 8-5 1-12 3-18 1-2-1-6-4-7-7-3-11 3-25 14-30 8-4 17-4 26-2Z" fill="#000"/><path d="M603 613v1c-4 8-11 15-20 18-3 1-7 1-9-1v-4c7-5 16-9 24-12l5-2Z" fill="#000"/><path d="M619 659c1 3-1 7-2 9-5 9-14 13-21 21 0 4-2 7-3 11-3 9-6 17-13 23-3 2-7 2-11 1-3 0-6-2-7-5-1-5 0-9 3-13 6-12 16-19 26-27 8-6 15-10 21-17 2-1 4-4 7-3Z" fill="#000"/><path d="m618 150 17 7c2 2 5 4 5 7-1 3-4 6-7 5-10-3-21-3-32-2a95 95 0 0 0-80 57 127 127 0 0 1 100-9c19 6 37 15 54 26a153 153 0 0 1 62 138c-2 16-6 31-14 45-6 10-13 18-22 25s-18 11-27 16c-5 2-11 4-16 3l-4-1v-10c-1-13-4-27-7-40-6-22-14-43-24-64-8-14-16-30-28-41 10 21 15 45 13 69-1 19-6 37-12 55-7 17-16 34-29 48-6 6-14 12-22 13l6-12 7-27c2-13 4-26 4-39a158 158 0 0 1-59 78c-5 3-12 6-19 7-3 0-5-3-4-6l7-9c11-16 20-33 27-51 9-22 12-45 12-68a362 362 0 0 1-48 78c-15 15-31 27-50 37l-26 13c-4 1-8 3-11 0a783 783 0 0 0 13-72c1-18-1-36-4-54-1 8-4 16-8 23-9 18-23 34-38 48l-1 5c-2 14-3 29-2 43 1 15 4 28 8 42 2 8 6 15 9 23 1 2 2 4 1 7s-4 4-7 4a96 96 0 0 1-61-13c-3-2-5-5-10-5-28-1-56-13-75-34-13-16-20-36-23-56-3-29 2-57 12-84a281 281 0 0 1 149-155c26-10 55-17 83-14 16 1 34 6 47 16-1-9 3-17 8-24a128 128 0 0 1 78-49c15-3 33-4 48 1Z" fill="#000"/></g></g></svg>
    `.trim(),
    "companion-shiba": createAnimalSvg({
      key: "companionShiba",
      bgA: "#ffe4c7",
      bgB: "#ffd1dc",
      fur: "#d7864c",
      face: "#fff4ea",
      innerEar: "#fff2e2",
      blush: "#ffb3bf",
      nose: "#2c2f42",
      mouth: "#7c3f1d",
      forehead: `<path d="M23.4 23.7C25.9 21.2 28.8 19.8 32 19.8C35.2 19.8 38.1 21.2 40.6 23.7C37.9 23 35 22.65 32 22.65C29 22.65 26.1 23 23.4 23.7Z" fill="#fff9f3" fill-opacity=".94"/>`,
      muzzle: `<path d="M23 39.2C25.8 34.9 28.9 32.7 32 32.7C35.1 32.7 38.2 34.9 41 39.2C37.9 40.9 35 41.75 32 41.75C29 41.75 26.1 40.9 23 39.2Z" fill="#fff8f2" fill-opacity=".92"/>`,
      accessory: `<path d="M19.4 45.3C23.3 47.25 27.5 48.25 32 48.25C36.5 48.25 40.7 47.25 44.6 45.3L42.2 49.8C39 51.55 35.65 52.4 32 52.4C28.35 52.4 25 51.55 21.8 49.8L19.4 45.3Z" fill="#ff9f8f"/>`,
    }),
    "companion-cat": createAnimalSvg({
      key: "companionCat",
      bgA: "#e7e1ff",
      bgB: "#ffd6ea",
      fur: "#8b7fd4",
      face: "#fbf7ff",
      innerEar: "#ffd5ec",
      blush: "#ffb1d7",
      nose: "#30324a",
      mouth: "#5f4d8e",
      leftEar: "M15 25L20.5 7.5L31 21L15 25Z",
      rightEar: "M49 25L43.5 7.5L33 21L49 25Z",
      leftInnerEar: "M19.6 20.6L23 11.9L28.6 20.6H19.6Z",
      rightInnerEar: "M44.4 20.6L41 11.9L35.4 20.6H44.4Z",
      whiskers: `
        <path d="M12.8 35.2L20.8 34" stroke="#5f4d8e" stroke-width="1.35" stroke-linecap="round"/>
        <path d="M13.4 39L21 38.4" stroke="#5f4d8e" stroke-width="1.35" stroke-linecap="round"/>
        <path d="M51.2 35.2L43.2 34" stroke="#5f4d8e" stroke-width="1.35" stroke-linecap="round"/>
        <path d="M50.6 39L43 38.4" stroke="#5f4d8e" stroke-width="1.35" stroke-linecap="round"/>
      `,
      accessory: `
        <path d="M29.8 45.4L25.1 43.7C24 43.3 23.6 41.9 24.2 40.9C24.9 39.7 26.4 39.4 27.5 40.1L31.2 42.6L29.8 45.4Z" fill="#ffd7ef"/>
        <path d="M34.2 45.4L38.9 43.7C40 43.3 40.4 41.9 39.8 40.9C39.1 39.7 37.6 39.4 36.5 40.1L32.8 42.6L34.2 45.4Z" fill="#ffd7ef"/>
        <circle cx="32" cy="44.4" r="2.45" fill="#fff4fb" stroke="#cfa6e2" stroke-width="1"/>
      `,
    }),
    "companion-fox": createAnimalSvg({
      key: "companionFox",
      bgA: "#ffe3c2",
      bgB: "#ffd7b2",
      fur: "#ef8d3c",
      face: "#fff7ef",
      innerEar: "#fff0de",
      blush: "#ffc2b3",
      nose: "#2b2d3f",
      mouth: "#934d1c",
      leftEar: "M14.8 24L19.8 7.6L31 21L14.8 24Z",
      rightEar: "M49.2 24L44.2 7.6L33 21L49.2 24Z",
      leftInnerEar: "M19.8 20.4L22.6 12.6L28.5 20.4H19.8Z",
      rightInnerEar: "M44.2 20.4L41.4 12.6L35.5 20.4H44.2Z",
      forehead: `<path d="M26 21.9C27.8 20.5 29.9 19.8 32 19.8C34.1 19.8 36.2 20.5 38 21.9C36.2 24.3 34.2 25.5 32 25.5C29.8 25.5 27.8 24.3 26 21.9Z" fill="#fff9f1"/>`,
      muzzle: `<path d="M22.8 39.4C25.5 34.7 28.6 32.3 32 32.3C35.4 32.3 38.5 34.7 41.2 39.4C38.1 41.15 35 42 32 42C29 42 25.9 41.15 22.8 39.4Z" fill="#fff8ef"/>`,
      accessory: `<path d="M22.2 47.2C24.8 45.4 28.1 44.5 32 44.5C35.9 44.5 39.2 45.4 41.8 47.2C39.8 50 36.5 51.4 32 51.4C27.5 51.4 24.2 50 22.2 47.2Z" fill="#fff1cf" fill-opacity=".92"/>`,
    }),
    "companion-panda": createAnimalSvg({
      key: "companionPanda",
      bgA: "#f2f5ff",
      bgB: "#d8e4ff",
      fur: "#2d3148",
      face: "#fffefe",
      innerEar: "#c6d4ff",
      blush: "#ffced9",
      nose: "#222633",
      mouth: "#31364a",
      leftEar: "M16 21C16 16.58 19.58 13 24 13C28.42 13 32 16.58 32 21L16 21Z",
      rightEar: "M48 21C48 16.58 44.42 13 40 13C35.58 13 32 16.58 32 21L48 21Z",
      leftInnerEar: "M20 19C20 17.34 21.34 16 23 16C24.66 16 26 17.34 26 19L20 19Z",
      rightInnerEar: "M44 19C44 17.34 42.66 16 41 16C39.34 16 38 17.34 38 19L44 19Z",
      leftMark: `<ellipse cx="22.2" cy="28.8" rx="6.8" ry="8.2" fill="#2d3148"/>`,
      rightMark: `<ellipse cx="41.8" cy="28.8" rx="6.8" ry="8.2" fill="#2d3148"/>`,
      eyeLeftX: 23.7,
      eyeRightX: 40.3,
      eyeY: 29,
      muzzle: `<ellipse cx="32" cy="39.2" rx="10.4" ry="7.7" fill="#fffefd"/>`,
      accessory: `
        <path d="M24.8 46.6C26.5 44.9 28.9 44 32 44C35.1 44 37.5 44.9 39.2 46.6" stroke="#87ba7a" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M39.2 46.6C41.3 46 43.3 44.7 44.9 42.6" stroke="#87ba7a" stroke-width="2.3" stroke-linecap="round"/>
      `,
    }),
  };
  variants["companion-placeholder"] = createCompanionPlaceholderSvg();
  variants.companion = variants["companion-placeholder"];
  window.LudwigAvatarVendor = {
    id: "dicebear-mixed-copilot-companion",
    source: "DiceBear Lorelei + Original Ludwigia animal companion set",
    license: "Mixed (CC0 1.0 + repo-authored original)",
    attribution: {
      copilot: "DiceBear Lorelei, CC0 1.0",
      companion: "Original Ludwigia animal companion SVG set",
    },
    companionOptions,
    variants,
    getSvg: (variant = "copilot") => variants[variant] || variants.copilot,
    svg: variants.copilot,
  };
})();
