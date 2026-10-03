import { JewelryCategory, JewelryItem, CollectionCard, OccasionItem } from '../types/jewelry';

import heroHaaramImg from '../assets/images/hero_statement_haaram_1790612442396.jpg';
import statementChokerImg from '../assets/images/statement_choker_emerald_1790612454817.jpg';
import signatureJhumkasImg from '../assets/images/signature_jhumkas_earrings_1790612470730.jpg';
import bridalMathapattiImg from '../assets/images/bridal_mathapatti_hairpiece_1790612481414.jpg';
import royalBajubandImg from '../assets/images/royal_bajuband_vanki_1790612500060.jpg';
import solitaireRingImg from '../assets/images/solitaire_emerald_ring_1790612512321.jpg';
import statementPendantNecklaceImg from '../assets/images/statement_pendant_necklace_1790612524901.jpg';
import solitairePendantImg from '../assets/images/solitaire_pendant_chain_1790663321416.jpg';
import bridalEmeraldJhumkaImg from '../assets/images/original_chandbali_crop_1790757530715.jpg';
import craftsmanshipImg from '../assets/images/atelier_craftsmanship_silver_1790612414133.jpg';
import heroIsolatedJewelryImg from '../assets/images/hero_isolated_jewelry_1790614237142.jpg';
import heroIsolatedChokerImg from '../assets/images/hero_isolated_choker_1790844827818.jpg';
import heroIsolatedJhumkasImg from '../assets/images/hero_isolated_jhumkas_1790844845271.jpg';
import heroIsolatedMathapattiImg from '../assets/images/hero_isolated_mathapatti_1790844862481.jpg';
import heroIsolatedVankiImg from '../assets/images/hero_isolated_vanki_1790844880835.jpg';
import heroIsolatedCollarImg from '../assets/images/hero_isolated_collar_1790844899842.jpg';
import brandLogoImg from '../assets/images/jewel_botanica_logo_1790614222826.jpg';

export {
  heroHaaramImg,
  heroIsolatedJewelryImg,
  heroIsolatedChokerImg,
  heroIsolatedJhumkasImg,
  heroIsolatedMathapattiImg,
  heroIsolatedVankiImg,
  heroIsolatedCollarImg,
  brandLogoImg,
  statementChokerImg,
  signatureJhumkasImg,
  bridalEmeraldJhumkaImg,
  bridalMathapattiImg,
  royalBajubandImg,
  solitaireRingImg,
  statementPendantNecklaceImg,
  solitairePendantImg,
  craftsmanshipImg,
};

export const BRAND_INFO = {
  name: 'JEWEL BOTANICA',
  descriptor: 'SILVER JEWELLERY',
  tagline: 'Where Silver Becomes Art',
  subtext: 'Discover statement 92.5 silver jewellery designed for celebrations, traditions and unforgettable moments.',
  location: 'Hyderabad, India',
  phone: '+91 99592 76259',
  phoneClean: '919959276259',
  whatsappUrl: 'https://wa.me/919959276259',
  instagram: '@jewel_botanica_silver_jewelery',
  instagramUrl: 'https://www.instagram.com/jewel_botanica_silver_jewelery/',
  followers: '104K+',
  posts: '700+',
  motto: 'Silver, shaped into stories.',
};

