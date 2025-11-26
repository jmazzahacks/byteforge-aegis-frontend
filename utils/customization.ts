export interface SiteCustomization {
  siteName?: string;
  logoUrl?: string;
  primaryColor?: string;
  backgroundColor?: string;
}

export function getCustomizationFromQuery(searchParams: URLSearchParams): SiteCustomization {
  return {
    siteName: searchParams.get('siteName') || undefined,
    logoUrl: searchParams.get('logoUrl') || undefined,
    primaryColor: searchParams.get('primaryColor') || undefined,
    backgroundColor: searchParams.get('backgroundColor') || undefined,
  };
}

export function applySiteCustomization(customization: SiteCustomization): void {
  if (customization.primaryColor) {
    document.documentElement.style.setProperty('--primary-color', customization.primaryColor);
  }
  if (customization.backgroundColor) {
    document.documentElement.style.setProperty('--background', customization.backgroundColor);
  }
}
