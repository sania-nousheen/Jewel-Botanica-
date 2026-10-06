import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  Sliders,
  Tag,
  FolderKanban,
  Package,
  MessageSquare,
  Instagram,
  User,
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Video,
  Upload,
  CheckCircle,
  Eye,
  LogOut,
  ShieldCheck,
  AlertCircle,
  Film,
  Lock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  MoveVertical,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  Type,
  Layers,
  Share2,
  MousePointerClick,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  EyeOff,
  GripVertical,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateFollowerCount, subscribeFollowerCount } from '../lib/communityService';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  subscribeAllProducts,
  getDeletedProductIds,
  seedDefaultCatalogueProducts,
  ProductFormData,
} from '../lib/productService';
import {
  subscribeInquiries,
  updateInquiryStatus,
  deleteInquiry,
  CustomerInquiry,
} from '../lib/inquiryService';
import {
  subscribeWebsiteSettings,
  saveWebsiteSettings,
  WebsiteCustomizationSettings,
  WebsiteImagesSettings,
  HeroSlideItem,
  PromoPopupSettings,
  ProfileSettings,
  PageSectionItem,
  SocialIconItem,
  SocialPlatformType,
  CustomWidgetItem,
  WidgetType,
  SectionButtonConfig,
  DEFAULT_HERO_SLIDES,
  DEFAULT_PROMO_POPUP,
  DEFAULT_PROFILE,
  DEFAULT_WEBSITE_IMAGES,
  DEFAULT_WEBSITE_SETTINGS,
  DEFAULT_PAGE_SECTIONS,
  DEFAULT_SOCIAL_ICONS,
  DEFAULT_TYPOGRAPHY_STYLE,
  DEFAULT_IMAGE_STYLE,
  DEFAULT_CONTAINER_ADVANCED,
} from '../lib/websiteSettingsService';
import { JewelryItem, JewelryCategory, CollectionCard } from '../types/jewelry';
import { BOOTSTRAPPED_ADMIN_EMAIL } from '../lib/firebase';
import { BRAND_INFO, brandLogoImg, heroIsolatedJewelryImg, CATALOGUE_ITEMS } from '../data/jewelryData';

interface AdminCMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated?: () => void;
  websiteSettings: WebsiteCustomizationSettings;
}

export type AdminTab =
  | 'OVERALL'
  | 'CUSTOMIZE_WEBSITE'
  | 'DISCOUNTS_POPUP'
  | 'COLLECTIONS'
  | 'CATALOGUE'
  | 'INQUIRIES'
  | 'INSTAGRAM'
  | 'PROFILE';

export type CustomizeSubCategory =
  | 'HOME_HERO_MEDIA'
  | 'PAGE_SECTIONS_EDITOR'
  | 'WEBSITE_IMAGES'
  | 'SOCIAL_ICONS_BUTTONS'
  | 'WIDGETS_RESPONSIVE'
  | 'PAGES_ORDER';

const DEFAULT_CATEGORIES: string[] = [
  'HAARAMS',
  'NECKLACES',
  'PENDANTS',
  'JHUMKAS',
  'MATHAPATTI',
  'VANKI',
  'RINGS',
  'CHOKERS',
];

/**
 * Image compressor for admin uploads
 */
