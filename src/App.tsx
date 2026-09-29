import { useEffect, useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { ProgramPage } from "./components/ProgramPage";
import { LoginPage } from "./components/LoginPage";
import { MobileLoginPage } from "./components/LoginPage/MobileLoginPage";
import { OwnerDashboard } from "./components/OwnerDashboard";
import { StaffDashboard } from "./components/StaffDashboard";
import { CustomerOrderApp } from "./components/CustomerOrderApp";
import { useAuth } from "./lib/useAuth";
import { useIsMobile } from "./lib/useIsMobile";

// Desain Figma dibuat untuk lebar 1440px.
const DESIGN_WIDTH = 1440;

function App() {
  const [zoom, setZoom] = useState(1);
  const { profile, loading } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    const updateZoom = () => {
      const scale = window.innerWidth / DESIGN_WIDTH;
      setZoom(Math.min(scale, 1));
    };

    updateZoom();
    window.addEventListener("resize", updateZoom);
    return () => window.removeEventListener("resize", updateZoom);
  }, []);

  // Link dari QR code berbentuk: https://situs-anda.com/?menu=<umkm_id>
  const params = new URLSearchParams(window.location.search);
  const umkmIdFromQr = params.get("menu");

  if (umkmIdFromQr) {
    return <CustomerOrderApp umkmId={umkmIdFromQr} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#9a8a78]">
        Memuat...
      </div>
    );
  }

  if (profile?.role === "owner") {
    return <OwnerDashboard profile={profile} />;
  }

  if (profile?.role === "staff") {
    return <StaffDashboard profile={profile} />;
  }

  return (
    <>
      <div style={{ zoom }}>
        <LandingPage />
        <ProgramPage />
        {!isMobile && <LoginPage />}
      </div>
      {isMobile && <MobileLoginPage />}
    </>
  );
}

export default App;
