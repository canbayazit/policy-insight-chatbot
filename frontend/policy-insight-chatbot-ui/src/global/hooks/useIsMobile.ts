import { useEffect, useState } from "react";

export const useIsMobile = (query = "(max-width: 1023px)") => {
 const [isMobile, setIsMobile] = useState(false);
 const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const media = window.matchMedia(query);    
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    // mount'ta senkronize et
    setIsMobile(media.matches);
    setIsLoading(false);
    if (media.addEventListener) {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    } else {
      //  eski safari
      media.addListener(onChange);
      return () => {       
        media.removeListener(onChange);
      };
    }
  }, [query]);

  return {
    isMobile,
    isLoading,
  };
};