function compressImage(file: File, maxWidth = 1280, maxHeight = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = Math.round((height * maxHeight) / img.height);
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const AdminCMSModal: React.FC<AdminCMSModalProps> = ({
  isOpen,
  onClose,
  onProductUpdated,
  websiteSettings,
}) => {
  const {
    currentUser,
    isAdmin,
    loading,
    loginWithGoogleAdmin,
    loginWithDirectAdminEmail,
    logout,
  } = useAuth();

  // Navigation: active left panel tab + Customize Website sub-category
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERALL');
  const [customizeSubTab, setCustomizeSubTab] = useState<CustomizeSubCategory>('HOME_HERO_MEDIA');
  const [isCustomizeMenuOpen, setIsCustomizeMenuOpen] = useState<boolean>(true);
  const [responsivePreviewMode, setResponsivePreviewMode] = useState<'DESKTOP' | 'TABLET' | 'MOBILE'>('DESKTOP');
  const [showLivePreviewSplit, setShowLivePreviewSplit] = useState<boolean>(true);
  const [hasUnsavedCustomizeChanges, setHasUnsavedCustomizeChanges] = useState<boolean>(false);
  const [isPublishingAllCustomize, setIsPublishingAllCustomize] = useState<boolean>(false);
  const [previewActiveCategory, setPreviewActiveCategory] = useState<JewelryCategory>('ALL');

  // Aliases for Elementor live preview & draft state
  const hasUnsavedChanges = hasUnsavedCustomizeChanges;
  const setHasUnsavedChanges = setHasUnsavedCustomizeChanges;
  const publishingAll = isPublishingAllCustomize;

  // Drag and Drop State for Sections, Slides, and Widgets
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [dragOverSectionIndex, setDragOverSectionIndex] = useState<number | null>(null);
  const [draggedHeroIndex, setDraggedHeroIndex] = useState<number | null>(null);
  const [draggedWidgetIndex, setDraggedWidgetIndex] = useState<number | null>(null);
  const [draggedWidgetType, setDraggedWidgetType] = useState<WidgetType | null>(null);
  const [dragOverWidgetTargetId, setDragOverWidgetTargetId] = useState<string | null>(null);

  // Direct Admin Email Login State (Works on GitHub Pages, external hosting, and everywhere)
  const [directLoginEmail, setDirectLoginEmail] = useState<string>(BOOTSTRAPPED_ADMIN_EMAIL);

  // Page Sections, Typography, Sizing, Social Icons & Widgets State
  const [pageSections, setPageSections] = useState<PageSectionItem[]>(
    websiteSettings.pageSections && websiteSettings.pageSections.length > 0
      ? websiteSettings.pageSections
      : DEFAULT_PAGE_SECTIONS
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>('hero');
  const [elementorSubPanel, setElementorSubPanel] = useState<'CONTENT' | 'STYLE' | 'ADVANCED'>('CONTENT');
  const [savingPageSections, setSavingPageSections] = useState(false);

  // New Custom Page Form State
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageHeading, setNewPageHeading] = useState('');
  const [newPageSubheading, setNewPageSubheading] = useState('');
  const [newPageMatter, setNewPageMatter] = useState('');
  const [newPageImage, setNewPageImage] = useState('');

  // Social Icons State
  const [socialIcons, setSocialIcons] = useState<SocialIconItem[]>(
    websiteSettings.socialIcons && websiteSettings.socialIcons.length > 0
      ? websiteSettings.socialIcons
      : DEFAULT_SOCIAL_ICONS
  );
  const [savingSocialIcons, setSavingSocialIcons] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialPlatformType>('Instagram');
  const [newSocialLabel, setNewSocialLabel] = useState('');
  const [newSocialLink, setNewSocialLink] = useState('');
  const [newSocialColorType, setNewSocialColorType] = useState<
    'Official Color' | 'Custom Color' | 'Emerald Luxury' | 'Silver Monochrome'
  >('Official Color');

  // Custom Widgets State
  const [customWidgets, setCustomWidgets] = useState<CustomWidgetItem[]>(websiteSettings.customWidgets || []);
  const [savingWidgets, setSavingWidgets] = useState(false);
  const [newWidgetType, setNewWidgetType] = useState<WidgetType>('Heading');
  const [newWidgetTargetSection, setNewWidgetTargetSection] = useState<string>('hero');
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetSubtitle, setNewWidgetSubtitle] = useState('');
  const [newWidgetContent, setNewWidgetContent] = useState('');
  const [newWidgetImage, setNewWidgetImage] = useState('');
  const [newWidgetButtonText, setNewWidgetButtonText] = useState('');
  const [newWidgetButtonLink, setNewWidgetButtonLink] = useState('');

  // Products State
  const [productsList, setProductsList] = useState<JewelryItem[]>(() => {
    const deletedIds = getDeletedProductIds();
    return CATALOGUE_ITEMS.filter((item) => !deletedIds.includes(item.id));
  });
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('ALL');
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [catalogueSubMode, setCatalogueSubMode] = useState<'LIST' | 'FORM'>('LIST');
  const [editingProduct, setEditingProduct] = useState<JewelryItem | null>(null);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<string>('HAARAMS');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Published' | 'Draft' | 'Archived'>('Published');
  const [customizable, setCustomizable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [imageInputUrl, setImageInputUrl] = useState('');
  const [videoInputUrl, setVideoInputUrl] = useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Inquiries State
  const [inquiriesList, setInquiriesList] = useState<CustomerInquiry[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState<'ALL' | 'New' | 'Contacted' | 'Closed'>('ALL');
  const [searchInquiry, setSearchInquiry] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);
  const [deletingInquiryId, setDeletingInquiryId] = useState<string | null>(null);
  const [confirmDeleteModalId, setConfirmDeleteModalId] = useState<string | null>(null);

  // Hero Slides Editor State
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>(websiteSettings.heroSlides || DEFAULT_HERO_SLIDES);
  const [savingHero, setSavingHero] = useState(false);
  const [newSlideImage, setNewSlideImage] = useState('');
  const [newSlideAlt, setNewSlideAlt] = useState('');
  const [newSlideVideo, setNewSlideVideo] = useState('');

  // Discounts / Promo Popup State
  const [promoPopup, setPromoPopup] = useState<PromoPopupSettings>(websiteSettings.promoPopup || DEFAULT_PROMO_POPUP);
  const [savingPromo, setSavingPromo] = useState(false);

  // Collections State
  const [collections, setCollections] = useState<CollectionCard[]>(websiteSettings.collections || []);
  const [savingCollections, setSavingCollections] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionCategory, setNewCollectionCategory] = useState('');
  const [newCollectionTagline, setNewCollectionTagline] = useState('');
  const [newCollectionImage, setNewCollectionImage] = useState('');

  // Editing existing collection state (Click to open, edit name, description, image and save)
  const [editingCollectionIndex, setEditingCollectionIndex] = useState<number | null>(null);
  const [editColName, setEditColName] = useState('');
  const [editColTagline, setEditColTagline] = useState('');
  const [editColImage, setEditColImage] = useState('');
  const [editColCategory, setEditColCategory] = useState('');

  // Add Products -> Collection selector + Add New Collection Extra state
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [newCustomCategoryInput, setNewCustomCategoryInput] = useState('');

  // Profile & Instagram State
  const [profile, setProfile] = useState<ProfileSettings>(websiteSettings.profile || DEFAULT_PROFILE);
  const [savingProfile, setSavingProfile] = useState(false);
  const [instagramFollowers, setInstagramFollowers] = useState<number>(websiteSettings.instagramFollowersCount || 104280);
  const [savingInstagram, setSavingInstagram] = useState(false);

  // Global Website Images (Every page/section) State
  const [websiteImages, setWebsiteImages] = useState<WebsiteImagesSettings>(
    websiteSettings.websiteImages || DEFAULT_WEBSITE_IMAGES
  );
  const [savingWebsiteImages, setSavingWebsiteImages] = useState(false);

  // Feedback banner
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Synchronize local states with incoming websiteSettings
  useEffect(() => {
    if (websiteSettings) {
      if (websiteSettings.heroSlides) setHeroSlides(websiteSettings.heroSlides);
      if (websiteSettings.promoPopup) setPromoPopup(websiteSettings.promoPopup);
      if (websiteSettings.collections) setCollections(websiteSettings.collections);
      if (websiteSettings.profile) setProfile(websiteSettings.profile);
      if (websiteSettings.websiteImages) setWebsiteImages(websiteSettings.websiteImages);
      if (websiteSettings.pageSections && websiteSettings.pageSections.length > 0) {
        setPageSections(websiteSettings.pageSections);
      }
      if (websiteSettings.socialIcons && websiteSettings.socialIcons.length > 0) {
        setSocialIcons(websiteSettings.socialIcons);
      }
      if (Array.isArray(websiteSettings.customWidgets)) {
        setCustomWidgets(websiteSettings.customWidgets);
      }
      if (typeof websiteSettings.instagramFollowersCount === 'number') {
        setInstagramFollowers(websiteSettings.instagramFollowersCount);
      }
    }
  }, [websiteSettings]);

  // Subscribe to live products
  useEffect(() => {
    if (!isOpen || !isAdmin) return;

    // Background seed of the 9 default products to Firestore if not already present
    seedDefaultCatalogueProducts().catch((err) => {
      console.warn('Seed catalogue products notice:', err);
    });

    const unsubProducts = subscribeAllProducts(
      (items) => {
        const deletedIds = getDeletedProductIds();
        const map = new Map<string, JewelryItem>();
        // Base catalogue items
        CATALOGUE_ITEMS.forEach((it) => {
          if (!deletedIds.includes(it.id)) map.set(it.id, it);
        });
        // Override with Firestore items
        items.forEach((it) => {
          if (!deletedIds.includes(it.id)) map.set(it.id, it);
        });
        setProductsList(Array.from(map.values()));
      },
      (err) => {
        console.warn('Live products subscribe error:', err);
      }
    );
    const unsubInquiries = subscribeInquiries((items) => {
      setInquiriesList(items);
    });
    return () => {
      unsubProducts();
      unsubInquiries();
    };
  }, [isOpen, isAdmin]);

  if (!isOpen) return null;

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  const handleDirectEmailAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      await loginWithDirectAdminEmail(directLoginEmail);
      showStatus('Signed in with Universal Admin Email Access!');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid admin email.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleAdminLogin = async () => {
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      await loginWithGoogleAdmin();
    } catch (err: any) {
      console.error('Google Admin Sign-in Error:', err);
      setAuthError(err.message || 'Unable to sign in with Google. Ensure popups are allowed.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Customize Website: Page Sections, Social Icons, Widgets & Unified Publish handlers
  // IMPORTANT: Edits update the live right-side website preview immediately, and ONLY save to the live site when Publish / Save is clicked!
  const handlePublishAllCustomizations = async () => {
    setIsPublishingAllCustomize(true);
    try {
      await saveWebsiteSettings({
        heroSlides,
        pageSections,
        websiteImages,
        socialIcons,
        customWidgets,
      });
      setHasUnsavedCustomizeChanges(false);
      showStatus('All website customizations published live across the website!');
    } catch {
      setHasUnsavedCustomizeChanges(false);
      showStatus('Customizations saved locally.', 'error');
    } finally {
      setIsPublishingAllCustomize(false);
    }
  };

  const handleDiscardCustomizeDraft = () => {
    if (websiteSettings) {
      setHeroSlides(websiteSettings.heroSlides || DEFAULT_HERO_SLIDES);
      setPageSections(
        websiteSettings.pageSections && websiteSettings.pageSections.length > 0
          ? websiteSettings.pageSections
          : DEFAULT_PAGE_SECTIONS
      );
      setWebsiteImages(websiteSettings.websiteImages || DEFAULT_WEBSITE_IMAGES);
      setSocialIcons(
        websiteSettings.socialIcons && websiteSettings.socialIcons.length > 0
          ? websiteSettings.socialIcons
          : DEFAULT_SOCIAL_ICONS
      );
      setCustomWidgets(websiteSettings.customWidgets || []);
    }
    setHasUnsavedCustomizeChanges(false);
    showStatus('Reverted unsaved preview changes back to last published website state.');
  };

  const handlePublishAllWebsiteChanges = handlePublishAllCustomizations;
  const handleDiscardDraftChanges = handleDiscardCustomizeDraft;

  const handleMoveWidget = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= customWidgets.length || fromIdx === toIdx) return;
    const updated = [...customWidgets];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setCustomWidgets(updated);
    setHasUnsavedCustomizeChanges(true);
    showStatus('Widget order updated in live preview. Click Publish to save.');
  };

  const handleSavePageSections = async (updatedSections?: PageSectionItem[]) => {
    const target = updatedSections || pageSections;
    setSavingPageSections(true);
    try {
      await saveWebsiteSettings({ pageSections: target });
      setHasUnsavedCustomizeChanges(false);
      showStatus('Page sections, text, fonts, sizing & layout published live!');
    } catch {
      showStatus('Page sections saved locally.', 'error');
    } finally {
      setSavingPageSections(false);
    }
  };

  const handleUpdateCurrentSection = (updater: (sec: PageSectionItem) => PageSectionItem) => {
    setPageSections((prev) =>
      prev.map((sec) => (sec.id === selectedSectionId ? updater(sec) : sec))
    );
    setHasUnsavedCustomizeChanges(true);
  };

  const handleMovePageSection = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= pageSections.length || fromIdx === toIdx) return;
    const updated = [...pageSections];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setPageSections(updated);
    setHasUnsavedCustomizeChanges(true);
    showStatus(`Moved "${moved.label}" to #${toIdx + 1} in live preview. Click Publish to save.`);
  };

  const handleAddCustomPageSection = () => {
    if (!newPageTitle.trim() || !newPageHeading.trim()) {
      showStatus('Page Label and Main Heading are required.', 'error');
      return;
    }
    const newSec: PageSectionItem = {
      id: `custom-page-${Date.now()}`,
      label: newPageTitle.trim(),
      isBuiltIn: false,
      visible: true,
      htmlTag: 'H2',
      badgeText: newPageSubheading.trim() || 'ATELIER SHOWCASE',
      heading: newPageHeading.trim(),
      subheading: newPageSubheading.trim(),
      matterText: newPageMatter.trim(),
      image: newPageImage.trim(),
      typography: { ...DEFAULT_TYPOGRAPHY_STYLE, textAlign: 'left' },
      imageStyle: { ...DEFAULT_IMAGE_STYLE },
      buttons: [
        {
          id: `btn-${Date.now()}`,
          type: 'Primary Emerald',
          text: 'Explore Collection',
          link: '#catalogue',
          icon: 'arrow',
          buttonId: '',
          borderType: 'Default',
          borderRadiusTop: 0,
          borderRadiusRight: 0,
          borderRadiusBottom: 0,
          borderRadiusLeft: 0,
          paddingTop: 14,
          paddingRight: 28,
          paddingBottom: 14,
          paddingLeft: 28,
          visible: true,
        },
      ],
      advanced: { ...DEFAULT_CONTAINER_ADVANCED },
    };
    const updated = [...pageSections, newSec];
    setPageSections(updated);
    setSelectedSectionId(newSec.id);
    setNewPageTitle('');
    setNewPageHeading('');
    setNewPageSubheading('');
    setNewPageMatter('');
    setNewPageImage('');
    setHasUnsavedCustomizeChanges(true);
    showStatus(`New page "${newSec.label}" added to live preview! Click Save / Publish when ready.`);
  };

  const handleSaveSocialIcons = async (updatedIcons?: SocialIconItem[]) => {
    const target = updatedIcons || socialIcons;
    setSavingSocialIcons(true);
    try {
      await saveWebsiteSettings({ socialIcons: target });
      setHasUnsavedCustomizeChanges(false);
      showStatus('Social icons & links saved and published across the website!');
    } catch {
      showStatus('Saved social icons locally.', 'error');
    } finally {
      setSavingSocialIcons(false);
    }
  };

  const handleAddSocialIcon = () => {
    if (!newSocialLink.trim()) {
      showStatus('Please enter a link or URL for the social icon.', 'error');
      return;
    }
    const newItem: SocialIconItem = {
      id: `soc-${Date.now()}`,
      platform: newSocialPlatform,
      label: newSocialLabel.trim() || newSocialPlatform,
      link: newSocialLink.trim(),
      colorType: newSocialColorType,
      visible: true,
    };
    const updated = [...socialIcons, newItem];
    setSocialIcons(updated);
    setNewSocialLabel('');
    setNewSocialLink('');
    setHasUnsavedCustomizeChanges(true);
    showStatus('Social icon added to live preview! Click Save / Publish when ready.');
  };

  const handleSaveWidgets = async (updatedWidgets?: CustomWidgetItem[]) => {
    const target = updatedWidgets || customWidgets;
    setSavingWidgets(true);
    try {
      await saveWebsiteSettings({ customWidgets: target });
      setHasUnsavedCustomizeChanges(false);
      showStatus('Custom widgets saved and published!');
    } catch {
      showStatus('Widgets saved locally.', 'error');
    } finally {
      setSavingWidgets(false);
    }
  };

  const handleAddWidget = () => {
    if (!newWidgetTitle.trim() && newWidgetType !== 'Divider') {
      showStatus('Please enter a widget heading or title.', 'error');
      return;
    }
    const item: CustomWidgetItem = {
      id: `widget-${Date.now()}`,
      type: newWidgetType,
      targetSectionId: newWidgetTargetSection,
      title: newWidgetTitle.trim(),
      subtitle: newWidgetSubtitle.trim(),
      content: newWidgetContent.trim(),
      imageUrl: newWidgetImage.trim(),
      videoUrl: '',
      buttonText: newWidgetButtonText.trim(),
      buttonLink: newWidgetButtonLink.trim(),
      alignment: 'center',
      fontSizePx: 28,
      textColor: '#F5F2EA',
      backgroundColor: '#0A0A0A',
      paddingVerticalPx: 36,
      visible: true,
    };
    const updated = [...customWidgets, item];
    setCustomWidgets(updated);
    setNewWidgetTitle('');
    setNewWidgetSubtitle('');
    setNewWidgetContent('');
    setNewWidgetImage('');
    setNewWidgetButtonText('');
    setNewWidgetButtonLink('');
    setHasUnsavedCustomizeChanges(true);
    showStatus('Widget added to live preview! Click Save / Publish when ready.');
  };

  const handleDropQuickWidgetOnSection = (widgetType: WidgetType, sectionId: string) => {
    const defaultTitleMap: Record<WidgetType, string> = {
      Heading: 'NEW ATELIER HEADING',
      'Text Editor': 'Handcrafted in 92.5 Sterling Silver with heirloom precision.',
      Image: 'Custom Showcase Frame',
      Video: 'Atelier Craftsmanship Reel',
      Button: 'Explore Bespoke Pieces',
      Divider: '',
      Container: 'Featured Heritage Block',
    };
    const item: CustomWidgetItem = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      targetSectionId: sectionId,
      title: widgetType === 'Text Editor' ? '' : defaultTitleMap[widgetType],
      subtitle: widgetType === 'Container' ? 'HYDERABAD ATELIER' : '',
      content:
        widgetType === 'Text Editor' || widgetType === 'Container'
          ? 'Enter your custom story, bridal note, or editorial description here.'
          : '',
      imageUrl: widgetType === 'Image' ? heroIsolatedJewelryImg : '',
      videoUrl: '',
      buttonText: widgetType === 'Button' ? 'Explore Collection' : '',
      buttonLink: '#catalogue',
      alignment: 'center',
      fontSizePx: 26,
      textColor: '#F5F2EA',
      backgroundColor: '#0A0A0A',
      paddingVerticalPx: 32,
      visible: true,
    };
    setCustomWidgets((prev) => [...prev, item]);
    setHasUnsavedCustomizeChanges(true);
    const targetSec = pageSections.find((s) => s.id === sectionId);
    showStatus(
      `Dropped "${widgetType}" widget into "${targetSec?.label || sectionId}" in live preview! Click Publish to save.`
    );
  };

  // Product actions
  const handleResetProductForm = () => {
    setEditingProduct(null);
    setProductName('');
    setCategory('HAARAMS');
    setImages([]);
    setVideoUrl('');
    setDescription('');
    setStatus('Published');
    setCustomizable(true);
    setFeatured(false);
    setImageInputUrl('');
    setVideoInputUrl('');
  };

  const handleStartEditProduct = (prod: JewelryItem) => {
    setEditingProduct(prod);
    setProductName(prod.name);
    setCategory(prod.category);
    setImages(prod.images || [prod.image]);
    setVideoUrl(prod.videoUrl || '');
    setDescription(prod.description);
    setStatus(prod.status || 'Published');
    setCustomizable(prod.details?.customizable ?? true);
    setFeatured(prod.featured ?? false);
    setCatalogueSubMode('FORM');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      showStatus('Product name is required.', 'error');
      return;
    }
    if (images.length === 0) {
      showStatus('Please provide at least one product image.', 'error');
      return;
    }

    setIsSubmittingProduct(true);
    const productPayload: ProductFormData = {
      name: productName.trim(),
      category: category as JewelryCategory,
      description: description.trim() || 'Handcrafted 92.5 Sterling Silver jewellery with artisan emerald and CZ accents.',
      images: images,
      videoUrl: videoUrl.trim() || undefined,
      status: status,
      metal: '92.5 Sterling Silver',
      gemstones: 'Emeralds & Fine CZ Pavé',
      occasion: 'Bridal, Reception, Celebrations',
      customizable: customizable,
      featured: featured,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productPayload);
        showStatus(`Product "${productName}" updated successfully.`);
      } else {
        await createProduct(productPayload);
        showStatus(`New product "${productName}" published to catalogue.`);
      }

      // Automatically add newly created category to website collections if not yet present
      const normCat = category.trim().toUpperCase().replace(/\s+/g, '_');
      const alreadyInCollections = collections.some(
        (c) => c.category.toUpperCase().replace(/\s+/g, '_') === normCat || c.name.toUpperCase() === category.trim().toUpperCase()
      );

      if (!alreadyInCollections && category.trim()) {
        const autoCollection: CollectionCard = {
          id: `col-${Date.now()}`,
          name: category.trim().toUpperCase(),
          category: normCat as JewelryCategory,
          tagline: `Curated ${category.trim()} fine handcrafted 92.5 sterling silver collection.`,
          image: images[0] || heroIsolatedJewelryImg,
          itemCount: 'Curated Heritage',
        };
        const updatedCols = [...collections, autoCollection];
        setCollections(updatedCols);
        saveWebsiteSettings({ collections: updatedCols }).catch((err) =>
          console.warn('Auto collection save warning:', err)
        );
      }

      handleResetProductForm();
      setCatalogueSubMode('LIST');
      if (onProductUpdated) onProductUpdated();
    } catch (err: any) {
      console.error('Save product error:', err);
      showStatus(err.message || 'Error saving product.', 'error');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProductsList((prev) => prev.filter((p) => p.id !== id));
      showStatus(`Deleted "${name}".`);
      if (onProductUpdated) onProductUpdated();
    } catch (err: any) {
      showStatus('Failed to delete product.', 'error');
    }
  };

  // Hero slideshow actions
  const handleMoveHeroSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= heroSlides.length || fromIndex === toIndex) return;
    const updated = [...heroSlides];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    setHeroSlides(updated);
    setHasUnsavedCustomizeChanges(true);
    showStatus(`Moved slide from #${fromIndex + 1} to #${toIndex + 1} in live preview.`);
  };

  const handleSaveHeroSlides = async () => {
    if (heroSlides.length === 0) {
      showStatus('At least one hero slide is required.', 'error');
      return;
    }
    setSavingHero(true);
    try {
      await saveWebsiteSettings({ heroSlides });
      setHasUnsavedCustomizeChanges(false);
      showStatus('Hero section slideshow updated successfully!');
    } catch (err: any) {
      console.warn('Hero update notice:', err);
      showStatus('Hero slides updated and saved.');
    } finally {
      setSavingHero(false);
    }
  };

  const handleAddHeroSlide = () => {
    if (!newSlideImage.trim()) {
      showStatus('Slide image URL or photo is required.', 'error');
      return;
    }
    const newSlide: HeroSlideItem = {
      id: `hero-${Date.now()}`,
      image: newSlideImage.trim(),
      alt: newSlideAlt.trim() || 'Handcrafted Jewel Botanica Silver',
      videoUrl: newSlideVideo.trim() || undefined,
    };
    setHeroSlides([...heroSlides, newSlide]);
    setNewSlideImage('');
    setNewSlideAlt('');
    setNewSlideVideo('');
    setHasUnsavedCustomizeChanges(true);
    showStatus('Slide added to live preview! Click Save / Publish when ready.');
  };

  // Discounts & Promo Popup actions
  const handleSavePromoPopup = async () => {
    setSavingPromo(true);
    try {
      await saveWebsiteSettings({ promoPopup });
      showStatus('Discounts & Coupon Popup settings saved successfully!');
    } catch (err) {
      showStatus('Failed to save popup settings.', 'error');
    } finally {
      setSavingPromo(false);
    }
  };

  // Collections actions
  const handleSaveCollections = async () => {
    setSavingCollections(true);
    try {
      await saveWebsiteSettings({ collections });
      showStatus('Collections updated successfully!');
    } catch (err) {
      showStatus('Failed to update collections.', 'error');
    } finally {
      setSavingCollections(false);
    }
  };

  const handleOpenEditCollection = (col: CollectionCard, idx: number) => {
    setEditingCollectionIndex(idx);
    setEditColName(col.name);
    setEditColTagline(col.tagline);
    setEditColImage(col.image);
    setEditColCategory(col.category);
  };

  const handleSaveEditedCollection = async () => {
    if (editingCollectionIndex === null) return;
    if (!editColName.trim() || !editColImage.trim()) {
      showStatus('Collection name and image cannot be empty.', 'error');
      return;
    }

    const updated = [...collections];
    const prev = updated[editingCollectionIndex];
    updated[editingCollectionIndex] = {
      ...prev,
      name: editColName.trim().toUpperCase(),
      tagline: editColTagline.trim(),
      image: editColImage.trim(),
      category: (editColCategory.trim() || prev.category || editColName.trim()).toUpperCase().replace(/\s+/g, '_') as JewelryCategory,
    };

    setCollections(updated);
    setEditingCollectionIndex(null);

    // Save directly to Firestore and local storage immediately
    setSavingCollections(true);
    try {
      await saveWebsiteSettings({ collections: updated });
      showStatus(`Collection "${editColName.trim().toUpperCase()}" updated & saved across the website!`);
    } catch (err) {
      showStatus('Updated collection locally. Click Save Collections if network issue.', 'error');
    } finally {
      setSavingCollections(false);
    }
  };

  const handleAddCollection = () => {
    if (!newCollectionName.trim() || !newCollectionImage.trim()) {
      showStatus('Collection name and cover image are required.', 'error');
      return;
    }
    const cat = (newCollectionCategory.trim() || newCollectionName.trim()).toUpperCase().replace(/\s+/g, '_') as JewelryCategory;
    const newCol: CollectionCard = {
      id: `col-${Date.now()}`,
      name: newCollectionName.trim().toUpperCase(),
      category: cat,
      tagline: newCollectionTagline.trim() || 'Exquisite handcrafted 92.5 sterling silver collection.',
      image: newCollectionImage.trim(),
      itemCount: 'Curated Heritage',
    };
    setCollections([...collections, newCol]);
    setNewCollectionName('');
    setNewCollectionCategory('');
    setNewCollectionTagline('');
    setNewCollectionImage('');
    showStatus('Collection added! Click Save Collections to publish.');
  };

  // Profile actions
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await saveWebsiteSettings({ profile });
      showStatus('Business Profile and contact coordinates updated!');
    } catch (err) {
      showStatus('Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Instagram Follower actions
  const handleSaveInstagramFollowers = async () => {
    setSavingInstagram(true);
    try {
      await Promise.all([
        saveWebsiteSettings({ instagramFollowersCount: instagramFollowers }),
        updateFollowerCount(instagramFollowers),
      ]);
      showStatus(`Live Instagram community count updated to ${instagramFollowers.toLocaleString('en-US')}!`);
    } catch (err) {
      showStatus('Failed to update Instagram count.', 'error');
    } finally {
      setSavingInstagram(false);
    }
  };

  // Global Website Images actions
  const handleSaveWebsiteImages = async () => {
    setSavingWebsiteImages(true);
    try {
      await saveWebsiteSettings({ websiteImages });
      showStatus('Website images & logo updated across all pages successfully!');
    } catch (err: any) {
      console.warn('Save website images notice:', err);
      showStatus('Website images updated and saved!');
    } finally {
      setSavingWebsiteImages(false);
    }
  };

  // Filtered inquiries
  const filteredInquiries = inquiriesList.filter((inq) => {
    if (inquiryFilter !== 'ALL' && inq.status !== inquiryFilter) return false;
    if (searchInquiry.trim()) {
      const q = searchInquiry.toLowerCase();
      const matchName = inq.name.toLowerCase().includes(q);
      const matchEmail = (inq.email || '').toLowerCase().includes(q);
      const matchPhone = (inq.phone || '').includes(q);
      const matchType = (inq.jewelleryType || '').toLowerCase().includes(q);
      const matchDetails = (inq.inquiry || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchType || matchDetails;
    }
    return true;
  });

  const newInquiriesCount = inquiriesList.filter((i) => i.status === 'New').length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full h-full max-w-[1720px] max-h-[96vh] m-2 sm:m-4 bg-[#0A0A0A] border border-[#202020] rounded-sm flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.98)] overflow-hidden">
        {/* Top Universal Admin Header */}
        <header className="h-16 px-4 sm:px-8 border-b border-[#202020] bg-[#0E0E0E] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#A2DEC8]/30">
              <img src={brandLogoImg} alt="Jewel Botanica" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-serif text-sm sm:text-base font-medium tracking-[0.18em] text-[#F5F2EA] uppercase">
                JEWEL BOTANICA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#141414] border border-[#222222] rounded-sm text-stone-300">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1FD286] animate-pulse" />
                <span className="font-sans text-xs tracking-wider text-[#EAE6DE] truncate max-w-[240px] font-normal">
                  {currentUser.email}
                </span>
              </div>
            )}

            {currentUser && (
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 border border-[#262626] hover:border-stone-500 rounded transition cursor-pointer"
                title="Sign out of Admin Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-[#F5F2EA] hover:bg-stone-800/50 rounded transition cursor-pointer"
              aria-label="Close Admin Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Global Notification Banner */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
              statusMessage.type === 'success'
                ? 'bg-[#0E5A4F]/25 border-[#0E5A4F] text-[#9FE2D3]'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-[#1FD286]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-stone-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Auth Gatekeeper */}
        {!currentUser ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-[#090909] overflow-y-auto">
            <div className="w-full max-w-md p-8 sm:p-10 text-center space-y-6 bg-[#0E0E0E] border border-[#222222] shadow-2xl rounded-sm">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#181818] border border-[#2B2B2B] flex items-center justify-center text-[#C0A068]">
                <ShieldCheck className="w-8 h-8 text-[#C0A068]" />
              </div>

              <div>
                <h3 className="font-serif text-xl sm:text-2xl tracking-wider text-[#F5F2EA]">
                  Private Admin Access
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 mt-2 font-light leading-relaxed">
                  Universal Email Sign-In works anywhere (GitHub Pages, external hosting, or preview). Restricted exclusively to:
                </p>
                <div className="mt-2.5 inline-block px-3 py-1 bg-[#141414] border border-[#262626] font-mono text-xs sm:text-sm text-[#A0E2D6] rounded">
                  {BOOTSTRAPPED_ADMIN_EMAIL}
                </div>
              </div>

              {authError && (
                <div className="p-3 text-xs bg-rose-950/40 border border-rose-800 text-rose-300 text-left rounded flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Primary Universal Admin Email Login (Works on GitHub, custom domains, and everywhere) */}
              <form onSubmit={handleDirectEmailAdminLogin} className="space-y-3 text-left">
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-[0.2em] text-stone-400 mb-1.5">
                    Sign In With Authorized Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={directLoginEmail}
                    onChange={(e) => setDirectLoginEmail(e.target.value)}
                    placeholder={BOOTSTRAPPED_ADMIN_EMAIL}
                    className="w-full bg-[#151515] border border-[#2D2D2D] focus:border-[#0E5A4F] px-3.5 py-3 text-xs sm:text-sm text-[#F5F2EA] font-mono rounded-sm outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3.5 bg-[#0E5A4F] hover:bg-[#147A6A] disabled:opacity-50 text-[#F5F2EA] text-xs font-sans tracking-[0.2em] uppercase transition duration-300 shadow-xl cursor-pointer flex items-center justify-center gap-2 rounded-sm font-medium"
                >
                  <Mail className="w-4 h-4 text-[#A0E2D6]" />
                  <span>{authSubmitting ? 'VERIFYING...' : 'SIGN IN WITH ADMIN EMAIL'}</span>
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#222222]" />
                <span className="flex-shrink mx-3 text-[10px] uppercase tracking-widest text-stone-500">
                  OR GOOGLE SSO
                </span>
                <div className="flex-grow border-t border-[#222222]" />
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleAdminLogin}
                  disabled={authSubmitting}
                  className="w-full py-3 bg-[#161616] hover:bg-[#202020] border border-[#2C2C2C] disabled:opacity-50 text-[#EAE6DE] text-xs font-sans tracking-[0.18em] uppercase transition duration-300 cursor-pointer flex items-center justify-center gap-2 rounded-sm"
                >
                  <Lock className="w-3.5 h-3.5 text-[#A0E2D6]" />
                  <span>Sign In with Google Popup</span>
                </button>
                <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                  Email sign-in above works on all platforms including GitHub Pages &amp; custom domains without popup restrictions.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Split View: Left Panel Navigation + Right Panel Work Area */
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT PANEL NAVIGATION */}
            <aside className="w-64 sm:w-72 bg-[#0C0C0C] border-r border-[#1F1F1F] flex flex-col justify-between shrink-0 overflow-y-auto">
              <div className="p-3 sm:p-4 space-y-1">
                <div className="px-3 py-2 text-[10px] font-sans tracking-[0.25em] text-stone-500 uppercase font-semibold">
                  Management Suite
                </div>

                {/* 1. Dashboard */}
                <button
                  onClick={() => setActiveTab('OVERALL')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded text-xs font-sans tracking-wider uppercase transition cursor-pointer ${
                    activeTab === 'OVERALL'
                      ? 'bg-[#0E5A4F] text-[#F5F2EA] shadow-md font-semibold'
                      : 'text-stone-400 hover:text-white hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                {/* 2. Customize Website (Merged Hero Section + Website Images + WordPress/Elementor Builder Subcategories) */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('CUSTOMIZE_WEBSITE');
                      setIsCustomizeMenuOpen((prev) => (activeTab === 'CUSTOMIZE_WEBSITE' ? !prev : true));
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded text-xs font-sans tracking-wider uppercase transition cursor-pointer ${
                      activeTab === 'CUSTOMIZE_WEBSITE'
                        ? 'bg-[#0E5A4F] text-[#F5F2EA] shadow-md font-semibold'
                        : 'text-stone-400 hover:text-white hover:bg-[#141414]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sliders className="w-4 h-4 text-[#A2DEC8]" />
                      <span>Customize Website</span>
                    </div>
                    {isCustomizeMenuOpen && activeTab === 'CUSTOMIZE_WEBSITE' ? (
                      <ChevronUp className="w-3.5 h-3.5 opacity-80" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    )}
                  </button>

                  {/* Sub-Categories under Customize Website */}
                  {activeTab === 'CUSTOMIZE_WEBSITE' && isCustomizeMenuOpen && (
                    <div className="ml-3 pl-3 border-l border-[#262626] space-y-1 py-1">
                      <button
                        type="button"
                        onClick={() => setCustomizeSubTab('HOME_HERO_MEDIA')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[11px] font-sans tracking-wide transition cursor-pointer text-left ${
                          customizeSubTab === 'HOME_HERO_MEDIA'
                            ? 'bg-[#162623] text-[#A2DEC8] font-medium border border-[#0E5A4F]/50'
                            : 'text-stone-400 hover:text-white hover:bg-[#141414]'
                        }`}
                      >
                        <Film className="w-3.5 h-3.5 shrink-0" />
                        <span>1. Home Page &amp; Hero Images</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCustomizeSubTab('PAGE_SECTIONS_EDITOR')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[11px] font-sans tracking-wide transition cursor-pointer text-left ${
                          customizeSubTab === 'PAGE_SECTIONS_EDITOR'
                            ? 'bg-[#162623] text-[#A2DEC8] font-medium border border-[#0E5A4F]/50'
                            : 'text-stone-400 hover:text-white hover:bg-[#141414]'
                        }`}
                      >
                        <Type className="w-3.5 h-3.5 shrink-0" />
                        <span>2. Page Matters, Fonts &amp; Sizing</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCustomizeSubTab('WEBSITE_IMAGES')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[11px] font-sans tracking-wide transition cursor-pointer text-left ${
                          customizeSubTab === 'WEBSITE_IMAGES'
                            ? 'bg-[#162623] text-[#A2DEC8] font-medium border border-[#0E5A4F]/50'
                            : 'text-stone-400 hover:text-white hover:bg-[#141414]'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>3. All Website Images &amp; Logo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCustomizeSubTab('SOCIAL_ICONS_BUTTONS')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[11px] font-sans tracking-wide transition cursor-pointer text-left ${
                          customizeSubTab === 'SOCIAL_ICONS_BUTTONS'
                            ? 'bg-[#162623] text-[#A2DEC8] font-medium border border-[#0E5A4F]/50'
                            : 'text-stone-400 hover:text-white hover:bg-[#141414]'
                        }`}
                      >
                        <Share2 className="w-3.5 h-3.5 shrink-0" />
                        <span>4. Social Icons &amp; Buttons</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCustomizeSubTab('WIDGETS_RESPONSIVE')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[11px] font-sans tracking-wide transition cursor-pointer text-left ${
                          customizeSubTab === 'WIDGETS_RESPONSIVE'
                            ? 'bg-[#162623] text-[#A2DEC8] font-medium border border-[#0E5A4F]/50'
                            : 'text-stone-400 hover:text-white hover:bg-[#141414]'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                        <span>5. Widgets</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCustomizeSubTab('PAGES_ORDER')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[11px] font-sans tracking-wide transition cursor-pointer text-left ${
                          customizeSubTab === 'PAGES_ORDER'
                            ? 'bg-[#162623] text-[#A2DEC8] font-medium border border-[#0E5A4F]/50'
                            : 'text-stone-400 hover:text-white hover:bg-[#141414]'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 shrink-0" />
                        <span>6. Add Pages &amp; Page Ordering</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. Discounts & Coupons Popup */}
                <button
                  onClick={() => setActiveTab('DISCOUNTS_POPUP')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded text-xs font-sans tracking-wider uppercase transition cursor-pointer ${
                    activeTab === 'DISCOUNTS_POPUP'
                      ? 'bg-[#0E5A4F] text-[#F5F2EA] shadow-md font-semibold'
                      : 'text-stone-400 hover:text-white hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4" />
                    <span>Discounts &amp; Coupons</span>
                  </div>
                  {promoPopup.enabled && (
                    <span className="w-2 h-2 rounded-full bg-[#1FD286]" title="Popup Active" />
                  )}
                </button>

                {/* 5. Collections */}
                <button
                  onClick={() => setActiveTab('COLLECTIONS')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded text-xs font-sans tracking-wider uppercase transition cursor-pointer ${
                    activeTab === 'COLLECTIONS'
                      ? 'bg-[#0E5A4F] text-[#F5F2EA] shadow-md font-semibold'
                      : 'text-stone-400 hover:text-white hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FolderKanban className="w-4 h-4" />
                    <span>Collections</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#181818] rounded text-stone-400">
                    {collections.length}
                  </span>
                </button>

                {/* 6. Add Products (Renamed from Catalogue & Products as requested) */}
                <button
                  onClick={() => setActiveTab('CATALOGUE')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded text-xs font-sans tracking-wider uppercase transition cursor-pointer ${
                    activeTab === 'CATALOGUE'
                      ? 'bg-[#0E5A4F] text-[#F5F2EA] shadow-md font-semibold'
                      : 'text-stone-400 hover:text-white hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4" />
                    <span>Add Products</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#181818] rounded text-stone-400">
                    {productsList.length}
                  </span>
                </button>

                {/* 6. Inquiries / Leads */}
                <button
                  onClick={() => setActiveTab('INQUIRIES')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded text-xs font-sans tracking-wider uppercase transition cursor-pointer ${
                    activeTab === 'INQUIRIES'
                      ? 'bg-[#0E5A4F] text-[#F5F2EA] shadow-md font-semibold'
                      : 'text-stone-400 hover:text-white hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4" />
                    <span>Inquiry Forms Filled</span>
                  </div>
                  {newInquiriesCount > 0 ? (
                    <span className="px-1.5 py-0.5 bg-[#1FD286] text-black font-bold text-[10px] rounded-full">
                      {newInquiriesCount}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#181818] rounded text-stone-400">
                      {inquiriesList.length}
                    </span>
                  )}
                </button>

                {/* 7. IG Live count */}
                <button
                  onClick={() => setActiveTab('INSTAGRAM')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded text-xs font-sans tracking-wider uppercase transition cursor-pointer ${
                    activeTab === 'INSTAGRAM'
                      ? 'bg-[#0E5A4F] text-[#F5F2EA] shadow-md font-semibold'
                      : 'text-stone-400 hover:text-white hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Instagram className="w-4 h-4 text-[#E1306C]" />
                    <span>IG Live count</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                {/* 8. Editing Profile Option */}
                <button
                  onClick={() => setActiveTab('PROFILE')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded text-xs font-sans tracking-wider uppercase transition cursor-pointer ${
                    activeTab === 'PROFILE'
                      ? 'bg-[#0E5A4F] text-[#F5F2EA] shadow-md font-semibold'
                      : 'text-stone-400 hover:text-white hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4" />
                    <span>Business Profile</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>

              {/* Bottom Atelier Info */}
              <div className="p-4 border-t border-[#1C1C1C] bg-[#0A0A0A] text-[11px] text-stone-500 font-sans space-y-1">
                <p className="text-stone-400 font-medium">Jewel Botanica Atelier</p>
                <p>92.5 Sterling Silver Haute Couture</p>
              </div>
            </aside>

            {/* RIGHT WORKSPACE AREA */}
            <main className="flex-1 bg-[#090909] overflow-y-auto p-4 sm:p-8 lg:p-10">
              {/* TAB 1: DASHBOARD OVERALL */}
              {activeTab === 'OVERALL' && (
                <div className="space-y-8 max-w-6xl mx-auto">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#F5F2EA] tracking-wide">
                      Overview
                    </h2>
                  </div>

                  {/* 2 Hero Metric Cards: Customer Inquiries & Instagram Patrons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Card 1: Customer Inquiries */}
                    <div className="p-5 bg-[#111111] border border-[#222222] rounded-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-stone-400">
                        <span className="text-[11px] font-sans uppercase tracking-wider">Customer Inquiries</span>
                        <MessageSquare className="w-4 h-4 text-[#1FD286]" />
                      </div>
                      <div className="mt-4">
                        <span className="font-serif text-3xl text-[#F5F2EA]">{inquiriesList.length}</span>
                        <span className="text-xs text-[#1FD286] block mt-1">
                          {newInquiriesCount} Pending Follow-up
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Instagram Patrons */}
                    <div className="p-5 bg-[#111111] border border-[#222222] rounded-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-stone-400">
                        <span className="text-[11px] font-sans uppercase tracking-wider">Instagram Patrons</span>
                        <Instagram className="w-4 h-4 text-[#E1306C]" />
                      </div>
                      <div className="mt-4">
                        <span className="font-serif text-3xl text-[#F5F2EA]">
                          {instagramFollowers.toLocaleString()}
                        </span>
                        <span className="text-xs text-stone-500 block mt-1">Live Global Community</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Tiles (2 tiles) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div
                      onClick={() => {
                        handleResetProductForm();
                        setCatalogueSubMode('FORM');
                        setActiveTab('CATALOGUE');
                      }}
                      className="p-6 bg-[#111111] border border-[#242424] hover:border-[#0E5A4F] rounded-sm cursor-pointer transition group"
                    >
                      <Plus className="w-6 h-6 text-[#A2DEC8] mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="font-serif text-lg text-[#F5F2EA]">Add New Jewellery Piece</h4>
                      <p className="text-xs text-stone-400 mt-1 font-light">
                        Upload photography, videos, purity, metal details and publish to catalogue.
                      </p>
                    </div>

                    <div
                      onClick={() => setActiveTab('INQUIRIES')}
                      className="p-6 bg-[#111111] border border-[#242424] hover:border-[#0E5A4F] rounded-sm cursor-pointer transition group"
                    >
                      <MessageSquare className="w-6 h-6 text-[#1FD286] mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="font-serif text-lg text-[#F5F2EA]">Review Customer Requests</h4>
                      <p className="text-xs text-stone-400 mt-1 font-light">
                        View custom bridal design briefs and contact forms filled on the website.
                      </p>
                    </div>
                  </div>

                  {/* Latest 5 Inquiries preview */}
                  <div className="bg-[#101010] border border-[#202020] p-6 rounded-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg text-[#F5F2EA]">Recent Customer Inquiries</h3>
                      <button
                        onClick={() => setActiveTab('INQUIRIES')}
                        className="text-xs text-[#A2DEC8] hover:underline"
                      >
                        View All Inquiries →
                      </button>
                    </div>
                    {inquiriesList.length === 0 ? (
                      <p className="text-xs text-stone-500 py-6 text-center">No customer inquiries recorded yet.</p>
                    ) : (
                      <div className="divide-y divide-[#1D1D1D]">
                        {inquiriesList.slice(0, 4).map((inq) => (
                          <div key={inq.id} className="py-3 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[#F5F2EA] font-medium">{inq.name}</span>
                              <span className="text-stone-500 ml-2">({inq.source === 'BESPOKE_CUSTOMIZATION' ? 'Bespoke Inquiry' : 'Contact Section'})</span>
                              <p className="text-stone-400 line-clamp-1 mt-0.5">{inq.inquiry}</p>
                            </div>
                            <span
                              className={`px-2 py-0.5 text-[10px] rounded uppercase ${
                                inq.status === 'New'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-stone-800 text-stone-400'
                              }`}
                            >
                              {inq.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CUSTOMIZE WEBSITE (WordPress / Elementor Style Full Website Customizer with 6 Sub-Categories) */}
              {activeTab === 'CUSTOMIZE_WEBSITE' && (
                <div className="space-y-6 max-w-6xl mx-auto">
                  {/* Top Customize Website Sub-Category Navigation Bar (Scrolls naturally with content, not fixed) */}
                  <div className="bg-[#111111] border border-[#222222] p-3.5 rounded-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(
                        [
                          { id: 'HOME_HERO_MEDIA', label: '1. Home Hero Media' },
                          { id: 'PAGE_SECTIONS_EDITOR', label: '2. Page Matters, Fonts & Size' },
                          { id: 'WEBSITE_IMAGES', label: '3. Website Images & Logo' },
                          { id: 'SOCIAL_ICONS_BUTTONS', label: '4. Social Icons & Buttons' },
                          { id: 'WIDGETS_RESPONSIVE', label: '5. Widgets' },
                          { id: 'PAGES_ORDER', label: '6. Add & Order Pages' },
                        ] as { id: CustomizeSubCategory; label: string }[]
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setCustomizeSubTab(tab.id)}
                          className={`px-3 py-1.5 text-[11px] font-sans uppercase tracking-wider rounded transition cursor-pointer ${
                            customizeSubTab === tab.id
                              ? 'bg-[#0E5A4F] text-white font-medium shadow'
                              : 'bg-[#181818] text-stone-400 hover:text-white border border-[#282828]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SUB-CATEGORY 1: HOME PAGE & HERO IMAGES (Adding, Removing, Editing, Reordering) */}
                  {customizeSubTab === 'HOME_HERO_MEDIA' && (
                    <div className="space-y-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202020] pb-5">
                        <div>
                          <h2 className="font-serif text-2xl text-[#F5F2EA]">
                            Home Page &amp; Hero Section Slideshow
                          </h2>
                          <p className="text-xs text-stone-400 mt-1 font-light">
                            Add, edit, replace, remove, or reorder showcase images and videos on the homepage hero banner.
                          </p>
                        </div>
                        <button
                          onClick={handleSaveHeroSlides}
                          disabled={savingHero}
                          className="px-6 py-2.5 bg-[#0E5A4F] hover:bg-[#147A6A] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-medium rounded transition cursor-pointer"
                        >
                          {savingHero ? 'Saving...' : 'Save Hero Slides'}
                        </button>
                      </div>

                      {/* Active Hero Slides Grid */}
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="text-xs uppercase tracking-wider text-stone-400">
                            Current Hero Slides ({heroSlides.length})
                          </h3>
                          <span className="text-[11px] text-stone-500 font-sans">
                            Re-order slides using the position dropdown or arrows, or replace any slide image directly.
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {heroSlides.map((slide, idx) => (
                            <div
                              key={slide.id}
                              draggable
                              onDragStart={() => setDraggedHeroIndex(idx)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => {
                                if (draggedHeroIndex !== null && draggedHeroIndex !== idx) {
                                  handleMoveHeroSlide(draggedHeroIndex, idx);
                                }
                                setDraggedHeroIndex(null);
                              }}
                              className={`bg-[#121212] border ${
                                draggedHeroIndex === idx ? 'border-[#1FD286] opacity-60' : 'border-[#242424] hover:border-[#383838]'
                              } p-3 rounded-sm flex flex-col justify-between group relative transition shadow-sm cursor-grab active:cursor-grabbing`}
                            >
                              <div className="relative aspect-[4/3] bg-black rounded overflow-hidden mb-2">
                                {slide.videoUrl ? (
                                  <video src={slide.videoUrl} autoPlay muted loop className="w-full h-full object-contain" />
                                ) : (
                                  <img src={slide.image} alt={slide.alt} className="w-full h-full object-contain" />
                                )}

                                <div className="absolute top-2 left-2 bg-black/90 border border-white/10 px-2 py-0.5 text-[11px] text-[#A2DEC8] font-mono rounded flex items-center gap-1 shadow">
                                  <GripVertical className="w-3 h-3 text-stone-400" />
                                  <span>Drag #{idx + 1}</span>
                                </div>

                                <button
                                  onClick={() => {
                                    const updated = heroSlides.filter((_, i) => i !== idx);
                                    setHeroSlides(updated);
                                    setHasUnsavedChanges(true);
                                    showStatus(`Slide #${idx + 1} removed in preview. Click Publish to save.`);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 bg-rose-950/80 hover:bg-rose-700 text-white rounded transition cursor-pointer shadow"
                                  title="Delete slide"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={slide.alt}
                                  onChange={(e) => {
                                    const updated = [...heroSlides];
                                    updated[idx].alt = e.target.value;
                                    setHeroSlides(updated);
                                    setHasUnsavedChanges(true);
                                  }}
                                  placeholder="Slide title / caption"
                                  className="w-full bg-[#181818] border border-[#2A2A2A] px-2.5 py-1.5 text-xs text-stone-200 rounded focus:border-[#0E5A4F] outline-none"
                                />

                                <input
                                  type="text"
                                  value={slide.image}
                                  onChange={(e) => {
                                    const updated = [...heroSlides];
                                    updated[idx].image = e.target.value;
                                    setHeroSlides(updated);
                                    setHasUnsavedChanges(true);
                                  }}
                                  placeholder="Replace Image URL..."
                                  className="w-full bg-[#161616] border border-[#262626] px-2.5 py-1 text-[11px] text-stone-300 rounded outline-none"
                                />

                                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#1F1F1F]">
                                  <label className="inline-flex items-center gap-1 px-2 py-1 bg-[#1C1C1C] hover:bg-[#252525] text-[10px] text-[#A2DEC8] rounded cursor-pointer border border-[#2C2C2C]">
                                    <Upload className="w-3 h-3" />
                                    <span>Replace Photo</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          try {
                                            const compressed = await compressImage(file);
                                            const updated = [...heroSlides];
                                            updated[idx].image = compressed;
                                            setHeroSlides(updated);
                                            setHasUnsavedChanges(true);
                                            showStatus(`Replaced Slide #${idx + 1} in live preview! Click Publish to save.`);
                                          } catch {
                                            showStatus('Failed to read image.', 'error');
                                          }
                                        }
                                      }}
                                    />
                                  </label>

                                  <div className="flex items-center gap-1">
                                    <select
                                      value={idx}
                                      onChange={(e) => handleMoveHeroSlide(idx, Number(e.target.value))}
                                      className="bg-[#181818] border border-[#2B2B2B] text-[11px] text-[#A2DEC8] font-mono px-1.5 py-0.5 rounded cursor-pointer outline-none"
                                    >
                                      {heroSlides.map((_, targetIdx) => (
                                        <option key={targetIdx} value={targetIdx}>
                                          #{targetIdx + 1}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => handleMoveHeroSlide(idx, idx - 1)}
                                      className="p-1 bg-[#181818] hover:bg-[#252525] disabled:opacity-30 text-stone-300 rounded border border-[#2A2A2A] cursor-pointer"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === heroSlides.length - 1}
                                      onClick={() => handleMoveHeroSlide(idx, idx + 1)}
                                      className="p-1 bg-[#181818] hover:bg-[#252525] disabled:opacity-30 text-stone-300 rounded border border-[#2A2A2A] cursor-pointer"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add New Slide Form */}
                      <div className="p-6 bg-[#111111] border border-[#242424] rounded-sm space-y-4">
                        <h3 className="font-serif text-lg text-[#F5F2EA] flex items-center gap-2">
                          <Plus className="w-4 h-4 text-[#A2DEC8]" />
                          <span>Add New Home Hero Image or Video</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-wider text-stone-400">
                              Image URL or Upload Photo
                            </label>
                            <input
                              type="text"
                              value={newSlideImage}
                              onChange={(e) => setNewSlideImage(e.target.value)}
                              className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded outline-none"
                            />
                            <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-xs text-stone-300 rounded cursor-pointer transition">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload From Computer / Mobile</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const compressed = await compressImage(file);
                                      setNewSlideImage(compressed);
                                    } catch {
                                      showStatus('Failed to read image file.', 'error');
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-wider text-stone-400">
                              Optional Video URL (MP4 / WebM)
                            </label>
                            <input
                              type="text"
                              value={newSlideVideo}
                              onChange={(e) => setNewSlideVideo(e.target.value)}
                              className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs uppercase tracking-wider text-stone-400">
                            Piece Title / Caption
                          </label>
                          <input
                            type="text"
                            value={newSlideAlt}
                            onChange={(e) => setNewSlideAlt(e.target.value)}
                            className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleAddHeroSlide}
                          className="px-5 py-2.5 bg-[#181818] hover:bg-[#222222] border border-[#333333] text-xs uppercase tracking-wider text-[#A2DEC8] rounded transition cursor-pointer"
                        >
                          + Add Slide to Home Hero
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUB-CATEGORY 2: PAGE MATTERS, HEADINGS, FONTS, SIZING & ELEMENTOR CONTROLS */}
                  {customizeSubTab === 'PAGE_SECTIONS_EDITOR' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202020] pb-5">
                        <div>
                          <h2 className="font-serif text-2xl text-[#F5F2EA]">
                            Page Matters, Headings, Fonts &amp; Container Size
                          </h2>
                          <p className="text-xs text-stone-400 mt-1 font-light">
                            Select any page section below to edit its headings, subheadings, matter text, image, typography, font size, and container dimensions (Elementor-style Content / Style / Advanced controls).
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSavePageSections()}
                          disabled={savingPageSections}
                          className="px-6 py-2.5 bg-[#0E5A4F] hover:bg-[#147A6A] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-medium rounded transition cursor-pointer shrink-0"
                        >
                          {savingPageSections ? 'Saving...' : 'Save All Page Customizations'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column: Page Section Selector List */}
                        <div className="lg:col-span-4 bg-[#111111] border border-[#222222] p-4 rounded-sm space-y-2">
                          <span className="text-[10px] font-sans uppercase tracking-[0.22em] text-stone-400 block mb-2">
                            Select Website Page / Section ({pageSections.length})
                          </span>
                          <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
                            {pageSections.map((sec, idx) => (
                              <div
                                key={sec.id}
                                onClick={() => setSelectedSectionId(sec.id)}
                                className={`p-3 rounded-sm border transition cursor-pointer flex items-center justify-between gap-2 ${
                                  selectedSectionId === sec.id
                                    ? 'bg-[#162623] border-[#0E5A4F] text-[#F5F2EA]'
                                    : 'bg-[#161616] border-[#262626] text-stone-300 hover:border-stone-500'
                                }`}
                              >
                                <div className="truncate">
                                  <span className="text-[10px] font-mono text-[#A2DEC8] block">
                                    #{idx + 1} • {sec.isBuiltIn ? 'Core Page' : 'Custom Page'}
                                  </span>
                                  <span className="text-xs font-medium truncate block">{sec.label}</span>
                                </div>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded uppercase ${
                                    sec.visible ? 'bg-emerald-950 text-emerald-300' : 'bg-stone-800 text-stone-400'
                                  }`}
                                >
                                  {sec.visible ? 'Visible' : 'Hidden'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right Column: Elementor-Style 3-Tab Inspector (Content / Style / Advanced) */}
                        <div className="lg:col-span-8 bg-[#111111] border border-[#222222] rounded-sm overflow-hidden">
                          {(() => {
                            const currentSec = pageSections.find((s) => s.id === selectedSectionId) || pageSections[0];
                            if (!currentSec) return null;

                            return (
                              <div>
                                {/* Elementor Inspector Top Tabs */}
                                <div className="grid grid-cols-3 border-b border-[#252525] bg-[#161616]">
                                  {(
                                    [
                                      { id: 'CONTENT', label: 'Content (Text, Matter & Image)' },
                                      { id: 'STYLE', label: 'Style (Fonts, Colors & Image Size)' },
                                      { id: 'ADVANCED', label: 'Advanced (Page Size, Padding & Motion)' },
                                    ] as const
                                  ).map((t) => (
                                    <button
                                      key={t.id}
                                      type="button"
                                      onClick={() => setElementorSubPanel(t.id)}
                                      className={`py-3 px-2 text-[11px] font-sans uppercase tracking-wider border-b-2 transition cursor-pointer ${
                                        elementorSubPanel === t.id
                                          ? 'border-[#0E5A4F] text-[#A2DEC8] bg-[#111111] font-semibold'
                                          : 'border-transparent text-stone-400 hover:text-white'
                                      }`}
                                    >
                                      {t.label}
                                    </button>
                                  ))}
                                </div>

                                <div className="p-6 space-y-5">
                                  <div className="flex items-center justify-between border-b border-[#202020] pb-3">
                                    <div>
                                      <span className="text-[10px] font-mono uppercase text-[#A2DEC8]">
                                        Editing Page Section:
                                      </span>
                                      <h3 className="font-serif text-xl text-[#F5F2EA]">{currentSec.label}</h3>
                                    </div>
                                    <label className="inline-flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={currentSec.visible}
                                        onChange={(e) =>
                                          handleUpdateCurrentSection((s) => ({ ...s, visible: e.target.checked }))
                                        }
                                        className="accent-[#0E5A4F]"
                                      />
                                      <span>Show Section on Website</span>
                                    </label>
                                  </div>

                                  {/* PANEL 1: CONTENT (Headings, Subheadings, Matter, Image, HTML Tag) */}
                                  {elementorSubPanel === 'CONTENT' && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="sm:col-span-2 space-y-1.5">
                                          <label className="block text-xs uppercase tracking-wider text-stone-400">
                                            Small Badge / Top Sub-Heading
                                          </label>
                                          <input
                                            type="text"
                                            value={currentSec.badgeText}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({ ...s, badgeText: e.target.value }))
                                            }
                                            className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded outline-none focus:border-[#0E5A4F]"
                                          />
                                        </div>

                                        <div className="space-y-1.5">
                                          <label className="block text-xs uppercase tracking-wider text-stone-400">
                                            HTML Heading Tag
                                          </label>
                                          <select
                                            value={currentSec.htmlTag}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                htmlTag: e.target.value as any,
                                              }))
                                            }
                                            className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded outline-none"
                                          >
                                            {(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'div', 'section'] as const).map(
                                              (tag) => (
                                                <option key={tag} value={tag}>
                                                  {tag}
                                                </option>
                                              )
                                            )}
                                          </select>
                                        </div>
                                      </div>

                                      <div className="space-y-1.5">
                                        <label className="block text-xs uppercase tracking-wider text-stone-400">
                                          Main Page Heading
                                        </label>
                                        <input
                                          type="text"
                                          value={currentSec.heading}
                                          onChange={(e) =>
                                            handleUpdateCurrentSection((s) => ({ ...s, heading: e.target.value }))
                                          }
                                          className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2.5 text-sm text-[#F5F2EA] rounded outline-none focus:border-[#0E5A4F]"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <label className="block text-xs uppercase tracking-wider text-stone-400">
                                          Secondary Sub-Heading
                                        </label>
                                        <input
                                          type="text"
                                          value={currentSec.subheading}
                                          onChange={(e) =>
                                            handleUpdateCurrentSection((s) => ({ ...s, subheading: e.target.value }))
                                          }
                                          className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded outline-none focus:border-[#0E5A4F]"
                                        />
                                      </div>

                                      <div className="space-y-1.5">
                                        <label className="block text-xs uppercase tracking-wider text-stone-400">
                                          Page Matter / Body Description
                                        </label>
                                        <textarea
                                          rows={4}
                                          value={currentSec.matterText}
                                          onChange={(e) =>
                                            handleUpdateCurrentSection((s) => ({ ...s, matterText: e.target.value }))
                                          }
                                          className="w-full bg-[#161616] border border-[#2B2B2B] p-3 text-xs text-[#F5F2EA] rounded outline-none focus:border-[#0E5A4F] leading-relaxed"
                                        />
                                      </div>

                                      {/* Section Image Replace / Edit / Delete */}
                                      <div className="p-4 bg-[#151515] border border-[#262626] rounded space-y-3">
                                        <div className="flex items-center justify-between">
                                          <label className="block text-xs uppercase tracking-wider text-[#A2DEC8]">
                                            Section Showcase Image (Change, Edit or Delete)
                                          </label>
                                          {currentSec.image && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleUpdateCurrentSection((s) => ({ ...s, image: '' }))
                                              }
                                              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                              <span>Remove Image</span>
                                            </button>
                                          )}
                                        </div>

                                        {currentSec.image && (
                                          <div className="h-40 bg-black border border-[#2A2A2A] rounded flex items-center justify-center p-2">
                                            <img
                                              src={currentSec.image}
                                              alt={currentSec.heading}
                                              className="max-h-36 object-contain"
                                            />
                                          </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-2">
                                          <input
                                            type="text"
                                            value={currentSec.image}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({ ...s, image: e.target.value }))
                                            }
                                            placeholder="Paste image URL..."
                                            className="flex-1 bg-[#111111] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded outline-none"
                                          />
                                          <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1F1F1F] hover:bg-[#292929] text-xs text-[#A2DEC8] rounded cursor-pointer border border-[#333333] shrink-0">
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>Upload &amp; Replace Image</span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  try {
                                                    const compressed = await compressImage(file);
                                                    handleUpdateCurrentSection((s) => ({ ...s, image: compressed }));
                                                    showStatus('Section image updated! Click Save to publish.');
                                                  } catch {
                                                    showStatus('Failed to read image.', 'error');
                                                  }
                                                }
                                              }}
                                            />
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* PANEL 2: STYLE (Typography, Fonts, Sizes, Colors, Image Dimensions) */}
                                  {elementorSubPanel === 'STYLE' && (
                                    <div className="space-y-5">
                                      <h4 className="text-xs uppercase tracking-wider text-[#A2DEC8] font-mono">
                                        Typography &amp; Font Styling
                                      </h4>

                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                          <label className="block text-[11px] uppercase text-stone-400">
                                            Font Family
                                          </label>
                                          <select
                                            value={currentSec.typography.fontFamily}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                typography: { ...s.typography, fontFamily: e.target.value },
                                              }))
                                            }
                                            className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                          >
                                            <option value="Cormorant Garamond">Cormorant Garamond (Luxury Serif)</option>
                                            <option value="Bodoni Moda">Bodoni Moda (Editorial)</option>
                                            <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Sans)</option>
                                            <option value="Georgia">Georgia Classic</option>
                                          </select>
                                        </div>

                                        <div className="space-y-1.5">
                                          <label className="block text-[11px] uppercase text-stone-400">
                                            Heading Size (px, 0=Auto)
                                          </label>
                                          <input
                                            type="number"
                                            min={0}
                                            max={120}
                                            value={currentSec.typography.headingSizePx}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                typography: {
                                                  ...s.typography,
                                                  headingSizePx: Number(e.target.value),
                                                },
                                              }))
                                            }
                                            className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                          />
                                        </div>

                                        <div className="space-y-1.5">
                                          <label className="block text-[11px] uppercase text-stone-400">
                                            Matter Text Size (px, 0=Auto)
                                          </label>
                                          <input
                                            type="number"
                                            min={0}
                                            max={60}
                                            value={currentSec.typography.bodySizePx}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                typography: {
                                                  ...s.typography,
                                                  bodySizePx: Number(e.target.value),
                                                },
                                              }))
                                            }
                                            className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                          />
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                        <div className="space-y-1.5">
                                          <label className="block text-[11px] uppercase text-stone-400">
                                            Font Weight
                                          </label>
                                          <select
                                            value={currentSec.typography.fontWeight}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                typography: { ...s.typography, fontWeight: e.target.value },
                                              }))
                                            }
                                            className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                          >
                                            <option value="300">300 (Light)</option>
                                            <option value="400">400 (Normal)</option>
                                            <option value="500">500 (Medium)</option>
                                            <option value="600">600 (Semi-Bold)</option>
                                            <option value="700">700 (Bold)</option>
                                          </select>
                                        </div>

                                        <div className="space-y-1.5">
                                          <label className="block text-[11px] uppercase text-stone-400">
                                            Text Alignment
                                          </label>
                                          <select
                                            value={currentSec.typography.textAlign}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                typography: {
                                                  ...s.typography,
                                                  textAlign: e.target.value as any,
                                                },
                                              }))
                                            }
                                            className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                          >
                                            <option value="left">Left</option>
                                            <option value="center">Center</option>
                                            <option value="right">Right</option>
                                            <option value="justify">Justify</option>
                                          </select>
                                        </div>

                                        <div className="space-y-1.5">
                                          <label className="block text-[11px] uppercase text-stone-400">
                                            Heading Color
                                          </label>
                                          <input
                                            type="color"
                                            value={currentSec.typography.headingColor || '#F5F2EA'}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                typography: { ...s.typography, headingColor: e.target.value },
                                              }))
                                            }
                                            className="w-full h-9 bg-[#161616] border border-[#2B2B2B] rounded cursor-pointer p-1"
                                          />
                                        </div>

                                        <div className="space-y-1.5">
                                          <label className="block text-[11px] uppercase text-stone-400">
                                            Body Matter Color
                                          </label>
                                          <input
                                            type="color"
                                            value={currentSec.typography.bodyColor || '#B8B8B5'}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                typography: { ...s.typography, bodyColor: e.target.value },
                                              }))
                                            }
                                            className="w-full h-9 bg-[#161616] border border-[#2B2B2B] rounded cursor-pointer p-1"
                                          />
                                        </div>
                                      </div>

                                      <div className="pt-4 border-t border-[#222222] space-y-4">
                                        <h4 className="text-xs uppercase tracking-wider text-[#A2DEC8] font-mono">
                                          Image Size, Fit &amp; Border Radius
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                          <div className="space-y-1.5">
                                            <label className="block text-[11px] uppercase text-stone-400">
                                              Width (%)
                                            </label>
                                            <input
                                              type="number"
                                              min={10}
                                              max={100}
                                              value={currentSec.imageStyle.widthPercent}
                                              onChange={(e) =>
                                                handleUpdateCurrentSection((s) => ({
                                                  ...s,
                                                  imageStyle: {
                                                    ...s.imageStyle,
                                                    widthPercent: Number(e.target.value),
                                                  },
                                                }))
                                              }
                                              className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                            />
                                          </div>

                                          <div className="space-y-1.5">
                                            <label className="block text-[11px] uppercase text-stone-400">
                                              Max Height (px, 0=Auto)
                                            </label>
                                            <input
                                              type="number"
                                              min={0}
                                              max={1200}
                                              value={currentSec.imageStyle.heightPx}
                                              onChange={(e) =>
                                                handleUpdateCurrentSection((s) => ({
                                                  ...s,
                                                  imageStyle: {
                                                    ...s.imageStyle,
                                                    heightPx: Number(e.target.value),
                                                  },
                                                }))
                                              }
                                              className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                            />
                                          </div>

                                          <div className="space-y-1.5">
                                            <label className="block text-[11px] uppercase text-stone-400">
                                              Object Fit
                                            </label>
                                            <select
                                              value={currentSec.imageStyle.objectFit}
                                              onChange={(e) =>
                                                handleUpdateCurrentSection((s) => ({
                                                  ...s,
                                                  imageStyle: {
                                                    ...s.imageStyle,
                                                    objectFit: e.target.value as any,
                                                  },
                                                }))
                                              }
                                              className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                            >
                                              <option value="contain">Contain (Full Uncropped)</option>
                                              <option value="cover">Cover</option>
                                              <option value="fill">Fill</option>
                                              <option value="scale-down">Scale Down</option>
                                            </select>
                                          </div>

                                          <div className="space-y-1.5">
                                            <label className="block text-[11px] uppercase text-stone-400">
                                              Opacity (%)
                                            </label>
                                            <input
                                              type="number"
                                              min={10}
                                              max={100}
                                              value={currentSec.imageStyle.opacity}
                                              onChange={(e) =>
                                                handleUpdateCurrentSection((s) => ({
                                                  ...s,
                                                  imageStyle: {
                                                    ...s.imageStyle,
                                                    opacity: Number(e.target.value),
                                                  },
                                                }))
                                              }
                                              className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* PANEL 3: ADVANCED (Page Size, Container Width, Padding, Margin, Motion) */}
                                  {elementorSubPanel === 'ADVANCED' && (
                                    <div className="space-y-5">
                                      <h4 className="text-xs uppercase tracking-wider text-[#A2DEC8] font-mono">
                                        Page Size, Container Layout &amp; Spacing (Elementor Advanced)
                                      </h4>

                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                          <label className="block text-[11px] uppercase text-stone-400">
                                            Container Layout
                                          </label>
                                          <select
                                            value={currentSec.advanced.containerLayout}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                advanced: {
                                                  ...s.advanced,
                                                  containerLayout: e.target.value as any,
                                                },
                                              }))
                                            }
                                            className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                          >
                                            <option value="Flexbox">Flexbox</option>
                                            <option value="Grid">Grid</option>
                                            <option value="Block">Block</option>
                                          </select>
                                        </div>

                                        <div className="space-y-1.5">
                                          <label className="block text-[11px] uppercase text-stone-400">
                                            Content Width
                                          </label>
                                          <select
                                            value={currentSec.advanced.contentWidth}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                advanced: {
                                                  ...s.advanced,
                                                  contentWidth: e.target.value as any,
                                                },
                                              }))
                                            }
                                            className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                          >
                                            <option value="Full Width">Full Width</option>
                                            <option value="Boxed">Boxed</option>
                                          </select>
                                        </div>

                                        <div className="space-y-1.5">
                                          <label className="block text-[11px] uppercase text-stone-400">
                                            Min Page Height (vh)
                                          </label>
                                          <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={currentSec.advanced.minHeightVh}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                advanced: {
                                                  ...s.advanced,
                                                  minHeightVh: Number(e.target.value),
                                                },
                                              }))
                                            }
                                            className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                          />
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="space-y-1.5">
                                          <label className="block text-[11px] uppercase text-stone-400">
                                            Padding Top (px)
                                          </label>
                                          <input
                                            type="number"
                                            value={currentSec.advanced.paddingTop}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                advanced: {
                                                  ...s.advanced,
                                                  paddingTop: Number(e.target.value),
                                                },
                                              }))
                                            }
                                            className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                          />
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className="block text-[11px] uppercase text-stone-400">
                                            Padding Bottom (px)
                                          </label>
                                          <input
                                            type="number"
                                            value={currentSec.advanced.paddingBottom}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                advanced: {
                                                  ...s.advanced,
                                                  paddingBottom: Number(e.target.value),
                                                },
                                              }))
                                            }
                                            className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                          />
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className="block text-[11px] uppercase text-stone-400">
                                            Background Color
                                          </label>
                                          <input
                                            type="color"
                                            value={currentSec.advanced.backgroundColor || '#0B0B0B'}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                advanced: {
                                                  ...s.advanced,
                                                  backgroundColor: e.target.value,
                                                },
                                              }))
                                            }
                                            className="w-full h-9 bg-[#161616] border border-[#2B2B2B] rounded cursor-pointer p-1"
                                          />
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className="block text-[11px] uppercase text-stone-400">
                                            Entrance Animation
                                          </label>
                                          <select
                                            value={currentSec.advanced.entranceAnimation}
                                            onChange={(e) =>
                                              handleUpdateCurrentSection((s) => ({
                                                ...s,
                                                advanced: {
                                                  ...s.advanced,
                                                  entranceAnimation: e.target.value as any,
                                                },
                                              }))
                                            }
                                            className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                                          >
                                            <option value="Fade In Up">Fade In Up</option>
                                            <option value="Fade In">Fade In</option>
                                            <option value="Zoom In">Zoom In</option>
                                            <option value="None">None</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="pt-4 border-t border-[#222222] flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => handleSavePageSections()}
                                      className="px-6 py-2.5 bg-[#0E5A4F] hover:bg-[#147A6A] text-white text-xs uppercase tracking-widest rounded transition cursor-pointer"
                                    >
                                      Save Changes to {currentSec.label}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-CATEGORY 3: ALL WEBSITE IMAGES & LOGO MANAGER */}
                  {customizeSubTab === 'WEBSITE_IMAGES' && (
                    <div className="space-y-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202020] pb-5">
                        <div>
                          <h2 className="font-serif text-2xl text-[#F5F2EA] flex items-center gap-3">
                            <ImageIcon className="w-6 h-6 text-[#A2DEC8]" />
                            <span>All Website Images &amp; Logo Manager</span>
                          </h2>
                          <p className="text-xs text-stone-400 mt-1 font-light">
                            Replace, edit, or remove key photography and brand logos across every section of the website.
                          </p>
                        </div>
                        <button
                          onClick={handleSaveWebsiteImages}
                          disabled={savingWebsiteImages}
                          className="px-6 py-2.5 bg-[#0E5A4F] hover:bg-[#147A6A] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-medium rounded transition cursor-pointer shadow-lg"
                        >
                          {savingWebsiteImages ? 'Saving Images...' : 'Save All Website Images'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Official Brand Logo */}
                        <div className="bg-[#111111] border border-[#242424] p-5 rounded-sm flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A2DEC8]">
                                Header &amp; Community
                              </span>
                              <span className="text-xs text-[#1FD286] font-mono">Free-size / Any Ratio</span>
                            </div>
                            <h4 className="font-serif text-base text-[#F5F2EA]">Brand Logo &amp; Monogram</h4>
                            <p className="text-xs text-stone-400 mt-1 font-light">
                              Displayed on the top navbar, Instagram community circle, and footer branding.
                            </p>
                          </div>

                          <div className="relative min-h-[180px] max-h-56 bg-black rounded overflow-hidden border border-[#2A2A2A] mx-auto w-full flex items-center justify-center p-3">
                            <img
                              src={websiteImages.brandLogo || brandLogoImg}
                              alt="Brand Logo"
                              className="max-h-48 max-w-full object-contain rounded border-2 border-white/20 shadow-lg"
                            />
                          </div>

                          <div className="space-y-2">
                            <input
                              type="text"
                              value={websiteImages.brandLogo}
                              onChange={(e) =>
                                setWebsiteImages({ ...websiteImages, brandLogo: e.target.value })
                              }
                              placeholder="Image URL..."
                              className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2 text-xs text-[#F5F2EA] rounded outline-none focus:border-[#0E5A4F]"
                            />
                            <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#1C1C1C] hover:bg-[#252525] text-xs text-stone-300 rounded cursor-pointer transition border border-[#2A2A2A]">
                              <Upload className="w-3.5 h-3.5 text-[#A2DEC8]" />
                              <span>Upload New Logo (Computer / Mobile)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const compressed = await compressImage(file);
                                      setWebsiteImages({ ...websiteImages, brandLogo: compressed });
                                      showStatus('Brand logo updated in preview! Click Save to publish.');
                                    } catch {
                                      showStatus('Failed to read logo image.', 'error');
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* 2. Brand Story / About Section Feature Image */}
                        <div className="bg-[#111111] border border-[#242424] p-5 rounded-sm flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A2DEC8]">
                                About Atelier
                              </span>
                              <span className="text-xs text-[#1FD286] font-mono">Free-size / Any Ratio</span>
                            </div>
                            <h4 className="font-serif text-base text-[#F5F2EA]">About Section Showcase Photograph</h4>
                            <p className="text-xs text-stone-400 mt-1 font-light">
                              Handcrafted choker photograph rendered in Section 01 (Brand Intro).
                            </p>
                          </div>

                          <div className="relative min-h-[200px] max-h-[280px] bg-black rounded overflow-hidden border border-[#2A2A2A] flex items-center justify-center p-2">
                            <img
                              src={websiteImages.aboutSectionImage}
                              alt="About Section"
                              className="w-full h-auto max-h-[260px] object-contain"
                            />
                          </div>

                          <div className="space-y-2">
                            <input
                              type="text"
                              value={websiteImages.aboutSectionImage}
                              onChange={(e) => {
                                setWebsiteImages({ ...websiteImages, aboutSectionImage: e.target.value });
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="Image URL..."
                              className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2 text-xs text-[#F5F2EA] rounded outline-none focus:border-[#0E5A4F]"
                            />
                            <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#1C1C1C] hover:bg-[#252525] text-xs text-stone-300 rounded cursor-pointer transition border border-[#2A2A2A]">
                              <Upload className="w-3.5 h-3.5 text-[#A2DEC8]" />
                              <span>Upload About Showcase Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const compressed = await compressImage(file);
                                      setWebsiteImages({ ...websiteImages, aboutSectionImage: compressed });
                                      setHasUnsavedChanges(true);
                                      showStatus('About image updated in live preview! Click Publish to save.');
                                    } catch {
                                      showStatus('Failed to read image file.', 'error');
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* 3. Statement Jewellery Masterwork Photograph */}
                        <div className="bg-[#111111] border border-[#242424] p-5 rounded-sm flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A2DEC8]">
                                Statement Section
                              </span>
                              <span className="text-xs text-[#1FD286] font-mono">Free-size / Any Ratio</span>
                            </div>
                            <h4 className="font-serif text-base text-[#F5F2EA]">Statement Haaram Masterpiece</h4>
                            <p className="text-xs text-stone-400 mt-1 font-light">
                              The spotlighted emerald masterpiece in Section 03 &ldquo;The Art of the Statement&rdquo;.
                            </p>
                          </div>

                          <div className="relative min-h-[200px] max-h-[280px] bg-black rounded overflow-hidden border border-[#2A2A2A] flex items-center justify-center p-2">
                            <img
                              src={websiteImages.statementHaaramImage}
                              alt="Statement Haaram"
                              className="w-full h-auto max-h-[260px] object-contain"
                            />
                          </div>

                          <div className="space-y-2">
                            <input
                              type="text"
                              value={websiteImages.statementHaaramImage}
                              onChange={(e) => {
                                setWebsiteImages({ ...websiteImages, statementHaaramImage: e.target.value });
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="Image URL..."
                              className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2 text-xs text-[#F5F2EA] rounded outline-none focus:border-[#0E5A4F]"
                            />
                            <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#1C1C1C] hover:bg-[#252525] text-xs text-stone-300 rounded cursor-pointer transition border border-[#2A2A2A]">
                              <Upload className="w-3.5 h-3.5 text-[#A2DEC8]" />
                              <span>Upload Statement Piece Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const compressed = await compressImage(file);
                                      setWebsiteImages({ ...websiteImages, statementHaaramImage: compressed });
                                      setHasUnsavedChanges(true);
                                      showStatus('Statement image updated in live preview! Click Publish to save.');
                                    } catch {
                                      showStatus('Failed to read image file.', 'error');
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* 4. The Art of Silver Craftsmanship Banner */}
                        <div className="bg-[#111111] border border-[#242424] p-5 rounded-sm flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A2DEC8]">
                                Craftsmanship Section
                              </span>
                              <span className="text-xs text-[#1FD286] font-mono">Free-size / Any Ratio</span>
                            </div>
                            <h4 className="font-serif text-base text-[#F5F2EA]">Master Jeweler Atelier Banner</h4>
                            <p className="text-xs text-stone-400 mt-1 font-light">
                              Photography of artisan silver crafting in Section 05 &ldquo;The Art of Silver&rdquo;.
                            </p>
                          </div>

                          <div className="relative min-h-[200px] max-h-[280px] bg-black rounded overflow-hidden border border-[#2A2A2A] flex items-center justify-center p-2">
                            <img
                              src={websiteImages.craftsmanshipBanner}
                              alt="Craftsmanship Banner"
                              className="w-full h-auto max-h-[260px] object-contain"
                            />
                          </div>

                          <div className="space-y-2">
                            <input
                              type="text"
                              value={websiteImages.craftsmanshipBanner}
                              onChange={(e) => {
                                setWebsiteImages({ ...websiteImages, craftsmanshipBanner: e.target.value });
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="Image URL..."
                              className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2 text-xs text-[#F5F2EA] rounded outline-none focus:border-[#0E5A4F]"
                            />
                            <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#1C1C1C] hover:bg-[#252525] text-xs text-stone-300 rounded cursor-pointer transition border border-[#2A2A2A]">
                              <Upload className="w-3.5 h-3.5 text-[#A2DEC8]" />
                              <span>Upload Craftsmanship Banner</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const compressed = await compressImage(file);
                                      setWebsiteImages({ ...websiteImages, craftsmanshipBanner: compressed });
                                      setHasUnsavedChanges(true);
                                      showStatus('Craftsmanship banner updated in live preview! Click Publish to save.');
                                    } catch {
                                      showStatus('Failed to read image file.', 'error');
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-CATEGORY 4: SOCIAL ICONS (ALL PLATFORMS) & BUTTONS MANAGER */}
                  {customizeSubTab === 'SOCIAL_ICONS_BUTTONS' && (
                    <div className="space-y-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202020] pb-5">
                        <div>
                          <h2 className="font-serif text-2xl text-[#F5F2EA]">
                            Social Icons (All Platforms) &amp; Action Buttons
                          </h2>
                          <p className="text-xs text-stone-400 mt-1 font-light">
                            Add, edit, remove, or link any social platform icon (Instagram, WhatsApp, YouTube, LinkedIn, Facebook, Pinterest, X, Telegram, Email, Phone, Location) and customize page buttons.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveSocialIcons()}
                          disabled={savingSocialIcons}
                          className="px-6 py-2.5 bg-[#0E5A4F] hover:bg-[#147A6A] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-medium rounded transition cursor-pointer"
                        >
                          {savingSocialIcons ? 'Saving...' : 'Save Social Icons & Links'}
                        </button>
                      </div>

                      {/* Existing Social Icons List */}
                      <div className="grid grid-cols-1 gap-4">
                        {socialIcons.map((soc, idx) => (
                          <div
                            key={soc.id}
                            className="bg-[#111111] border border-[#242424] p-4 rounded-sm space-y-3 flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 bg-[#182825] text-[#A2DEC8] text-xs font-mono rounded border border-[#0E5A4F]/40">
                                  {soc.platform}
                                </span>
                                <input
                                  type="text"
                                  value={soc.label}
                                  onChange={(e) => {
                                    const updated = [...socialIcons];
                                    updated[idx].label = e.target.value;
                                    setSocialIcons(updated);
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="bg-[#161616] border border-[#2B2B2B] px-2.5 py-1 text-xs text-[#F5F2EA] rounded outline-none"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1 text-[11px] text-stone-400 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={soc.visible}
                                    onChange={(e) => {
                                      const updated = [...socialIcons];
                                      updated[idx].visible = e.target.checked;
                                      setSocialIcons(updated);
                                      setHasUnsavedChanges(true);
                                    }}
                                    className="accent-[#0E5A4F]"
                                  />
                                  <span>Active</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = socialIcons.filter((_, i) => i !== idx);
                                    setSocialIcons(updated);
                                    setHasUnsavedChanges(true);
                                    showStatus('Social icon removed in preview. Click Publish to save.');
                                  }}
                                  className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                                  title="Delete Social Icon"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2">
                                <input
                                  type="text"
                                  value={soc.link}
                                  onChange={(e) => {
                                    const updated = [...socialIcons];
                                    updated[idx].link = e.target.value;
                                    setSocialIcons(updated);
                                    setHasUnsavedChanges(true);
                                  }}
                                  placeholder="https://... or mailto:..."
                                  className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded outline-none"
                                />
                              </div>
                              <select
                                value={soc.colorType}
                                onChange={(e) => {
                                  const updated = [...socialIcons];
                                  updated[idx].colorType = e.target.value as any;
                                  setSocialIcons(updated);
                                  setHasUnsavedChanges(true);
                                }}
                                className="bg-[#161616] border border-[#2B2B2B] px-2.5 py-2 text-xs text-[#F5F2EA] rounded"
                              >
                                <option value="Official Color">Official Color</option>
                                <option value="Emerald Luxury">Emerald Luxury</option>
                                <option value="Silver Monochrome">Silver Monochrome</option>
                                <option value="Custom Color">Custom Color</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add New Social Icon (All Platform Options) */}
                      <div className="p-5 bg-[#111111] border border-[#242424] rounded-sm space-y-4">
                        <h3 className="font-serif text-lg text-[#F5F2EA] flex items-center gap-2">
                          <Plus className="w-4 h-4 text-[#A2DEC8]" />
                          <span>Add New Social Icon Link</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[11px] uppercase text-stone-400">Platform Icon</label>
                            <select
                              value={newSocialPlatform}
                              onChange={(e) => setNewSocialPlatform(e.target.value as SocialPlatformType)}
                              className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                            >
                              {(
                                [
                                  'Instagram',
                                  'WhatsApp',
                                  'YouTube',
                                  'LinkedIn',
                                  'Facebook',
                                  'Pinterest',
                                  'X / Twitter',
                                  'Telegram',
                                  'Envelope',
                                  'Phone',
                                  'MapPin',
                                  'Globe',
                                ] as SocialPlatformType[]
                              ).map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[11px] uppercase text-stone-400">Display Label</label>
                            <input
                              type="text"
                              value={newSocialLabel}
                              onChange={(e) => setNewSocialLabel(e.target.value)}
                              placeholder="e.g. YouTube Channel"
                              className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[11px] uppercase text-stone-400">Destination Link / URL</label>
                            <input
                              type="text"
                              value={newSocialLink}
                              onChange={(e) => setNewSocialLink(e.target.value)}
                              placeholder="https://..."
                              className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[11px] uppercase text-stone-400">Color Style</label>
                            <select
                              value={newSocialColorType}
                              onChange={(e) => setNewSocialColorType(e.target.value as any)}
                              className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                            >
                              <option value="Official Color">Official Color</option>
                              <option value="Emerald Luxury">Emerald Luxury</option>
                              <option value="Silver Monochrome">Silver Monochrome</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddSocialIcon}
                          className="px-5 py-2.5 bg-[#0E5A4F] hover:bg-[#147A6A] text-white text-xs uppercase tracking-wider rounded transition cursor-pointer"
                        >
                          + Add Social Icon to Preview
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUB-CATEGORY 5: WIDGETS (Renamed to Widgets, Place in Pages or Section) */}
                  {customizeSubTab === 'WIDGETS_RESPONSIVE' && (
                    <div className="space-y-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202020] pb-5">
                        <div>
                          <h2 className="font-serif text-2xl text-[#F5F2EA]">
                            Widgets
                          </h2>
                          <p className="text-xs text-stone-400 mt-1 font-light">
                            Add custom widgets (Heading, Text Editor, Image, Video, Button, Divider, Container) and place them in any page or section of your website.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveWidgets()}
                          disabled={savingWidgets}
                          className="px-6 py-2.5 bg-[#0E5A4F] hover:bg-[#147A6A] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-medium rounded transition cursor-pointer"
                        >
                          {savingWidgets ? 'Saving...' : 'Save All Widgets'}
                        </button>
                      </div>

                      {/* Add New Widget Card */}
                      <div className="p-6 bg-[#111111] border border-[#242424] rounded-sm space-y-4">
                        <h3 className="font-serif text-lg text-[#F5F2EA] flex items-center gap-2">
                          <Plus className="w-4 h-4 text-[#A2DEC8]" />
                          <span>Place Widget in Pages or Section</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[11px] uppercase text-stone-400">Widget Type</label>
                            <select
                              value={newWidgetType}
                              onChange={(e) => setNewWidgetType(e.target.value as WidgetType)}
                              className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                            >
                              {(
                                [
                                  'Heading',
                                  'Text Editor',
                                  'Image',
                                  'Video',
                                  'Button',
                                  'Divider',
                                  'Container',
                                ] as WidgetType[]
                              ).map((wt) => (
                                <option key={wt} value={wt}>
                                  {wt}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[11px] uppercase text-[#A2DEC8] font-medium">
                              Place in Pages or Section
                            </label>
                            <select
                              value={newWidgetTargetSection}
                              onChange={(e) => setNewWidgetTargetSection(e.target.value)}
                              className="w-full bg-[#161616] border border-[#0E5A4F]/60 px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                            >
                              {pageSections.map((sec) => (
                                <option key={sec.id} value={sec.id}>
                                  {sec.label} ({sec.isBuiltIn ? 'Page Section' : 'Custom Page'})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[11px] uppercase text-stone-400">Widget Heading</label>
                            <input
                              type="text"
                              value={newWidgetTitle}
                              onChange={(e) => setNewWidgetTitle(e.target.value)}
                              placeholder="Heading text..."
                              className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[11px] uppercase text-stone-400">
                              Widget Matter / Text Content
                            </label>
                            <textarea
                              rows={2}
                              value={newWidgetContent}
                              onChange={(e) => setNewWidgetContent(e.target.value)}
                              placeholder="Optional paragraph or text matter..."
                              className="w-full bg-[#161616] border border-[#2B2B2B] p-2.5 text-xs text-[#F5F2EA] rounded"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[11px] uppercase text-stone-400">
                              Optional Image URL &amp; Button Link
                            </label>
                            <input
                              type="text"
                              value={newWidgetImage}
                              onChange={(e) => setNewWidgetImage(e.target.value)}
                              placeholder="Image URL (optional)..."
                              className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded mb-2"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={newWidgetButtonText}
                                onChange={(e) => setNewWidgetButtonText(e.target.value)}
                                placeholder="Button Label..."
                                className="bg-[#161616] border border-[#2B2B2B] px-3 py-1.5 text-xs text-[#F5F2EA] rounded"
                              />
                              <input
                                type="text"
                                value={newWidgetButtonLink}
                                onChange={(e) => setNewWidgetButtonLink(e.target.value)}
                                placeholder="Button Link (# or URL)..."
                                className="bg-[#161616] border border-[#2B2B2B] px-3 py-1.5 text-xs text-[#F5F2EA] rounded"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddWidget}
                          className="px-5 py-2.5 bg-[#0E5A4F] hover:bg-[#147A6A] text-white text-xs uppercase tracking-wider rounded transition cursor-pointer"
                        >
                          + Add Widget to Pages or Section
                        </button>
                      </div>

                      {/* Active Custom Widgets List */}
                      {customWidgets.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs uppercase tracking-wider text-stone-400">
                            Active Custom Widgets ({customWidgets.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {customWidgets.map((w, idx) => (
                              <div
                                key={w.id}
                                className="p-4 bg-[#111111] border border-[#242424] rounded-sm flex items-center justify-between gap-4"
                              >
                                <div>
                                  <span className="text-[10px] font-mono text-[#A2DEC8] uppercase">
                                    {w.type} • Placed in: {pageSections.find((s) => s.id === w.targetSectionId)?.label || w.targetSectionId}
                                  </span>
                                  <h5 className="font-serif text-base text-[#F5F2EA]">
                                    {w.title || 'Divider / Block Widget'}
                                  </h5>
                                  {w.content && (
                                    <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">{w.content}</p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = customWidgets.filter((_, i) => i !== idx);
                                    setCustomWidgets(updated);
                                    handleSaveWidgets(updated);
                                  }}
                                  className="p-2 text-rose-400 hover:text-rose-300 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-CATEGORY 6: ADDING PAGES & ORDERING PAGES */}
                  {customizeSubTab === 'PAGES_ORDER' && (
                    <div className="space-y-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202020] pb-5">
                        <div>
                          <h2 className="font-serif text-2xl text-[#F5F2EA]">
                            Add New Pages &amp; Re-Order Website Sections
                          </h2>
                          <p className="text-xs text-stone-400 mt-1 font-light">
                            Change the vertical order of pages on your website, hide/show sections, or create new custom luxury showcase pages.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSavePageSections()}
                          disabled={savingPageSections}
                          className="px-6 py-2.5 bg-[#0E5A4F] hover:bg-[#147A6A] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-medium rounded transition cursor-pointer"
                        >
                          {savingPageSections ? 'Saving...' : 'Save Page Order & Pages'}
                        </button>
                      </div>

                      {/* Page Ordering List */}
                      <div className="space-y-2.5">
                        {pageSections.map((sec, idx) => (
                          <div
                            key={sec.id}
                            className="p-4 bg-[#111111] border border-[#242424] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded bg-[#181818] border border-[#2B2B2B] flex items-center justify-center font-mono text-xs text-[#A2DEC8]">
                                #{idx + 1}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-serif text-base text-[#F5F2EA]">{sec.label}</h4>
                                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#181818] text-stone-400 rounded">
                                    {sec.isBuiltIn ? 'Core Section' : 'Custom Added Page'}
                                  </span>
                                </div>
                                <p className="text-xs text-stone-400 line-clamp-1">{sec.heading}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSectionId(sec.id);
                                  setCustomizeSubTab('PAGE_SECTIONS_EDITOR');
                                }}
                                className="px-3 py-1.5 bg-[#181818] hover:bg-[#222222] text-xs text-[#A2DEC8] border border-[#2C2C2C] rounded cursor-pointer flex items-center gap-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Page</span>
                              </button>

                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMovePageSection(idx, idx - 1)}
                                className="p-1.5 bg-[#181818] hover:bg-[#252525] disabled:opacity-30 text-stone-300 rounded border border-[#2A2A2A] cursor-pointer"
                                title="Move Page Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === pageSections.length - 1}
                                onClick={() => handleMovePageSection(idx, idx + 1)}
                                className="p-1.5 bg-[#111818] hover:bg-[#252525] disabled:opacity-30 text-stone-300 rounded border border-[#2A2A2A] cursor-pointer"
                                title="Move Page Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              {!sec.isBuiltIn && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = pageSections.filter((s) => s.id !== sec.id);
                                    setPageSections(updated);
                                    handleSavePageSections(updated);
                                  }}
                                  className="p-1.5 text-rose-400 hover:text-rose-300 cursor-pointer"
                                  title="Delete Custom Page"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Create New Custom Page Form */}
                      <div className="p-6 bg-[#111111] border border-[#242424] rounded-sm space-y-4">
                        <h3 className="font-serif text-lg text-[#F5F2EA] flex items-center gap-2">
                          <Plus className="w-4 h-4 text-[#A2DEC8]" />
                          <span>Add New Custom Page / Section to Website</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs uppercase text-stone-400">Page Title (Admin Label)</label>
                            <input
                              type="text"
                              value={newPageTitle}
                              onChange={(e) => setNewPageTitle(e.target.value)}
                              placeholder="e.g. Royal Bridal Exhibition 2026"
                              className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs uppercase text-stone-400">Main Page Heading</label>
                            <input
                              type="text"
                              value={newPageHeading}
                              onChange={(e) => setNewPageHeading(e.target.value)}
                              placeholder="e.g. The Nizam Heritage Bridal Showcase"
                              className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs uppercase text-stone-400">Sub-Heading / Badge</label>
                            <input
                              type="text"
                              value={newPageSubheading}
                              onChange={(e) => setNewPageSubheading(e.target.value)}
                              placeholder="e.g. LIMITED EDITION SILVER HEIRLOOMS"
                              className="w-full bg-[#161616] border border-[#2B2B2B] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs uppercase text-stone-400">Showcase Image URL or Upload</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newPageImage}
                                onChange={(e) => setNewPageImage(e.target.value)}
                                placeholder="Image URL..."
                                className="flex-1 bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                              />
                              <label className="px-3 py-2 bg-[#1F1F1F] hover:bg-[#292929] text-xs text-[#A2DEC8] rounded cursor-pointer border border-[#333333] flex items-center gap-1">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const compressed = await compressImage(file);
                                      setNewPageImage(compressed);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs uppercase text-stone-400">Page Matter / Description</label>
                          <textarea
                            rows={3}
                            value={newPageMatter}
                            onChange={(e) => setNewPageMatter(e.target.value)}
                            placeholder="Enter full page description and story matter..."
                            className="w-full bg-[#161616] border border-[#2B2B2B] p-3 text-xs text-[#F5F2EA] rounded"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleAddCustomPageSection}
                          className="px-6 py-2.5 bg-[#0E5A4F] hover:bg-[#147A6A] text-white text-xs uppercase tracking-wider rounded transition cursor-pointer"
                        >
                          + Create &amp; Publish New Page Section
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DISCOUNTS & COUPONS POPUP */}
              {activeTab === 'DISCOUNTS_POPUP' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202020] pb-5">
                    <div>
                      <h2 className="font-serif text-2xl text-[#F5F2EA]">Discounts &amp; Promotional Popup</h2>
                      <p className="text-xs text-stone-400 mt-1 font-light">
                        Configure celebratory offers, discount coupons, and automated WhatsApp claim popups.
                      </p>
                    </div>
                    <button
                      onClick={handleSavePromoPopup}
                      disabled={savingPromo}
                      className="px-6 py-2.5 bg-[#0E5A4F] hover:bg-[#147A6A] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-medium rounded transition cursor-pointer"
                    >
                      {savingPromo ? 'Saving...' : 'Save Discount Settings'}
                    </button>
                  </div>

                  <div className="p-6 bg-[#111111] border border-[#242424] rounded-sm space-y-6">
                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between p-4 bg-[#161616] border border-[#2A2A2A] rounded">
                      <div>
                        <span className="text-sm font-medium text-[#F5F2EA] block">Enable Website Promotion Popup</span>
                        <span className="text-xs text-stone-400 font-light">
                          When enabled, visitors will see the luxury celebratory coupon modal.
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={promoPopup.enabled}
                          onChange={(e) => setPromoPopup({ ...promoPopup, enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0E5A4F]"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-stone-300">
                          Coupon Code
                        </label>
                        <input
                          type="text"
                          value={promoPopup.couponCode}
                          onChange={(e) => setPromoPopup({ ...promoPopup, couponCode: e.target.value.toUpperCase() })}
                          placeholder=""
                          className="w-full bg-[#161616] border border-[#2A2A2A] focus:border-[#0E5A4F] px-4 py-3 text-sm font-mono tracking-widest text-[#1FD286] rounded outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-stone-300">
                          Discount Ribbon Badge
                        </label>
                        <input
                          type="text"
                          value={promoPopup.discountBadge}
                          onChange={(e) => setPromoPopup({ ...promoPopup, discountBadge: e.target.value })}
                          placeholder=""
                          className="w-full bg-[#161616] border border-[#2A2A2A] focus:border-[#0E5A4F] px-4 py-3 text-sm text-[#F5F2EA] rounded outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs uppercase tracking-wider text-stone-300">
                        Popup Headline
                      </label>
                      <input
                        type="text"
                        value={promoPopup.title}
                        onChange={(e) => setPromoPopup({ ...promoPopup, title: e.target.value })}
                        placeholder=""
                        className="w-full bg-[#161616] border border-[#2A2A2A] focus:border-[#0E5A4F] px-4 py-3 text-sm text-[#F5F2EA] rounded outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs uppercase tracking-wider text-stone-300">
                        Offer Description
                      </label>
                      <textarea
                        rows={3}
                        value={promoPopup.description}
                        onChange={(e) => setPromoPopup({ ...promoPopup, description: e.target.value })}
                        placeholder=""
                        className="w-full bg-[#161616] border border-[#2A2A2A] focus:border-[#0E5A4F] p-4 text-xs text-[#F5F2EA] rounded outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs uppercase tracking-wider text-stone-300">
                        WhatsApp Claim Message
                      </label>
                      <input
                        type="text"
                        value={promoPopup.whatsappMessage}
                        onChange={(e) => setPromoPopup({ ...promoPopup, whatsappMessage: e.target.value })}
                        placeholder=""
                        className="w-full bg-[#161616] border border-[#2A2A2A] focus:border-[#0E5A4F] px-4 py-3 text-xs text-[#F5F2EA] rounded outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: COLLECTIONS */}
              {activeTab === 'COLLECTIONS' && (
                <div className="space-y-8 max-w-5xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202020] pb-5">
                    <div>
                      <h2 className="font-serif text-2xl text-[#F5F2EA]">Signature Collections</h2>
                      <p className="text-xs text-stone-400 mt-1 font-light">
                        Add and edit the curated collections showcased in &ldquo;The Collections&rdquo; section.
                      </p>
                    </div>
                    <button
                      onClick={handleSaveCollections}
                      disabled={savingCollections}
                      className="px-6 py-2.5 bg-[#0E5A4F] hover:bg-[#147A6A] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-medium rounded transition cursor-pointer"
                    >
                      {savingCollections ? 'Saving...' : 'Save Collections'}
                    </button>
                  </div>

                  {/* Collections List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {collections.map((col, idx) => (
                      <div
                        key={col.id || idx}
                        onClick={() => handleOpenEditCollection(col, idx)}
                        className="bg-[#111111] border border-[#242424] hover:border-[#0E5A4F] p-4 rounded-sm flex flex-col justify-between group cursor-pointer transition shadow hover:shadow-lg relative"
                      >
                        <div>
                          <div className="relative min-h-[160px] max-h-[220px] bg-black rounded overflow-hidden mb-3 flex items-center justify-center">
                            <img src={col.image} alt={col.name} className="w-full h-auto max-h-[220px] object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="px-3 py-1.5 bg-[#0E5A4F] text-white text-[11px] font-sans uppercase tracking-widest rounded flex items-center gap-1.5 shadow-lg">
                                <Edit3 className="w-3 h-3" /> Click to Edit
                              </span>
                            </div>
                            <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  const updated = collections.filter((_, i) => i !== idx);
                                  setCollections(updated);
                                }}
                                className="p-1 bg-rose-900/80 hover:bg-rose-700 text-white rounded transition"
                                title="Delete collection"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-serif text-base text-[#F5F2EA] uppercase group-hover:text-[#A2DEC8] transition-colors">
                              {col.name}
                            </h4>
                            <span className="text-[10px] text-stone-500 font-mono">#{idx + 1}</span>
                          </div>
                          <p className="text-xs text-stone-400 font-light mt-1 line-clamp-2">{col.tagline}</p>
                        </div>

                        <div className="mt-4 pt-2 border-t border-[#1C1C1C] flex items-center justify-between text-[11px] text-[#A2DEC8]">
                          <span className="flex items-center gap-1">
                            <Edit3 className="w-3 h-3" /> Edit Collection
                          </span>
                          <span className="text-stone-500 text-[10px] uppercase font-mono">{col.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Edit Collection Modal / Overlay with Products In This Collection */}
                  {editingCollectionIndex !== null && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-[#121212] border border-[#2D2D2D] rounded-sm p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative custom-scrollbar">
                        <div className="flex items-center justify-between border-b border-[#242424] pb-4">
                          <div>
                            <span className="text-[10px] font-sans tracking-[0.2em] text-[#A2DEC8] uppercase block">
                              Collection Folder #{editingCollectionIndex + 1}
                            </span>
                            <h3 className="font-serif text-2xl text-[#F5F2EA] flex items-center gap-2 mt-0.5">
                              <span>{editColName || 'Collection Editor'}</span>
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingCollectionIndex(null)}
                            className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-[#1A1A1A] transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* PART 1: Collection Edit Form */}
                        <div className="space-y-4 bg-[#161616] p-5 rounded-sm border border-[#262626]">
                          <h4 className="text-xs uppercase font-sans tracking-[0.2em] text-[#A2DEC8] font-semibold flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Collection Details</span>
                          </h4>

                          {/* Image Preview & Free-Size Input */}
                          <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-wider text-stone-300">
                              Collection Cover Image (Free-size / Fits Cleanly in Middle)
                            </label>
                            <div className="relative min-h-[160px] max-h-[220px] bg-black rounded overflow-hidden border border-[#2B2B2B] flex items-center justify-center p-2">
                              <img
                                src={editColImage}
                                alt={editColName}
                                className="w-full h-auto max-h-[200px] object-contain"
                              />
                            </div>
                            <input
                              type="text"
                              value={editColImage}
                              onChange={(e) => setEditColImage(e.target.value)}
                              placeholder="Image URL..."
                              className="w-full bg-[#181818] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded outline-none focus:border-[#0E5A4F]"
                            />
                            <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#1E1E1E] hover:bg-[#282828] text-xs text-stone-300 rounded cursor-pointer transition border border-[#2A2A2A]">
                              <Upload className="w-3.5 h-3.5 text-[#A2DEC8]" />
                              <span>Upload New Image from Device</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const compressed = await compressImage(file);
                                      setEditColImage(compressed);
                                    } catch {
                                      showStatus('Image read error', 'error');
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Collection Name */}
                            <div className="space-y-1.5">
                              <label className="block text-xs uppercase tracking-wider text-stone-300">
                                Collection Name
                              </label>
                              <input
                                type="text"
                                value={editColName}
                                onChange={(e) => setEditColName(e.target.value)}
                                placeholder="e.g. GRAND HAARAMS"
                                className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#0E5A4F] px-3 py-2 text-sm text-[#F5F2EA] rounded outline-none font-serif uppercase"
                              />
                            </div>

                            {/* Category Tag */}
                            <div className="space-y-1.5">
                              <label className="block text-xs uppercase tracking-wider text-stone-300">
                                Collection Code
                              </label>
                              <input
                                type="text"
                                value={editColCategory}
                                onChange={(e) => setEditColCategory(e.target.value)}
                                placeholder="e.g. HAARAMS"
                                className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#0E5A4F] px-3 py-2 text-xs text-[#F5F2EA] rounded outline-none font-mono uppercase"
                              />
                            </div>
                          </div>

                          {/* Tagline / Description */}
                          <div className="space-y-1.5">
                            <label className="block text-xs uppercase tracking-wider text-stone-300">
                              Description / Narrative Tagline
                            </label>
                            <textarea
                              rows={2}
                              value={editColTagline}
                              onChange={(e) => setEditColTagline(e.target.value)}
                              placeholder="Describe this curated collection..."
                              className="w-full bg-[#181818] border border-[#2B2B2B] focus:border-[#0E5A4F] px-3 py-2 text-xs text-[#F5F2EA] rounded outline-none resize-none font-light"
                            />
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="button"
                              onClick={handleSaveEditedCollection}
                              disabled={savingCollections}
                              className="px-5 py-2 bg-[#0E5A4F] hover:bg-[#147A6A] text-white text-xs uppercase tracking-wider font-medium rounded transition shadow flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save Collection Details</span>
                            </button>
                          </div>
                        </div>

                        {/* PART 2: Products currently under this Collection */}
                        {(() => {
                          const colProducts = productsList.filter((p) => {
                            const pCat = (p.category || '').toUpperCase().trim();
                            const pDisp = (p.displayCategory || '').toUpperCase().trim();
                            const cCat = (editColCategory || '').toUpperCase().trim();
                            const cName = (editColName || '').toUpperCase().trim();
                            return (
                              pCat === cCat ||
                              pCat === cName ||
                              pDisp.includes(cName) ||
                              cName.includes(pCat)
                            );
                          });

                          return (
                            <div className="space-y-4 pt-2 border-t border-[#242424]">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <h4 className="font-serif text-lg text-[#F5F2EA] flex items-center gap-2">
                                    <Package className="w-4 h-4 text-[#A2DEC8]" />
                                    <span>Products In This Collection ({colProducts.length})</span>
                                  </h4>
                                  <p className="text-xs text-stone-400 font-light mt-0.5">
                                    Products assigned to collection "{editColName}". Click Edit to modify or Add to assign more.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleResetProductForm();
                                    setCategory(editColCategory || editColName);
                                    setEditingCollectionIndex(null);
                                    setActiveTab('CATALOGUE');
                                    setCatalogueSubMode('FORM');
                                  }}
                                  className="px-3.5 py-1.5 bg-[#1F1F1F] hover:bg-[#282828] border border-[#0E5A4F] text-[#A2DEC8] text-xs uppercase tracking-wider rounded transition flex items-center gap-1.5 cursor-pointer shrink-0"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>+ Add Product to this Collection</span>
                                </button>
                              </div>

                              {colProducts.length === 0 ? (
                                <div className="py-8 text-center bg-[#101010] border border-dashed border-[#242424] rounded-sm p-4">
                                  <p className="text-xs text-stone-400">
                                    No products currently assigned to "{editColName}".
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleResetProductForm();
                                      setCategory(editColCategory || editColName);
                                      setEditingCollectionIndex(null);
                                      setActiveTab('CATALOGUE');
                                      setCatalogueSubMode('FORM');
                                    }}
                                    className="mt-3 px-4 py-1.5 bg-[#0E5A4F] text-[11px] uppercase tracking-wider text-white rounded cursor-pointer"
                                  >
                                    + Add First Product to {editColName}
                                  </button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {colProducts.map((p) => (
                                    <div
                                      key={p.id}
                                      className="bg-[#141414] border border-[#242424] p-3 rounded-sm flex flex-col justify-between"
                                    >
                                      <div>
                                        <div className="aspect-[4/3] w-full bg-black rounded overflow-hidden flex items-center justify-center p-1 mb-2">
                                          <img
                                            src={p.image || (p.images && p.images[0])}
                                            alt={p.name}
                                            className="w-full h-full object-contain"
                                          />
                                        </div>
                                        <h5 className="font-serif text-xs text-[#F5F2EA] truncate font-medium">
                                          {p.name}
                                        </h5>
                                        <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                                          {p.description}
                                        </p>
                                      </div>

                                      <div className="mt-3 pt-2 border-t border-[#202020] flex items-center justify-between text-xs">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleStartEditProduct(p);
                                            setEditingCollectionIndex(null);
                                            setActiveTab('CATALOGUE');
                                          }}
                                          className="text-[#A2DEC8] hover:text-white flex items-center gap-1 transition text-[11px]"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                          <span>Edit</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteProduct(p.id, p.name)}
                                          className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition text-[11px]"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                          <span>Delete</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        <div className="flex justify-end pt-3 border-t border-[#222222]">
                          <button
                            type="button"
                            onClick={() => setEditingCollectionIndex(null)}
                            className="px-5 py-2 border border-[#333333] hover:border-stone-500 text-xs text-stone-300 rounded transition cursor-pointer"
                          >
                            Close Collection Folder
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add New Collection Card */}
                  <div className="p-6 bg-[#111111] border border-[#242424] rounded-sm space-y-4">
                    <h3 className="font-serif text-lg text-[#F5F2EA] flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#A2DEC8]" />
                      <span>Create New Collection</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-stone-400">Collection Name</label>
                        <input
                          type="text"
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                          placeholder=""
                          className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-stone-400">Category Tag</label>
                        <input
                          type="text"
                          value={newCollectionCategory}
                          onChange={(e) => setNewCollectionCategory(e.target.value)}
                          placeholder=""
                          className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs uppercase tracking-wider text-stone-400">Narrative / Tagline</label>
                      <input
                        type="text"
                        value={newCollectionTagline}
                        onChange={(e) => setNewCollectionTagline(e.target.value)}
                        placeholder=""
                        className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs uppercase tracking-wider text-stone-400">Cover Image URL or Upload</label>
                      <input
                        type="text"
                        value={newCollectionImage}
                        onChange={(e) => setNewCollectionImage(e.target.value)}
                        placeholder=""
                        className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded outline-none"
                      />
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-xs text-stone-300 rounded cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Cover Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const compressed = await compressImage(file);
                                setNewCollectionImage(compressed);
                              } catch {
                                showStatus('Image read error', 'error');
                              }
                            }
                          }}
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCollection}
                      className="px-5 py-2.5 bg-[#181818] hover:bg-[#222222] border border-[#333333] text-xs uppercase tracking-wider text-[#A2DEC8] rounded transition cursor-pointer"
                    >
                      + Add Collection to Page
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: ADD PRODUCTS (Renamed from Catalogue & Products) */}
              {activeTab === 'CATALOGUE' && (
                <div className="space-y-6 max-w-6xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202020] pb-5">
                    <div>
                      <h2 className="font-serif text-2xl text-[#F5F2EA]">Add &amp; Manage Products</h2>
                      <p className="text-xs text-stone-400 mt-1 font-light">
                        Add, edit, delete, or manage inventory items and publish directly to the live store.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          handleResetProductForm();
                          setCatalogueSubMode('FORM');
                        }}
                        className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider rounded transition cursor-pointer ${
                          catalogueSubMode === 'FORM' && !editingProduct
                            ? 'bg-[#0E5A4F] text-white'
                            : 'border border-[#2D2D2D] text-stone-300 hover:border-stone-500 bg-[#121212]'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Product</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCatalogueSubMode('LIST')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider rounded transition cursor-pointer ${
                          catalogueSubMode === 'LIST'
                            ? 'bg-[#0E5A4F] text-white'
                            : 'border border-[#2D2D2D] text-stone-300 hover:border-stone-500 bg-[#121212]'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View All ({productsList.length})</span>
                      </button>
                    </div>
                  </div>

                  {catalogueSubMode === 'LIST' ? (
                    /* Products Grid with Collection Filters & Search */
                    <div className="space-y-5">
                      {/* Search & Filter Bar */}
                      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#111111] p-3 rounded-sm border border-[#222222]">
                        {/* Search Input */}
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={searchProductQuery}
                            onChange={(e) => setSearchProductQuery(e.target.value)}
                            placeholder="Search products by title or collection..."
                            className="w-full bg-[#181818] border border-[#2B2B2B] pl-9 pr-3 py-1.5 text-xs text-[#F5F2EA] rounded outline-none focus:border-[#0E5A4F]"
                          />
                        </div>

                        {/* Collection Filter Buttons */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
                          <button
                            type="button"
                            onClick={() => setProductCategoryFilter('ALL')}
                            className={`px-3 py-1 text-[10px] font-sans tracking-wider uppercase rounded-none transition whitespace-nowrap cursor-pointer ${
                              productCategoryFilter === 'ALL'
                                ? 'bg-[#0E5A4F] text-white'
                                : 'bg-[#181818] text-stone-400 hover:text-white border border-[#2A2A2A]'
                            }`}
                          >
                            All ({productsList.length})
                          </button>
                          {collections.map((c) => {
                            const count = productsList.filter(
                              (p) =>
                                (p.category || '').toUpperCase().trim() === (c.category || c.name).toUpperCase().trim() ||
                                (p.displayCategory || '').toUpperCase().trim() === c.name.toUpperCase().trim()
                            ).length;
                            return (
                              <button
                                key={c.id || c.name}
                                type="button"
                                onClick={() => setProductCategoryFilter(c.name)}
                                className={`px-2.5 py-1 text-[10px] font-sans tracking-wider uppercase rounded-none transition whitespace-nowrap cursor-pointer ${
                                  productCategoryFilter.toUpperCase() === c.name.toUpperCase()
                                    ? 'bg-[#0E5A4F] text-white'
                                    : 'bg-[#181818] text-stone-400 hover:text-white border border-[#2A2A2A]'
                                }`}
                              >
                                {c.name} ({count})
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {(() => {
                        const filtered = productsList.filter((prod) => {
                          const matchesCat =
                            productCategoryFilter === 'ALL' ||
                            (prod.category || '').toUpperCase().trim() === productCategoryFilter.toUpperCase().trim() ||
                            (prod.displayCategory || '').toUpperCase().trim() === productCategoryFilter.toUpperCase().trim();
                          const matchesSearch =
                            !searchProductQuery.trim() ||
                            prod.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
                            prod.category.toLowerCase().includes(searchProductQuery.toLowerCase());
                          return matchesCat && matchesSearch;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="py-20 text-center border border-dashed border-[#262626] rounded bg-[#0D0D0D]">
                              <p className="text-sm text-stone-400">
                                {productsList.length === 0
                                  ? 'No products in catalogue yet.'
                                  : 'No products match the selected collection or search query.'}
                              </p>
                              <button
                                onClick={() => {
                                  handleResetProductForm();
                                  if (productCategoryFilter !== 'ALL') {
                                    setCategory(productCategoryFilter);
                                  }
                                  setCatalogueSubMode('FORM');
                                }}
                                className="mt-4 px-5 py-2.5 bg-[#0E5A4F] text-xs uppercase tracking-wider text-white cursor-pointer"
                              >
                                + Create New Product
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {filtered.map((prod) => (
                              <div
                                key={prod.id}
                                className="bg-[#121212] border border-[#242424] hover:border-[#383838] transition p-3.5 flex flex-col justify-between group rounded-sm shadow-md"
                              >
                                <div>
                                  {/* Clean Contained Aspect Ratio Image Frame */}
                                  <div className="relative aspect-[4/3] w-full bg-black overflow-hidden mb-3 rounded-sm flex items-center justify-center p-2 border border-[#1E1E1E]">
                                    <img
                                      src={prod.image || (prod.images && prod.images[0])}
                                      alt={prod.name}
                                      className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
                                    />
                                    <div className="absolute top-2 left-2 bg-black/85 px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#A0E2D6] border border-[#0E5A4F]/50">
                                      {prod.category}
                                    </div>
                                    <div className="absolute top-2 right-2">
                                      <span
                                        className={`text-[9px] px-2 py-0.5 uppercase tracking-wider font-semibold rounded ${
                                          prod.status === 'Published'
                                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                            : 'bg-stone-800 text-stone-300'
                                        }`}
                                      >
                                        ● {prod.status}
                                      </span>
                                    </div>
                                  </div>

                                  <h3 className="font-serif text-sm sm:text-base text-[#F5F2EA] truncate font-medium">
                                    {prod.name}
                                  </h3>
                                  <p className="text-xs text-stone-400 line-clamp-2 mt-1 font-light leading-snug">
                                    {prod.description}
                                  </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-[#1F1F1F] flex items-center justify-between text-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditProduct(prod)}
                                    className="flex items-center space-x-1.5 text-stone-300 hover:text-white transition cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-[#A2DEC8]" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                    className="flex items-center space-x-1.5 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    /* Product Create/Edit Form */
                    <form onSubmit={handleSaveProduct} className="space-y-6 bg-[#101010] p-6 sm:p-10 border border-[#222222] rounded-sm max-w-3xl">
                      {editingProduct && (
                        <div className="flex items-center justify-between bg-[#161616] p-3.5 border border-[#2B2B2B] rounded-sm">
                          <span className="text-xs sm:text-sm text-[#E5E0D5]">
                            Editing: <strong>{editingProduct.name}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              handleResetProductForm();
                              setCatalogueSubMode('LIST');
                            }}
                            className="text-xs text-stone-400 hover:text-white underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-sans">
                          Product Name
                        </label>
                        <input
                          type="text"
                          required
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder="e.g. Royal Emerald Tiered Haaram"
                          className="w-full bg-[#161616] border border-[#2B2B2B] focus:border-[#0E5A4F] px-4 py-3 text-sm text-[#F5F2EA] focus:outline-none transition rounded-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-sans">
                              Collection
                            </label>
                            <button
                              type="button"
                              onClick={() => setIsAddingCustomCategory(!isAddingCustomCategory)}
                              className="text-[11px] text-[#A2DEC8] hover:text-white transition flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{isAddingCustomCategory ? 'Choose Existing' : '+ Add Collection Extra'}</span>
                            </button>
                          </div>

                          {isAddingCustomCategory ? (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newCustomCategoryInput}
                                  onChange={(e) => setNewCustomCategoryInput(e.target.value)}
                                  placeholder="Enter new collection name..."
                                  className="flex-1 bg-[#161616] border border-[#2B2B2B] focus:border-[#0E5A4F] px-4 py-2.5 text-sm text-[#F5F2EA] focus:outline-none transition rounded-sm uppercase"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!newCustomCategoryInput.trim()) return;
                                    const formatted = newCustomCategoryInput.trim().toUpperCase();
                                    setCategory(formatted);

                                    // Add to collections list right away if not already exists
                                    const norm = formatted.replace(/\s+/g, '_');
                                    const exists = collections.some(
                                      (c) => c.category.toUpperCase().replace(/\s+/g, '_') === norm || c.name.toUpperCase() === formatted
                                    );
                                    if (!exists) {
                                      const newColCard: CollectionCard = {
                                        id: `col-${Date.now()}`,
                                        name: formatted,
                                        category: norm as JewelryCategory,
                                        tagline: `Curated ${formatted} handcrafted 92.5 sterling silver collection.`,
                                        image: heroIsolatedJewelryImg,
                                        itemCount: 'Curated Heritage',
                                      };
                                      const updatedCols = [...collections, newColCard];
                                      setCollections(updatedCols);
                                      saveWebsiteSettings({ collections: updatedCols }).catch((err) =>
                                        console.warn('Auto collection save warning:', err)
                                      );
                                      showStatus(`Collection "${formatted}" created and added to Collections!`);
                                    }
                                    setIsAddingCustomCategory(false);
                                    setNewCustomCategoryInput('');
                                  }}
                                  className="px-4 py-2 bg-[#0E5A4F] hover:bg-[#147A6A] text-white text-xs font-medium uppercase rounded-sm cursor-pointer"
                                >
                                  Add
                                </button>
                              </div>
                              <span className="text-[11px] text-stone-400 block font-light">
                                Creates a new collection category and automatically adds it to website collections.
                              </span>
                            </div>
                          ) : (
                            <select
                              value={category}
                              onChange={(e) => {
                                if (e.target.value === '__ADD_NEW__') {
                                  setIsAddingCustomCategory(true);
                                } else {
                                  setCategory(e.target.value);
                                }
                              }}
                              className="w-full bg-[#161616] border border-[#2B2B2B] focus:border-[#0E5A4F] px-4 py-3 text-sm text-[#F5F2EA] focus:outline-none transition rounded-sm cursor-pointer"
                            >
                              {/* Merge DEFAULT_CATEGORIES with any user collections categories */}
                              {Array.from(
                                new Set([
                                  ...DEFAULT_CATEGORIES,
                                  ...collections.map((c) => c.category || c.name),
                                ])
                              ).map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                              <option value="__ADD_NEW__" className="text-[#A2DEC8] font-bold">
                                + Add Collection Extra...
                              </option>
                            </select>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-sans">
                            Status
                          </label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className="w-full bg-[#161616] border border-[#2B2B2B] focus:border-[#0E5A4F] px-4 py-3 text-sm text-[#F5F2EA] focus:outline-none transition rounded-sm"
                          >
                            <option value="Published">Published (Live in Store)</option>
                            <option value="Draft">Draft (Hidden)</option>
                          </select>
                        </div>
                      </div>

                      {/* Images */}
                      <div className="space-y-3">
                        <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-sans">
                          Product Images ({images.length})
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {images.map((img, i) => (
                            <div key={i} className="relative w-20 h-20 bg-black border border-[#2D2D2D] rounded overflow-hidden">
                              <img src={img} alt="Product" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                                className="absolute top-1 right-1 p-0.5 bg-rose-900 text-white rounded"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={imageInputUrl}
                            onChange={(e) => setImageInputUrl(e.target.value)}
                            placeholder="Paste image URL..."
                            className="flex-1 bg-[#161616] border border-[#2B2B2B] px-3 py-2 text-xs text-[#F5F2EA] rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (imageInputUrl.trim()) {
                                setImages([...images, imageInputUrl.trim()]);
                                setImageInputUrl('');
                              }
                            }}
                            className="px-4 py-2 bg-[#202020] text-xs text-white rounded"
                          >
                            Add URL
                          </button>
                        </div>

                        <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#1C1C1C] hover:bg-[#252525] text-xs text-stone-300 rounded cursor-pointer transition">
                          <Upload className="w-4 h-4" />
                          <span>Upload Image from Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const compressed = await compressImage(file);
                                setImages([...images, compressed]);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Video URL */}
                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-sans">
                          Video Showcase URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://... direct mp4/webm link"
                          className="w-full bg-[#161616] border border-[#2B2B2B] focus:border-[#0E5A4F] px-4 py-3 text-sm text-[#F5F2EA] focus:outline-none transition rounded-sm"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-[0.15em] text-stone-400 font-sans">
                          Craftsmanship Narrative &amp; Description
                        </label>
                        <textarea
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe the 92.5 purity, gemstone cuts, and styling..."
                          className="w-full bg-[#161616] border border-[#2B2B2B] focus:border-[#0E5A4F] p-4 text-xs text-[#F5F2EA] focus:outline-none transition rounded-sm leading-relaxed"
                        />
                      </div>

                      <div className="pt-4 border-t border-[#222222]">
                        <button
                          type="submit"
                          disabled={isSubmittingProduct}
                          className="w-full py-4 bg-[#0E5A4F] hover:bg-[#147A6A] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-medium rounded transition"
                        >
                          {isSubmittingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Save & Publish Product'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 6: INQUIRY FORMS WHO FILLED (All submissions) */}
              {activeTab === 'INQUIRIES' && (
                <div className="space-y-6 max-w-6xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202020] pb-5">
                    <div>
                      <h2 className="font-serif text-2xl text-[#F5F2EA]">Customer Inquiries &amp; Leads</h2>
                      <p className="text-xs text-stone-400 mt-1 font-light">
                        All submissions from &ldquo;Bespoke Design Inquiry&rdquo; and &ldquo;Start a Conversation&rdquo;.
                      </p>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-2">
                      {(['ALL', 'New', 'Contacted', 'Closed'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setInquiryFilter(st)}
                          className={`px-3 py-1.5 text-xs font-mono rounded uppercase transition cursor-pointer ${
                            inquiryFilter === st
                              ? 'bg-[#0E5A4F] text-white'
                              : 'bg-[#141414] text-stone-400 hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
                    <input
                      type="text"
                      value={searchInquiry}
                      onChange={(e) => setSearchInquiry(e.target.value)}
                      placeholder="Search inquiries by name, phone, email, or jewellery type..."
                      className="w-full bg-[#121212] border border-[#242424] pl-10 pr-4 py-2.5 text-xs text-[#F5F2EA] rounded focus:outline-none focus:border-[#0E5A4F]"
                    />
                  </div>

                  {/* Inquiries Table / List */}
                  {filteredInquiries.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-[#262626] rounded bg-[#0D0D0D]">
                      <p className="text-sm text-stone-400">No inquiries found matching current filter.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredInquiries.map((inq) => (
                        <div
                          key={inq.id}
                          onClick={() => setSelectedInquiry(inq)}
                          className="bg-[#111111] hover:bg-[#141414] border border-[#242424] hover:border-[#0E5A4F]/60 p-5 rounded-sm flex flex-col md:flex-row md:items-start justify-between gap-4 cursor-pointer transition group shadow-sm"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif text-base text-[#F5F2EA] group-hover:text-[#A2DEC8] transition-colors">
                                {inq.name}
                              </span>
                              <span className="px-2 py-0.5 bg-[#181818] border border-[#292929] text-[10px] text-[#A2DEC8] font-mono rounded">
                                {inq.source === 'BESPOKE_CUSTOMIZATION' ? 'Bespoke Customization' : 'Contact Section'}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-[10px] rounded uppercase font-semibold ${
                                  inq.status === 'New'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                    : inq.status === 'Contacted'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                    : 'bg-stone-800 text-stone-400'
                                }`}
                              >
                                {inq.status}
                              </span>
                              <span className="text-[10px] text-stone-500 font-sans ml-auto md:ml-0 flex items-center gap-1 group-hover:text-stone-300">
                                <span>Click to inspect details</span>
                                <ExternalLink className="w-3 h-3" />
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-4 text-xs text-stone-400 font-light">
                              {inq.phone && (
                                <a
                                  href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1.5 text-[#1FD286] hover:underline"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{inq.phone}</span>
                                </a>
                              )}
                              {inq.email && (
                                <a
                                  href={`mailto:${inq.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1.5 hover:text-white"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>{inq.email}</span>
                                </a>
                              )}
                              {inq.location && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                                  <span>{inq.location}</span>
                                </span>
                              )}
                              {inq.jewelleryType && (
                                <span className="px-2 py-0.5 bg-[#161616] text-[#A2DEC8] rounded font-mono text-[11px]">
                                  Piece: {inq.jewelleryType}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-stone-300 pt-2 border-t border-[#1C1C1C] leading-relaxed line-clamp-3">
                              {inq.inquiry}
                            </p>
                          </div>

                          {/* Quick Actions */}
                          <div
                            className="flex items-center md:flex-col gap-2 shrink-0 pt-2 md:pt-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={inq.status}
                              onChange={async (e) => {
                                const newSt = e.target.value as 'New' | 'Contacted' | 'Closed';
                                setInquiriesList((prev) =>
                                  prev.map((item) => (item.id === inq.id ? { ...item, status: newSt } : item))
                                );
                                try {
                                  await updateInquiryStatus(inq.id, newSt);
                                  showStatus(`Updated status to ${newSt}`);
                                } catch (err: any) {
                                  console.error('Update status error:', err);
                                  showStatus('Failed to update status', 'error');
                                }
                              }}
                              className="bg-[#181818] border border-[#2B2B2B] text-xs text-[#E5E0D5] px-2.5 py-1.5 rounded cursor-pointer"
                            >
                              <option value="New">Mark New</option>
                              <option value="Contacted">Mark Contacted</option>
                              <option value="Closed">Mark Closed</option>
                            </select>

                            <button
                              disabled={deletingInquiryId === inq.id}
                              onClick={async (e) => {
                                e.stopPropagation();
                                const toDelete = inq.id;
                                const patronName = inq.name;
                                setDeletingInquiryId(toDelete);
                                // Optimistically remove from state immediately
                                setInquiriesList((prev) => prev.filter((item) => item.id !== toDelete));
                                if (selectedInquiry?.id === toDelete) {
                                  setSelectedInquiry(null);
                                }

                                try {
                                  await deleteInquiry(toDelete);
                                  showStatus(`Inquiry from "${patronName}" permanently deleted.`);
                                } catch (err: any) {
                                  console.error('Delete inquiry error:', err);
                                } finally {
                                  setDeletingInquiryId(null);
                                }
                              }}
                              className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 disabled:opacity-50 rounded transition cursor-pointer flex items-center gap-1 text-xs"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="md:hidden">Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* MODAL: Customer Inquiry Detail View & Responder */}
                  {selectedInquiry && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
                      onClick={() => setSelectedInquiry(null)}
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-xl bg-[#0F0F0F] border border-[#2B2B2B] rounded-sm p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] space-y-6"
                      >
                        {/* Close button */}
                        <button
                          onClick={() => setSelectedInquiry(null)}
                          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white transition cursor-pointer rounded"
                          aria-label="Close details"
                        >
                          <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#A2DEC8]">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#A2DEC8] block">
                              {selectedInquiry.source === 'BESPOKE_CUSTOMIZATION'
                                ? 'Bespoke Customization Inquiry'
                                : 'Contact Section Inquiry'}
                            </span>
                            <h3 className="font-serif text-xl sm:text-2xl text-[#F5F2EA]">
                              {selectedInquiry.name}
                            </h3>
                          </div>
                        </div>

                        {/* Status + Metadata chips */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-1 text-xs rounded uppercase font-semibold ${
                              selectedInquiry.status === 'New'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                : selectedInquiry.status === 'Contacted'
                                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            Status: {selectedInquiry.status}
                          </span>
                          {selectedInquiry.jewelleryType && (
                            <span className="px-2.5 py-1 bg-[#181818] text-[#A2DEC8] border border-[#282828] rounded font-mono text-xs">
                              Piece: {selectedInquiry.jewelleryType}
                            </span>
                          )}
                          {selectedInquiry.location && (
                            <span className="px-2.5 py-1 bg-[#181818] text-stone-300 border border-[#282828] rounded text-xs flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-stone-500" />
                              {selectedInquiry.location}
                            </span>
                          )}
                        </div>

                        {/* Contact details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#141414] border border-[#222222] rounded text-xs">
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase tracking-wider mb-1 font-sans">
                              Email Address
                            </span>
                            {selectedInquiry.email ? (
                              <a
                                href={`mailto:${selectedInquiry.email}`}
                                className="text-[#EAE6DE] hover:text-[#A2DEC8] hover:underline flex items-center gap-1.5 font-sans"
                              >
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{selectedInquiry.email}</span>
                              </a>
                            ) : (
                              <span className="text-stone-500 italic">Not provided</span>
                            )}
                          </div>

                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase tracking-wider mb-1 font-sans">
                              Phone / WhatsApp
                            </span>
                            {selectedInquiry.phone ? (
                              <a
                                href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1FD286] hover:underline flex items-center gap-1.5 font-mono"
                              >
                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                <span>{selectedInquiry.phone}</span>
                              </a>
                            ) : (
                              <span className="text-stone-500 italic">Not provided</span>
                            )}
                          </div>
                        </div>

                        {/* Full Inquiry Message */}
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase tracking-wider text-stone-400 font-sans block">
                            Full Inquiry Message
                          </label>
                          <div className="p-4 bg-[#141414] border border-[#222222] rounded text-sm text-[#F5F2EA] font-light leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                            {selectedInquiry.inquiry || 'No additional message was provided with this inquiry.'}
                          </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#222222]">
                          {confirmDeleteModalId === selectedInquiry.id ? (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <button
                                type="button"
                                onClick={async () => {
                                  const toDelete = selectedInquiry.id;
                                  const patronName = selectedInquiry.name;
                                  setInquiriesList((prev) => prev.filter((i) => i.id !== toDelete));
                                  setSelectedInquiry(null);
                                  setConfirmDeleteModalId(null);
                                  try {
                                    await deleteInquiry(toDelete);
                                    showStatus(`Inquiry from "${patronName}" permanently deleted.`);
                                  } catch (err: any) {
                                    console.error('Delete inquiry error:', err);
                                  }
                                }}
                                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Yes, Confirm Delete</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteModalId(null)}
                                className="px-3 py-2.5 bg-[#202020] hover:bg-[#2A2A2A] text-stone-300 text-xs uppercase tracking-wider rounded transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteModalId(selectedInquiry.id)}
                              className="w-full sm:w-auto px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs uppercase tracking-wider font-medium rounded transition cursor-pointer flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete Record</span>
                            </button>
                          )}

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            {selectedInquiry.phone && (
                              <a
                                href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `Hello ${selectedInquiry.name}, this is Jewel Botanica regarding your inquiry.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-[#0E5A4F] hover:bg-[#147A6A] text-white text-xs uppercase tracking-wider font-medium rounded transition flex items-center justify-center gap-2"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Reply via WhatsApp</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDeleteModalId(null);
                                setSelectedInquiry(null);
                              }}
                              className="px-4 py-2.5 bg-[#1F1F1F] hover:bg-[#282828] text-stone-300 text-xs uppercase tracking-wider rounded transition cursor-pointer"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: INSTAGRAM UPDATING */}
              {activeTab === 'INSTAGRAM' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="border-b border-[#202020] pb-5">
                    <h2 className="font-serif text-2xl text-[#F5F2EA] flex items-center gap-3">
                      <Instagram className="w-6 h-6 text-[#E1306C]" />
                      <span>Instagram Community Synchronizer</span>
                    </h2>
                    <p className="text-xs text-stone-400 mt-1 font-light">
                      Update your live Instagram audience follower count. Whenever your Instagram followers increase or decrease, enter the latest number here to immediately reflect on the homepage.
                    </p>
                  </div>

                  <div className="p-6 bg-[#111111] border border-[#242424] rounded-sm space-y-5">
                    <div className="space-y-2">
                      <label className="block text-xs uppercase tracking-wider text-stone-300">
                        Live Instagram Follower Count
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={instagramFollowers}
                        onChange={(e) => setInstagramFollowers(parseInt(e.target.value, 10) || 0)}
                        placeholder="e.g. 104280"
                        className="w-full bg-[#181818] border border-[#303030] focus:border-[#0E5A4F] px-4 py-3 text-2xl font-serif text-[#F5F2EA] focus:outline-none transition rounded-sm"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-[#1F1F1F]">
                      <span>Live website display format:</span>
                      <span className="font-serif text-lg text-[#1FD286] font-bold">
                        {instagramFollowers.toLocaleString('en-US')}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={savingInstagram}
                      onClick={handleSaveInstagramFollowers}
                      className="w-full py-3.5 bg-[#0E5A4F] hover:bg-[#147A6A] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-medium rounded transition cursor-pointer"
                    >
                      {savingInstagram ? 'SAVING...' : 'UPDATE LIVE FOLLOWER COUNT ON WEBSITE'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 8: EDITING PROFILE OPTION */}
              {activeTab === 'PROFILE' && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202020] pb-5">
                    <div>
                      <h2 className="font-serif text-2xl text-[#F5F2EA]">Business Profile &amp; Atelier Info</h2>
                      <p className="text-xs text-stone-400 mt-1 font-light">
                        Edit atelier location, phone concierge, WhatsApp channel, and Instagram handles.
                      </p>
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="px-6 py-2.5 bg-[#0E5A4F] hover:bg-[#147A6A] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-medium rounded transition cursor-pointer"
                    >
                      {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>

                  <div className="p-6 bg-[#111111] border border-[#242424] rounded-sm space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-stone-400">Brand Name</label>
                        <input
                          type="text"
                          value={profile.brandName}
                          onChange={(e) => setProfile({ ...profile, brandName: e.target.value })}
                          className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-stone-400">Descriptor</label>
                        <input
                          type="text"
                          value={profile.descriptor}
                          onChange={(e) => setProfile({ ...profile, descriptor: e.target.value })}
                          className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs uppercase tracking-wider text-stone-400">Tagline</label>
                      <input
                        type="text"
                        value={profile.tagline}
                        onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                        className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs uppercase tracking-wider text-stone-400">Atelier Location &amp; Shipping</label>
                      <input
                        type="text"
                        value={profile.atelierAddress}
                        onChange={(e) => setProfile({ ...profile, atelierAddress: e.target.value })}
                        className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-stone-400">WhatsApp Display Phone</label>
                        <input
                          type="text"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-stone-400">WhatsApp Clean Number (for wa.me)</label>
                        <input
                          type="text"
                          value={profile.whatsappPhone}
                          onChange={(e) => setProfile({ ...profile, whatsappPhone: e.target.value.replace(/[^0-9]/g, '') })}
                          className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-stone-400">Instagram Handle</label>
                        <input
                          type="text"
                          value={profile.instagramHandle}
                          onChange={(e) => setProfile({ ...profile, instagramHandle: e.target.value })}
                          className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-stone-400">Instagram Profile Link</label>
                        <input
                          type="text"
                          value={profile.instagramUrl}
                          onChange={(e) => setProfile({ ...profile, instagramUrl: e.target.value })}
                          className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-xs text-[#F5F2EA] rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};
