export interface Link {
  id: number;
  url: string;
  slug: string;
  shortened_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface SlugStatus {
  available: boolean;
  error?: string;
}

export interface LinkFormData {
  url: string;
  slug: string | null;
}

export interface CreateLinkResult {
  success: boolean;
  data?: Link;
  error?: string;
}

export interface RedirectResult {
  success: boolean;
  error?: string;
}

// This interface defines the context type for the URL shortener application,
// including state management and methods for creating links, checking slug availability,
// redirecting, and pagination.
export interface UrlShortenerContextType {
  links: Link[];
  allLinks: Link[];
  loading: boolean;
  createLink: (formData: LinkFormData) => Promise<CreateLinkResult>;
  checkSlugAvailability: (slug: string) => Promise<SlugStatus | null>;
  redirectToOriginalUrl: (slug: string) => Promise<RedirectResult>;
  fetchLinks: () => Promise<void>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  isSearching: boolean;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
}
