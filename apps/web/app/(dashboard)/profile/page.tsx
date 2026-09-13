"use client";


import ProfileSettings from "@/components/settings/ProfileSettings";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";


export default function Profile(){
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
      const teamName = user?.user_metadata?.team ?? 'No team';
      const name = user?.user_metadata?.name ?? 'Guest';

    return(
        <div>
            <ProfileSettings displayName={`${name}`} email={`${user?.email}`} role={`${user?.role}`} teamName={`${teamName}`}
            key={"space"}/>
        </div>
    )
}