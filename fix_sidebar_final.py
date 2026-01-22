
import os

file_path = r"c:\Users\pc\Documents\nodeJsProject\views\nav\nav-sidebar.ejs"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Admin Section
# Search for Admin header to find context
admin_search_header = "<span>Admin</span>"
# We'll replace the first occurrence of generic CRM button that precedes Admin text
# This is tricky with simple replace, so we use a more contextual approach.

# Segment the file into sections
sections = content.split('<h2')

# The Admin section is typically the one with "Admin" span
for i in range(len(sections)):
    if "<span>Admin</span>" in sections[i]:
        # Fix dropdown
        sections[i] = sections[i].replace("activeDropdown === 'CRM'", "activeDropdown === 'admin'")
        sections[i] = sections[i].replace("activeDropdown = 'CRM'", "activeDropdown = 'admin'")
        # Fix subActive keys in this section
        sections[i] = sections[i].replace("subActive === 'error'", "subActive === 'admin_sub'") # placeholder or specific
        # Actually better to target specific sub-menus
        if "Spaces" in sections[i]:
            sections[i] = sections[i].replace("subActive === 'error'", "subActive === 'admin_spaces'")
        
# Re-segment for more granular replacement if needed or just use global replacements for CRM/RH if they are unique enough
content = "<h2".join(sections)

# 2. Global replacements for CRM and RH to lowercase/unique names to avoid overlap with 'CRM' literal
# But we must be careful not to break the Admin section we just fixed (it now has 'admin')

# Specific replacements for CRM section (which still has 'CRM')
content = content.replace("<span>CRM</span>", "____CRM_MARKER____")
content = content.replace("<span>Admin</span>", "____ADMIN_MARKER____")

# Fix CRM section specifically
sections = content.split('<li class="menu nav-item -mx-4 mb-2">')
for i in range(len(sections)):
    if "____CRM_MARKER____" in sections[i]:
        sections[i] = sections[i].replace("activeDropdown === 'CRM'", "activeDropdown === 'crm'")
        sections[i] = sections[i].replace("activeDropdown = 'CRM'", "activeDropdown = 'crm'")
        # SubActive for CRM
        sections[i] = sections[i].replace("subActive === 'error'", "subActive === 'crm_sub'")

content = '<li class="menu nav-item -mx-4 mb-2">'.join(sections)

# Restore markers
content = content.replace("____CRM_MARKER____", "<span>CRM</span>")
content = content.replace("____ADMIN_MARKER____", "<span>Admin</span>")

# Final Polish: generic error subActive across the whole file to be specific
# We can do this based on the parent labels found in previous reads
# Admin: Spaces, Folders, Entities, Fields
# CRM: Contacts, Opportunités
# RH: Contacts

# Very surgical replacements for subActive
content = content.replace("subActive === 'admin_sub'", "subActive === 'admin_general'") # fallback

# Manual strings from previous view_file
content = content.replace("""@click="subActive === 'error' ? subActive = null : subActive = 'error'\"""", """@click="subActive = (subActive === $el.innerText.trim().toLowerCase().replace(' ', '_') ? null : $el.innerText.trim().toLowerCase().replace(' ', '_'))\"""")
# Wait, let's keep it simple with specific ones.

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Sidebar fix script executed.")
