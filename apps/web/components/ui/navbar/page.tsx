"use client";

import { Bell, Zap, Sparkles } from "lucide-react";
import SearchBar from "../searchbar/page";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import LogoutButton from "../logout/page";
import ThemeToggle from "../theme-toggle/page";
import HoverTooltip from "../hover-tip/page";

export default function Navbar() {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    load();
  }, [supabase]);

  return (
    <header className="w-full border-b border-border bg-transparent px-5 shadow-lg backdrop-blur-xl backdrop-saturate-150">
      <nav className="flex h-16 w-full items-center justify-between px-6 md:px-8">

        <div className="flex flex-1 items-center">
          <SearchBar />
        </div>

        <div className="ml-8 flex items-center gap-5">
          <HoverTooltip
  content={
    <div>
      
      <p className="text-text-muted">Open workflow to access</p>
    </div>
  }
>
  <span
    
    className="flex items-center gap-1.5 text-xs font-medium text-brand-orange bg-brand-orange/10 border border-brand-orange/25 rounded-full px-3 py-1.5 hover:bg-brand-orange/15 transition-colors cursor-pointer"
  >
    <Sparkles size={13} />
    AI Copilot
  </span>
</HoverTooltip>

          <a href="/notifications">
            <button className="text-text-muted transition-colors hover:text-text-primary">
              <Bell size={18} />
            </button>
          </a>

          <a href="/engine">
            <button className="text-text-muted transition-colors hover:text-text-primary">
              <Zap size={18} />
            </button>
          </a>

          <span className="text-sm text-text-muted">
            {user?.user_metadata?.full_name ??
              user?.email ??
              "Guest"}
          </span>

          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-2">
            <span className="text-xs font-medium text-text-primary">
              {(user?.user_metadata?.full_name ??
                user?.email ??
                "G")[0].toUpperCase()}
            </span>
          </div>
          <ThemeToggle/>
          <span><LogoutButton/></span>
        </div>

      </nav>
    </header>
  );
}