# Tailwind Config Rule (CRITICAL)
**NEVER** touch or modify the Tailwind CSS configuration (`tailwind.config.js` or `tailwind.css`).
**NEVER** run the tailwind compiler if it alters existing configurations or CSS unless explicitly asked by the user, as the current template configuration and older tailwind compilation process handles custom templates safely.
Any styling edits should be done within specific components, views, or custom css classes if absolutely required, but core tailwind settings are strictly read-only.
