export const createCharacterSVG = (type: string): string => {
  const designs: Record<string, { body: string; accent: string; weapon: string }> = {
    '전사': { body: '#DC2626', accent: '#991B1B', weapon: '#9CA3AF' },
    '힐러': { body: '#16A34A', accent: '#15803D', weapon: '#FBBF24' },
    '상인': { body: '#EAB308', accent: '#CA8A04', weapon: '#8B5CF6' }
  };
  
  const design = designs[type];
  const weaponPart = type === '전사' 
    ? `<rect x="25" y="55" width="5" height="30" fill="${design.weapon}"/><rect x="20" y="53" width="15" height="5" fill="${design.weapon}"/>`
    : type === '힐러'
    ? `<rect x="70" y="45" width="3" height="35" fill="${design.weapon}"/><circle cx="71.5" cy="43" r="5" fill="${design.weapon}"/>`
    : `<rect x="65" y="60" width="15" height="20" fill="${design.weapon}"/><rect x="67" y="58" width="11" height="3" fill="${design.accent}"/>`;

  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="70" rx="20" ry="25" fill="${design.body}"/><circle cx="50" cy="35" r="18" fill="${design.accent}"/><circle cx="44" cy="33" r="3" fill="white"/><circle cx="56" cy="33" r="3" fill="white"/><circle cx="45" cy="33" r="1.5" fill="black"/><circle cx="57" cy="33" r="1.5" fill="black"/><path d="M 45 40 Q 50 43 55 40" stroke="white" fill="none" stroke-width="2"/>${weaponPart}</svg>`;
};