export const SIGNATURE_COLLECTIONS: CollectionCard[] = [
  {
    id: 'col-mathapatti',
    category: 'MATHAPATTI',
    name: 'MATHAPATTI',
    tagline: 'Graceful forehead ornaments celebrating Indian bridal heritage',
    image: bridalMathapattiImg,
    itemCount: 'Bridal Heritage',
  },
  {
    id: 'col-necklaces',
    category: 'NECKLACES',
    name: 'NECKLACES',
    tagline: 'Dual-strand floral lattices and emerald-accented collars',
    image: statementPendantNecklaceImg,
    itemCount: 'Festive & Formal',
  },
  {
    id: 'col-pendants',
    category: 'PENDANTS',
    name: 'PENDANTS',
    tagline: 'Intricate silver talismans and majestic gemstone drops',
    image: solitairePendantImg,
    itemCount: 'Artisan Crafted',
  },
  {
    id: 'col-haarams',
    category: 'HAARAMS',
    name: 'HAARAMS',
    tagline: 'Grand bridal tiered haarams with cascading silver filigree',
    image: heroHaaramImg,
    itemCount: 'Signature Pieces',
  },
  {
    id: 'col-chokers',
    category: 'CHOKERS',
    name: 'CHOKERS',
    tagline: 'Sculpted royal neckpieces crowned with emerald medallions',
    image: statementChokerImg,
    itemCount: 'Curated Designs',
  },
  {
    id: 'col-jhumkas',
    category: 'JHUMKAS',
    name: 'JHUMKAS',
    tagline: 'Chandelier drops, polki clusters and delicate floral bells',
    image: signatureJhumkasImg,
    itemCount: 'Heirloom Craft',
  },
  {
    id: 'col-rings',
    category: 'RINGS',
    name: 'RINGS',
    tagline: 'Solitaire emerald-cut gemstones and pavé cocktail rings',
    image: solitaireRingImg,
    itemCount: 'Fine Settings',
  },
  {
    id: 'col-celebrations',
    category: 'CELEBRATION JEWELLERY',
    name: 'CELEBRATION JEWELLERY',
    tagline: 'Royal peacock vanki bajubands and celebratory ornaments',
    image: royalBajubandImg,
    itemCount: 'Royal Regalia',
  },
  {
    id: 'col-nosepins',
    category: 'NOSE PINS',
    name: 'NOSE PINS',
    tagline: 'Delicate clip-on and pierced traditional silver nath designs',
    image: bridalMathapattiImg,
    itemCount: 'Traditional Accents',
  },
];

