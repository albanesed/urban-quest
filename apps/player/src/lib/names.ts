// duplicated from supabase/functions/_shared/names.ts
// didn't want to set up a shared import path for this one function

const adjectives = [
  "Grigio", "Notturno", "Veloce", "Antico", "Misterioso",
  "Silenzioso", "Oscuro", "Feroce", "Saggio", "Audace",
  "Astuto", "Gentile", "Selvaggio", "Nobile", "Furbo",
];

const animals = [
  "Falco", "Lupo", "Aquila", "Volpe", "Gufo",
  "Corvo", "Lince", "Gatto", "Cervo", "Orso",
  "Tasso", "Cinghiale", "Delfino", "Leone", "Civetta",
];

export function generateAnonymousName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${animal} ${adj}`;
}
