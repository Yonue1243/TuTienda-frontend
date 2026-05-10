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

export type StorePublic = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  logoUrl: string | null;
  categories: { id: string; name: string }[];
  products: ProductDto[];
};

export type ProductDto = {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  imageUrl: string;
  stock: number | null;
  visible: boolean;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
  createdAt?: string;
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
