import React, { useState, useEffect, createContext, useContext } from 'react';
import LinkForm from './LinkForm';
import LinkList from './LinkList';
import axios from 'axios';
import { 
  Link, 
  LinkFormData, 
  CreateLinkResult, 
  SlugStatus, 
  RedirectResult,
  UrlShortenerContextType
} from '../types';

const API_URL = 'http://localhost:8000/api';

export const UrlShortenerContext = createContext<UrlShortenerContextType | undefined>(undefined);

export const useUrlShortener = (): UrlShortenerContextType => {
  const context = useContext(UrlShortenerContext);
  if (context === undefined) {
    throw new Error('useUrlShortener must be used within a UrlShortenerProvider');
  }
  return context;
};

// This component provides a URL shortening service with functionalities to create, list, and search links.
// It uses React Context to share state and actions across child components.
const UrlShortener: React.FC = () => {
  // State variables for managing links, loading state, pagination, and search functionality
  const [links, setLinks] = useState<Link[]>([]);
  const [allLinks, setAllLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create'); 
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Fetch links when the component mounts
  useEffect(() => {
    fetchLinks();
  }, []);

  // Debounce search term to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch links from the API with pagination and search functionality
  const fetchLinks = async (): Promise<void> => {
    try {
      setLoading(true);
      setIsSearching(debouncedSearchTerm.trim() !== '');
      
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('per_page', itemsPerPage.toString());
      
      if (debouncedSearchTerm.trim() !== '') {
        params.append('search', debouncedSearchTerm);
      }
      
      const response = await axios.get(`${API_URL}/links?${params.toString()}`);
      
      setLinks(response.data.data); 
      setTotalPages(response.data.last_page);
      setAllLinks(response.data.data);
    } catch (err) {
      console.error('Error fetching links:', err);
      setLinks([]);
      setAllLinks([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };
  
  // Refetch links when pagination or search term changes
  useEffect(() => {
    fetchLinks();
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  // Create a new shortened link
  const createLink = async (formData: LinkFormData): Promise<CreateLinkResult> => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/links`, formData);

      setLinks(prevLinks => [response.data, ...prevLinks]);
      // Automatically switch to the list tab after creating a link
      setActiveTab('list');
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to create link. Please try again.';
      console.error('Error creating link:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Check if a custom slug is available
  const checkSlugAvailability = async (slug: string): Promise<SlugStatus | null> => {
    if (!slug || slug.length < 4) return null;
    
    try {
      const response = await axios.get(`${API_URL}/links/check-slug/${slug}?_t=${Date.now()}`);
      return { available: response.data.available };
    } catch (err: any) {
      console.error('Error checking slug availability:', err);
      return { 
        available: false, 
        error: err.response?.data?.error || 'Invalid slug format'
      };
    }
  };

  // Redirect to the original URL using the shortened slug
  const redirectToOriginalUrl = async (slug: string): Promise<RedirectResult> => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/r/${slug}`);
      if (response.data && response.data.url) {
        window.open(response.data.url, '_blank');
        return { success: true };
      }
      return { success: false, error: 'Could not retrieve the original URL' };
    } catch (err: any) {
      let errorMessage = 'An error occurred while retrieving the URL';
      if (err.response && err.response.status === 404) {
        errorMessage = 'Link not found. The shortened URL may have expired or been removed.';
      }
      console.error('Error redirecting to URL:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Context value to share state and actions with child components
  const contextValue = {
    links,
    allLinks,
    loading,
    createLink,
    checkSlugAvailability,
    redirectToOriginalUrl,
    fetchLinks,
    searchTerm,
    setSearchTerm,
    isSearching,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage
  };

  return (
    <UrlShortenerContext.Provider value={contextValue}>
      {/* Tab navigation for switching between "Create Link" and "My Links" */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'create' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('create')}
          >
            Create Link
          </button>
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('list')}
          >
            My Links {links.length > 0 && `(${links.length})`}
          </button>
        </div>
        
        {/* Render the "Create Link" form */}
        <div className={activeTab === 'create' ? 'block' : 'hidden'}>
          <div className="p-4 sm:p-6">
            <LinkForm />
          </div>
        </div>
        
        {/* Render the list of links */}
        <div className={activeTab === 'list' ? 'block' : 'hidden'}>
          <LinkList />
        </div>
      </div>
    </UrlShortenerContext.Provider>
  );
};

export default UrlShortener;
