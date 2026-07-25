export interface FlowerProfile {
  name: string; // e.g. "Sunflower"
  botanicalName: string; // e.g. "Helianthus annuus"
  language: string; // Flower language / symbolism
  description: string; // Botanical detail & custom lore
  color: string; // Tailwind color class for borders / glows
  bgColor: string; // Tailwind background colors
  textColor: string; // Tailwind text color class
  emoji: string; // A cute flower icon/emoji fallback
  svgColor: string; // Base SVG color code
}

export interface Writing {
  id: string;
  title: string;
  summary: string;
  content: string; // Complete detailed article markdown or formatted text
  previewMarkdown?: string;
  tags: string[]; // Associated tags / clusters
  flowerName: string; // Associated flower englishName
  date: string;
  readingTime: string; // e.g. "6 min"
  isCustom?: boolean; // Whether of user planted this
  imageUrl?: string; // Custom image representation
}

// Pre-defined flower directory
export const FLOWER_PROFILES: Record<string, FlowerProfile> = {
  Sunflower: {
    name: "Sunflower",
    botanicalName: "Helianthus annuus",
    language: "Radiant warmth, loyalty, resilience, and optimism",
    description: "Famous for its heliotropic nature, the sunflower turns to face the sun's trajectory. It symbolizes dedicated admiration and positive spirit, making list entries of bold, innovative, and pioneering ideas shine.",
    color: "border-amber-400 focus:ring-amber-300",
    bgColor: "bg-amber-950/20",
    textColor: "text-amber-400",
    emoji: "🌻",
    svgColor: "#F59E0B"
  },
  Lavender: {
    name: "Lavender",
    botanicalName: "Lavandula angustifolia",
    language: "Serenity, mental clarity, devotion, and waiting for breakthroughs",
    description: "Native to the Mediterranean, lavender's calming fragrance has long been celebrated for inducing deep relaxation. It embodies mindful tranquility and is fitting for deep scientific research or complex theoretical notes.",
    color: "border-purple-400 focus:ring-purple-300",
    bgColor: "bg-purple-950/20",
    textColor: "text-purple-400",
    emoji: "🪻",
    svgColor: "#8B5CF6"
  },
  Daisy: {
    name: "Daisy",
    botanicalName: "Bellis perennis",
    language: "Innocence, fresh beginnings, and persistent simplicity",
    description: "Daisies open their petals at dawn with earthy freshness. They represent purity and simple joy, lending themselves well to fundamental data structures, back-end engineering, and pristine base cases.",
    color: "border-lime-400 focus:ring-lime-300",
    bgColor: "bg-emerald-950/20",
    textColor: "text-lime-400",
    emoji: "🌼",
    svgColor: "#10B981"
  },
  Lotus: {
    name: "Lotus",
    botanicalName: "Nelumbo nucifera",
    language: "Spiritual awakening, purity, and inner calm amidst chaos",
    description: "Rising immaculate from muddy depths, the lotus symbolizes clarity of mind and inner transcendence. It is the perfect signature for contemplative thoughts, mental health, and writing seeking pure wisdom.",
    color: "border-teal-400 focus:ring-teal-300",
    bgColor: "bg-teal-950/20",
    textColor: "text-teal-400",
    emoji: "🪷",
    svgColor: "#14B8A6"
  },
  Tulip: {
    name: "Tulip",
    botanicalName: "Tulipa",
    language: "Eternal hope, thoughtful care, and refined elegance",
    description: "With its graceful petals, the tulip represents deep connection and tender care. It reflects personal insights, sweet daily logs, and elegant design experiments.",
    color: "border-rose-400 focus:ring-rose-300",
    bgColor: "bg-rose-950/20",
    textColor: "text-rose-400",
    emoji: "🌷",
    svgColor: "#F43F5E"
  },
  Rose: {
    name: "Rose",
    botanicalName: "Rosa",
    language: "Intense passion, dynamic courage, and unyielding devotion",
    description: "The queen of flowers, vibrant yet protected by thorns. The rose symbolizes dedicated craftsmanship and bold aesthetic pursuits. It matches your most ambitious core projects, deep prose, or artistic milestones.",
    color: "border-red-400 focus:ring-red-300",
    bgColor: "bg-red-950/20",
    textColor: "text-red-400",
    emoji: "🌹",
    svgColor: "#EF4444"
  },
  Sakura: {
    name: "Cherry Blossom",
    botanicalName: "Prunus serrulata",
    language: "Fleeting beauty, the brilliance of life, and mindful gratitude",
    description: "Blooming in magnificent clouds before falling gently, cherry blossoms celebrate the beauty of impermanence. They symbolize temporary inspirations, emotional journals, and quick thoughts.",
    color: "border-pink-400 focus:ring-pink-300",
    bgColor: "bg-pink-950/20",
    textColor: "text-pink-400",
    emoji: "🌸",
    svgColor: "#EC4899"
  },
  Orchid: {
    name: "Orchid",
    botanicalName: "Orchidaceae",
    language: "Refinement, nobility, endurance, and rare elegant wisdom",
    description: "Orchids thrive in quiet, deep valleys without seeking attention. They represent inner strength and sophisticated vision. Highly recommended for advanced systems architecture, algorithm designs, or long-term strategies.",
    color: "border-indigo-400 focus:ring-indigo-300",
    bgColor: "bg-indigo-950/20",
    textColor: "text-indigo-400",
    emoji: "💮",
    svgColor: "#6366F1"
  },
  Dandelion: {
    name: "Dandelion",
    botanicalName: "Taraxacum officinale",
    language: "Unbound freedom, spreading seeds of hope, and playful curiosity",
    description: "Tiny seeds that ride the wind to take root in any crack, dandelions represent resilience and playful curiosity. Ideal for open-source exploration, neat hacks, and nimble problem-solving ideas.",
    color: "border-emerald-400 focus:ring-emerald-300",
    bgColor: "bg-emerald-950/20",
    textColor: "text-emerald-400",
    emoji: "🌾",
    svgColor: "#34D399"
  },
  Jasmine: {
    name: "Jasmine",
    botanicalName: "Jasminum",
    language: "Gentle loyalty, timeless friendship, and quiet fragrant grace",
    description: "Small white blossoms with an intoxicatingly pure aroma. Jasmine represents loyalty, simple companionship, and lasting quiet wisdom. Best suited for warm narratives and long-term accumulative tutorials.",
    color: "border-sky-400 focus:ring-sky-300",
    bgColor: "bg-sky-950/20",
    textColor: "text-sky-400",
    emoji: "🤍",
    svgColor: "#0EA5E9"
  }
};
