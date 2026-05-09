"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
// supabaseClient.ts
var supabase_js_1 = require("@supabase/supabase-js");
var _env_1 = require("@env");
// Create the Supabase client
exports.supabase = (0, supabase_js_1.createClient)(_env_1.SUPABASE_URL, _env_1.SUPABASE_ANON_KEY, {
    auth: {
        persistSession: false,
    },
});
