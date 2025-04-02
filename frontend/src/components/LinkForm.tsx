import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useUrlShortener } from "./UrlShortener";
import { SlugStatus } from "../types";

const LinkForm: React.FC = () => {
  // Get functions and state from context
  const { createLink, checkSlugAvailability } = useUrlShortener();

  // State variables for form inputs, validation, and submission status
  const [url, setUrl] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<SlugStatus | null>(null);
  const [slugChecking, setSlugChecking] = useState<boolean>(false);
  const [slugTouched, setSlugTouched] = useState<boolean>(false);

  // Debounced slug availability check
  useEffect(
    () => {
      if (slug === "" || slug.length < 4) {
        setSlugStatus(null);
        return;
      }

      if (!slugTouched) return;

      const delayDebounceFn = setTimeout(async () => {
        if (slug && slug.length >= 4) {
          setSlugChecking(true);
          const result = await checkSlugAvailability(slug);
          setSlugStatus(result);
          setSlugChecking(false);
        }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    },
    [slug, slugTouched, checkSlugAvailability]
  );

  // Handle slug input changes and mark it as touched
  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSlug(newValue);
    setSlugTouched(true);

    if (newValue === "") {
      setSlugStatus(null);
      setSlugChecking(false);
    }
  };

  // Validate form inputs before submission
  const isFormValid = (): boolean => {
    if (!url) return false;
    if (slug && slugStatus && !slugStatus.available) return false;
    return true;
  };

  // Handle form submission and reset state on success
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!url) {
      setFormError("Please enter a URL");
      return;
    }

    if (slug && slugStatus && !slugStatus.available) {
      setFormError("The specified slug is already taken");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await createLink({ url, slug: slug || null });
      if (result.success) {
        setUrl("");
        setSlug("");
        setSlugStatus(null);
        setSlugTouched(false);
        setFormError(null);
      } else {
        setFormError(result.error || "An error occurred");
      }
    } catch (error) {
      setFormError("An unexpected error occurred. Please try again.");
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="w-full" noValidate>
        <div className="mb-4">
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            URL to Shorten *
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
            required={true}
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Custom Slug (Optional)
          </label>
          <div className="relative">
            <div className="flex">
              <div className="bg-gray-100 px-3 py-2 text-xs sm:text-sm border border-r-0 border-gray-300 rounded-l-md text-gray-500 flex items-center whitespace-nowrap">
                yourdomain.com/r/
              </div>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={handleSlugChange}
                placeholder="custom-slug"
                className={`flex-1 px-3 py-2 text-sm border ${slugStatus &&
                !slugStatus.available
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : slugStatus && slugStatus.available
                    ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"} rounded-r-md`}
                disabled={isSubmitting}
                pattern="[a-zA-Z0-9]"
                title="Only alphanumeric characters allowed"
                minLength={4}
                required={false}
              />
            </div>
          </div>

          {slugChecking &&
            <div className="mt-1 text-xs text-gray-500 flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Checking availability...
            </div>}
          {!slugChecking &&
            slugStatus &&
            !slugStatus.available &&
            <div className="mt-1 text-xs text-red-600">
              This slug is already taken
            </div>}
          {!slugChecking &&
            slugStatus &&
            slugStatus.available &&
            <div className="mt-1 text-xs text-green-600">
              This slug is available
            </div>}
          <p className="mt-1 text-xs text-gray-500">
            Leave blank to generate a random slug. Must be at least 4
            characters.
          </p>
        </div>

        {formError &&
          <div className="mb-4 p-3 bg-red-50 text-xs text-red-700 rounded-md border border-red-200">
            {formError}
          </div>}

        <button
          type="submit"
          disabled={isSubmitting || !isFormValid()}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isFormValid()
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
        >
          {isSubmitting ? "Shortening..." : "Shorten URL"}
        </button>
      </form>
    </div>
  );
};

export default LinkForm;
