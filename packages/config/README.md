# Config Package Boundary

Owns the validated runtime configuration contract. Application and business modules consume parsed public/server config from this package instead of reading `process.env` directly.

Current Phase 1C variables are the Supabase public project URL and publishable key plus the normalized Node environment. Adding a secret or changing the runtime contract requires a separate architecture/security review.
