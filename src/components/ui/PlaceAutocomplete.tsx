import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Remove conflicting global declarations - use type assertions instead

interface PlaceAutocompleteElement extends HTMLElement {
  addEventListener(type: 'gmp-placeselect', listener: (event: PlaceSelectEvent) => void): void;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: 'gmp-placeselect', listener: (event: PlaceSelectEvent) => void): void;
  removeEventListener(type: string, listener: EventListener): void;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
}

interface PlaceSelectEvent extends Event {
  place: {
    formattedAddress?: string;
    addressComponents?: Array<{
      longText: string;
      shortText: string;
      types: string[];
    }>;
    location?: {
      lat(): number;
      lng(): number;
    };
  };
}

export interface PlaceAutocompleteRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

interface PlaceAutocompleteProps {
  placeholder?: string;
  className?: string;
  onPlaceSelect?: (place: {
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
  }) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  value?: string;
  required?: boolean;
  id?: string;
  countries?: string[];
  types?: string[];
}

const PlaceAutocomplete = forwardRef<PlaceAutocompleteRef, PlaceAutocompleteProps>(
  ({
    placeholder = "Enter address...",
    className = "",
    onPlaceSelect,
    onFocus,
    onBlur,
    value = "",
    required = false,
    id,
    countries = ['us'],
    types = ['address']
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const autocompleteElementRef = useRef<PlaceAutocompleteElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
      blur: () => {
        if (inputRef.current) {
          inputRef.current.blur();
        }
      },
      clear: () => {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    }));

    useEffect(() => {
      const initializeAutocomplete = () => {
        if (!containerRef.current || !(window.google?.maps?.places as any)?.PlaceAutocompleteElement) {
          return;
        }

        try {
          // Create the new PlaceAutocompleteElement
          const autocompleteElement = new (window.google.maps.places as any).PlaceAutocompleteElement();
          autocompleteElementRef.current = autocompleteElement;

          // Configure the element
          if (placeholder) {
            autocompleteElement.setAttribute('placeholder', placeholder);
          }

          if (id) {
            autocompleteElement.setAttribute('id', id);
          }

          if (required) {
            autocompleteElement.setAttribute('required', 'true');
          }

          // Set country restriction
          if (countries.length > 0) {
            autocompleteElement.setAttribute('country', countries.join(','));
          }

          // Set place types
          if (types.length > 0) {
            autocompleteElement.setAttribute('types', types.join(','));
          }

          // Add custom styling
          autocompleteElement.setAttribute('class', cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          ));

          // Handle place selection
          const handlePlaceSelect = (event: PlaceSelectEvent) => {
            if (onPlaceSelect && event.place) {
              const place = event.place;
              let city = '';
              let state = '';
              let zipCode = '';

              // Extract address components
              if (place.addressComponents) {
                place.addressComponents.forEach((component) => {
                  if (component.types.includes('locality')) {
                    city = component.longText;
                  } else if (component.types.includes('administrative_area_level_1')) {
                    state = component.shortText;
                  } else if (component.types.includes('postal_code')) {
                    zipCode = component.longText;
                  }
                });
              }

              onPlaceSelect({
                address: place.formattedAddress || '',
                city,
                state,
                zipCode,
                lat: place.location?.lat(),
                lng: place.location?.lng()
              });
            }
          };

          autocompleteElement.addEventListener('gmp-placeselect', handlePlaceSelect);

          // Handle focus and blur events by finding the input element inside
          const observer = new MutationObserver(() => {
            const input = autocompleteElement.querySelector('input');
            if (input && !inputRef.current) {
              inputRef.current = input as HTMLInputElement;

              // Set initial value
              if (value) {
                input.value = value;
              }

              // Add event listeners
              if (onFocus) {
                input.addEventListener('focus', onFocus);
              }
              if (onBlur) {
                input.addEventListener('blur', onBlur);
              }
            }
          });

          observer.observe(autocompleteElement, { childList: true, subtree: true });

          // Append to container
          containerRef.current.appendChild(autocompleteElement);

          // Cleanup function
          return () => {
            observer.disconnect();
            autocompleteElement.removeEventListener('gmp-placeselect', handlePlaceSelect);
            if (containerRef.current?.contains(autocompleteElement)) {
              containerRef.current.removeChild(autocompleteElement);
            }
          };
        } catch (error) {
          console.error('Error initializing PlaceAutocompleteElement:', error);
        }
      };

      // Check if Google Maps is already loaded
    if ((window.google?.maps?.places as any)?.PlaceAutocompleteElement) {
        const cleanup = initializeAutocomplete();
        return cleanup;
      } else {
        // Wait for Google Maps to load
        const checkGoogleMaps = setInterval(() => {
          if ((window.google?.maps?.places as any)?.PlaceAutocompleteElement) {
            const cleanup = initializeAutocomplete();
            clearInterval(checkGoogleMaps);
            return cleanup;
          }
        }, 100);

        return () => clearInterval(checkGoogleMaps);
      }
    }, [placeholder, className, onPlaceSelect, onFocus, onBlur, value, required, id, countries, types]);

    // Update value when prop changes
    useEffect(() => {
      if (inputRef.current && value !== inputRef.current.value) {
        inputRef.current.value = value;
      }
    }, [value]);

    return (
      <div
        ref={containerRef}
        className="w-full"
        style={{ minHeight: '40px' }} // Ensure container has minimum height
      />
    );
  }
);

PlaceAutocomplete.displayName = 'PlaceAutocomplete';

export default PlaceAutocomplete;