export const CATALOGUE_ITEMS: JewelryItem[] = [
  {
    id: 'jb-001',
    name: 'Signature Haaram',
    category: 'HAARAMS',
    displayCategory: 'Bridal Haaram',
    image: heroHaaramImg,
    description: 'A grand multi-tier statement haaram sculpted in 92.5 sterling silver, set with radiant diamond CZ pavé and deep emerald teardrop drops. Created for brides who desire timeless presence.',
    details: {
      metal: '92.5 Sterling Silver',
      purity: 'Guaranteed 92.5 Hallmark Purity',
      gemstones: 'Lab-grown Emerald Teardrops & Premium CZ',
      finish: 'Rhodium Platinum Luster with Antiqued Accents',
      origin: 'Hyderabad Atelier',
      customizable: true,
    },
    occasion: 'Bridal & Grand Receptions',
    featured: true,
  },
  {
    id: 'jb-002',
    name: 'Statement Choker',
    category: 'CHOKERS',
    displayCategory: 'Royal Choker',
    image: statementChokerImg,
    description: 'An architectural silver choker centered with a circular deep-emerald medallion, framed by concentric pavé rows and suspended silver seed droplet fringe.',
    details: {
      metal: '92.5 Sterling Silver',
      purity: '92.5 Certified Silver',
      gemstones: 'Deep Forest Emerald & Pavé Zirconia',
      finish: 'High-Polish Silver with Velvet Choker Cord',
      origin: 'Hyderabad Atelier',
      customizable: true,
    },
    occasion: 'Weddings & Festive Soirees',
    featured: true,
  },
  {
    id: 'jb-003',
    name: 'Bridal Jhumka',
    category: 'JHUMKAS',
    displayCategory: 'Chandelier Chandbalis',
    image: bridalEmeraldJhumkaImg,
    description: 'Breathtaking openwork chandelier chandbalis encrusted with brilliant pavé crystals and emerald stones, accented with a luminescent pearl drop suspended at the center.',
    details: {
      metal: '92.5 Sterling Silver',
      purity: '92.5 Sterling Grade',
      gemstones: 'Lustrous Pearl Drop & Radiant Emeralds',
      finish: 'Liquid Platinum Polish',
      origin: 'Hyderabad Atelier',
      customizable: true,
    },
    occasion: 'Sangeet, Wedding & Receptions',
    featured: true,
  },
  {
    id: 'jb-004',
    name: 'Signature Mathapatti',
    category: 'MATHAPATTI',
    displayCategory: 'Forehead Damini',
    image: bridalMathapattiImg,
    description: 'Dual-strand articulated silver chain with floral CZ stations culminating in a regal emerald drop tikka, tailored to frame the hair with effortless royal grace.',
    details: {
      metal: '92.5 Sterling Silver',
      purity: '92.5 Purity',
      gemstones: 'Emerald Drop & Micro-Pavé Diamonds',
      finish: 'Lightweight Articulated Silver',
      origin: 'Hyderabad Atelier',
      customizable: true,
    },
    occasion: 'Bridal & Muhurtham',
    featured: true,
  },
  {
    id: 'jb-005',
    name: 'Lattice Floral Necklace',
    category: 'NECKLACES',
    displayCategory: 'Statement Necklace',
    image: statementPendantNecklaceImg,
    description: 'Double-row floral lattice collar necklace with scintillating diamond-cut CZ florets and vivid emerald teardrop pendants that catch ambient night light.',
    details: {
      metal: '92.5 Sterling Silver',
      purity: '92.5 Sterling Silver',
      gemstones: 'Fine Emerald Drops & Brilliant CZ',
      finish: 'Mirror Platinum Luster',
      origin: 'Hyderabad Atelier',
      customizable: true,
    },
    occasion: 'Cocktail & Festive Celebrations',
  },
  {
    id: 'jb-006',
    name: 'Emerald Solitaire Cocktail Ring',
    category: 'RINGS',
    displayCategory: 'Statement Ring',
    image: solitaireRingImg,
    description: 'An imposing emerald-cut deep green gemstone set in a handcrafted 92.5 silver basket setting flanked by triple micro-pavé pave shoulders.',
    details: {
      metal: '92.5 Sterling Silver',
      purity: '92.5 Sterling Silver',
      gemstones: 'Vivid Emerald Cut Gemstone & CZ Pave',
      finish: 'High-Luster Rhodium Protective Coat',
      origin: 'Hyderabad Atelier',
      customizable: true,
    },
    occasion: 'Evenings, Engagements & Gifting',
  },
  {
    id: 'jb-007',
    name: 'Royal Bajuband Armlet',
    category: 'CELEBRATION JEWELLERY',
    displayCategory: 'Vanki Armlet',
    image: royalBajubandImg,
    description: 'Traditional South Indian Vanki bajuband armlet featuring opposing royal peacock motifs crowned with emerald gemstones and polki silver setting.',
    details: {
      metal: '92.5 Sterling Silver',
      purity: '92.5 Sterling Silver',
      gemstones: 'Polki Style Uncut Stones & Emerald',
      finish: 'Traditional Royal Silver Finish',
      origin: 'Hyderabad Atelier',
      customizable: true,
    },
    occasion: 'Traditional Bridal & Heritage Functions',
  },
  {
    id: 'jb-008',
    name: 'Emerald Pendant',
    category: 'PENDANTS',
    displayCategory: 'Heritage Pendant',
    image: statementChokerImg,
    description: 'A sovereign medallion pendant inspired by royal Nizami motifs, featuring an emerald-green center orb encapsulated by radiant sunburst silver petals.',
    details: {
      metal: '92.5 Sterling Silver',
      purity: '92.5 Sterling Silver',
      gemstones: 'Fine Emerald & Faceted CZ',
      finish: 'Liquid Silver Sheen',
      origin: 'Hyderabad Atelier',
      customizable: true,
    },
    occasion: 'Festivals & Daily Luxury',
  },
  {
    id: 'jb-009',
    name: 'Heritage Nose Pin & Nath',
    category: 'NOSE PINS',
    displayCategory: 'Bridal Nose Pin',
    image: bridalMathapattiImg,
    description: 'Intricately chased clip-on and pierced traditional silver nath accented with a tiny emerald gemstone and dainty silver pearls.',
    details: {
      metal: '92.5 Sterling Silver',
      purity: '92.5 Sterling Silver',
      gemstones: 'Emerald Accent & Diamond CZ',
      finish: 'Hypoallergenic Silver Finish',
      origin: 'Hyderabad Atelier',
      customizable: true,
    },
    occasion: 'Bridal & Traditional Festivities',
  },
];

