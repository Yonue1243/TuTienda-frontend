export type UserDto = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type AuthResponse = {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
};

export type StoreSettingsDto = {
  id: string;
  storeId: string;
  showBanner: boolean;
  bannerUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CarouselSlideDto = {
  id: string;
  storeId: string;
  sortOrder: number;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryDto = {
  id: string;
  name: string;
  sortOrder?: number;
};

export type ProductDto = {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  imageUrl: string;
  stock: number | null;
  visible: boolean;
  featured?: boolean;
  featuredSortOrder?: number | null;
  categoryId: string | null;
  category?: CategoryDto | { id: string; name: string } | null;
  createdAt?: string;
};

export type StorePublic = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  logoUrl: string | null;
  settings?: StoreSettingsDto | null;
  carouselSlides?: CarouselSlideDto[];
  categories: CategoryDto[];
  products: ProductDto[];
};

export type OrderDto = {
  id: string;
  customerName: string;
  customerPhone: string;
  notes: string | null;
  total: string | number;
  status: string;
  storeId: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: string | number;
    productId: string;
    product: ProductDto;
  }[];
};
