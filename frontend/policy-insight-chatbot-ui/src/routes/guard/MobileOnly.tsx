import { Navigate } from "react-router-dom";
import { useIsMobile } from "../../global/hooks/useIsMobile";

export default function MobileOnly({ children }: { children: React.ReactNode }) {
  const { isMobile, isLoading }= useIsMobile();  
  console.log(isMobile)
  if (isLoading) return null; 
  if (!isMobile) return <Navigate to="/" replace />;
  return <>{children}</>;
}