export const OCCASIONS_DATA: OccasionItem[] = [
  {
    id: 'occ-bridal',
    title: 'BRIDAL REGALIA',
    subtitle: 'The Crown of Your Wedding Ensemble',
    description: 'Heavy statement haarams, intricate chokers, and ornate mathapattis crafted in 92.5 silver to mirror the grandeur of heirloom royal gold without compromise.',
    image: heroHaaramImg,
    recommendedCategory: 'HAARAMS',
  },
  {
    id: 'occ-weddings',
    title: 'WEDDINGS & RECEPTIONS',
    subtitle: 'Unforgettable Radiance for the Evening',
    description: 'Cascading floral necklaces, brilliant chandelier jhumkas, and structured cuffs that catch the evening ballroom lights with platinum liquid gleam.',
    image: statementChokerImg,
    recommendedCategory: 'CHOKERS',
  },
  {
    id: 'occ-festivals',
    title: 'FESTIVALS & TRADITIONS',
    subtitle: 'Celebrating Culture with Modern Brilliance',
    description: 'Timeless traditional motifs reimagined for Diwali, Eid, Sankranti, and Navratri celebrations across India and the global diaspora.',
    image: royalBajubandImg,
    recommendedCategory: 'CELEBRATION JEWELLERY',
  },
  {
    id: 'occ-celebrations',
    title: 'CELEBRATIONS & SANGEET',
    subtitle: 'Movement, Glamour, and Statement Style',
    description: 'Lighter yet captivating pieces designed to dance with you through cocktail nights, sangeet performances, and milestone moments.',
    image: signatureJhumkasImg,
    recommendedCategory: 'JHUMKAS',
  },
  {
    id: 'occ-special',
    title: 'SPECIAL OCCASIONS',
    subtitle: 'Elevated Everyday Luxury',
    description: 'Refined tennis chains, solitaires, and delicate pendants that subtly whisper discernment and individual sophistication.',
    image: statementPendantNecklaceImg,
    recommendedCategory: 'NECKLACES',
  },
  {
    id: 'occ-gifting',
    title: 'LUXURY GIFTING',
    subtitle: 'Heirloom Tokens of Enduring Love',
    description: 'Meaningful pure 92.5 silver treasures nestled in dark bespoke velvet presentation cases, crafted to be cherished for lifetimes.',
    image: solitaireRingImg,
    recommendedCategory: 'RINGS',
  },
];

export const ART_OF_SILVER_POINTS = [
  {
    id: 'purity',
    number: '01',
    title: '92.5 SILVER PURITY',
    description: 'Sterling silver is universally renowned as an alloy comprising 92.5% pure elemental silver paired with 7.5% strengthening alloy. This golden ratio preserves silver’s ethereal white luster while providing the structural integrity required to securely hold brilliant stone settings for generations.',
  },
  {
    id: 'craftsmanship',
    number: '02',
    title: 'HYDERABAD CRAFTSMANSHIP',
    description: 'Hyderabad’s centuries-old legacy of master goldsmiths and silversmiths lives in every cut, prong, and filigree scroll. Our artisans hand-set each individual gemstone with micro-precision under directional lamps, celebrating Indian royal heritage with contemporary finesse.',
  },
  {
    id: 'timeless',
    number: '03',
    title: 'TIMELESS BEAUTY & VALUE',
    description: 'Silver is not merely an alternative; it is an independent artistic medium. Lighter on the skin, effortlessly versatile across traditional silk sarees and modern gowns, 92.5 silver holds intrinsic precious metal value while offering limitless sculptural freedom.',
  },
];

export const WHY_US_PILLARS = [
  {
    title: '92.5 SILVER',
    subtitle: 'Premium Silver Selections',
    description: 'Strict hallmark purity with certified silver metal content and platinum-grade protective rhodium finish.',
  },
  {
    title: 'CURATED DESIGNS',
    subtitle: 'Statement Pieces & Detailing',
    description: 'Hand-curated collections balancing traditional Nizami grandeur with modern Indian festive aesthetics.',
  },
  {
    title: 'CUSTOMIZATION',
    subtitle: 'Personalized Enquiries',
    description: 'Direct consultation via WhatsApp to tailor stone colors, sizing, and bespoke wedding bridal sets.',
  },
  {
    title: 'WORLDWIDE SHIPPING',
    subtitle: 'Global Delivery from Hyderabad',
    description: 'Secure, tracked domestic and international shipping reaching clients across the globe.',
  },
];
