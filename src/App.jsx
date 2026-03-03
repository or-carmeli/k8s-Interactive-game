import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// FIX #7: use env vars (צור קובץ .env עם המפתחות)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://knzawpdrpahilmohzpbl.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGc..."; // המפתח שלך
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);