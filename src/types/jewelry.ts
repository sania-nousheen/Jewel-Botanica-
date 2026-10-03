export type JewelryCategory =
  | 'ALL'
  | 'HAARAMS'
  | 'NECKLACES'
  | 'JHUMKAS'
  | 'CHOKERS'
  | 'PENDANTS'
  | 'RINGS'
  | 'MATHAPATTI'
  | 'NOSE PINS'
  | 'CELEBRATION JEWELLERY'
  | 'VANKI'
  | (string & {});

export interface JewelryItem {
  id: string;
  name: string;
  category: JewelryCategory;
  displayCategory: string;
  image: string;
  images?: string[];
  videoUrl?: string;
  status?: 'Published' | 'Draft' | 'Archived';
  description: string;
  details: {
    metal: string;
    purity: string;
    gemstones: string;
    finish: string;
    origin: string;
    customizable: boolean;
  };
  occasion: string;
  featured?: boolean;
  authorEmail?: string;
  authorUid?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CollectionCard {
  id: string;
  category: JewelryCategory;
  name: string;
  tagline: string;
  image: string;
  itemCount: string;
}

export interface OccasionItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  recommendedCategory: JewelryCategory;
}
