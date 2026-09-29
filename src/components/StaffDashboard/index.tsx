import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Profile } from "../../lib/useAuth";
import { OrderManagement } from "../OrderManagement";
import { ManualOrder } from "../ManualOrder";

export const StaffDashboard = ({ profile }: { profile: Profile }) => {
  const [activeTab, setActiveTab] = useState<"pesanan" | "manual">("pesanan");

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#fff8f1]">
      <header className="border-b border-[#f0d9bd] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xl font-bold text-[#e66307] [font-family:'Montserrat-Bold',Helvetica]">
              Dashboard Staff
            </p>
            <p className="text-sm text-[#9a8a78]">Halo, {profile.nama}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-[#fe972f] px-5 py-2 text-sm font-semibold text-[#fe972f] transition-colors hover:bg-[#fe972f] hover:text-white"
          >
            Keluar
          </button>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-6 px-4 sm:gap-8 sm:px-6">
          {(["pesanan", "manual"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "border-[#fe972f] text-[#e66307]"
                  : "border-transparent text-[#9a8a78] hover:text-[#e66307]"
              }`}
            >
              {tab === "pesanan" ? "Pesanan" : "Input Manual"}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {activeTab === "pesanan" && <OrderManagement profile={profile} />}
        {activeTab === "manual" && (
          <ManualOrder profile={profile} onCreated={() => setActiveTab("pesanan")} />
        )}
      </main>
    </div>
  );
};
