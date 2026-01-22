
import os

file_path = r"c:\Users\pc\Documents\nodeJsProject\views\nav\nav-sidebar.ejs"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix Admin Section
# The Admin section is the FIRST one with activeDropdown === 'CRM'
# The CRM section is the SECOND one.
# So we substitute the first and then the second.

# Actually, let's look for specific markers to be safe.
# Admin section has <span>Admin</span>
# CRM section has <span>CRM</span>

# We'll use a more surgical approach.

# Refactored replacements:
# Replace Admin occurrences
admin_search = """<button type="button" class="nav-link group" :class="{'active' : activeDropdown === 'CRM'}"
            @click="activeDropdown === 'CRM' ? activeDropdown = null : activeDropdown = 'CRM'">
            <div class="flex items-center mx-2">
              <iconify-icon icon="solar:target-bold-duotone" class="ml-2" width="18" height="18"></iconify-icon>
              <span
                class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Admin</span>"""

admin_replace = """<button type="button" class="nav-link group" :class="{'active' : activeDropdown === 'admin'}"
            @click="activeDropdown === 'admin' ? activeDropdown = null : activeDropdown = 'admin'">
            <div class="flex items-center mx-2">
              <iconify-icon icon="solar:target-bold-duotone" class="ml-2" width="18" height="18"></iconify-icon>
              <span
                class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Admin</span>"""

if admin_search in content:
    content = content.replace(admin_search, admin_replace)
    print("Updated Admin dropdown button")

# Replace CRM occurrences
crm_search = """<button type="button" class="nav-link group" :class="{'active' : activeDropdown === 'CRM'}"
            @click="activeDropdown === 'CRM' ? activeDropdown = null : activeDropdown = 'CRM'">
            <div class="flex items-center mx-2">
              <iconify-icon icon="solar:target-bold-duotone" class="ml-2" width="18" height="18"></iconify-icon>
              <span class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">CRM</span>"""

crm_replace = """<button type="button" class="nav-link group" :class="{'active' : activeDropdown === 'crm'}"
            @click="activeDropdown === 'crm' ? activeDropdown = null : activeDropdown = 'crm'">
            <div class="flex items-center mx-2">
              <iconify-icon icon="solar:target-bold-duotone" class="ml-2" width="18" height="18"></iconify-icon>
              <span class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">CRM</span>"""

if crm_search in content:
    content = content.replace(crm_search, crm_replace)
    print("Updated CRM dropdown button")

# Fix arrows and sub-menus for Admin (identified by context)
content = content.replace("""<div class="rtl:rotate-180" :class="{'!rotate-90' : activeDropdown === 'CRM'}">""", 
                          """<div class="rtl:rotate-180" :class="{'!rotate-90' : activeDropdown === 'admin'}">""", 1)
content = content.replace("""<ul x-cloak x-show="activeDropdown === 'CRM'\"""", 
                          """<ul x-cloak x-show="activeDropdown === 'admin'\"""", 1)

# Fix arrows and sub-menus for CRM
content = content.replace("""<div class="rtl:rotate-180" :class="{'!rotate-90' : activeDropdown === 'CRM'}">""", 
                          """<div class="rtl:rotate-180" :class="{'!rotate-90' : activeDropdown === 'crm'}">""", 1)
content = content.replace("""<ul x-cloak x-show="activeDropdown === 'CRM'\"""", 
                          """<ul x-cloak x-show="activeDropdown === 'crm'\"""", 1)

# Fix subActive generic markers
count = 0
while """@click=\"subActive === 'error' ? subActive = null : subActive = 'error'\"""" in content:
    labels = ["admin_spaces", "admin_folders", "admin_entities", "admin_fields", "crm_contacts", "crm_opps", "rh_contacts"]
    if count < len(labels):
        label = labels[count]
        content = content.replace("""@click=\"subActive === 'error' ? subActive = null : subActive = 'error'\"""",
                                  f"""@click=\"subActive === '{label}' ? subActive = null : subActive = '{label}'\"""", 1)
        content = content.replace("""x-show=\"subActive === 'error'\"""", f"""x-show=\"subActive === '{label}'\"""", 1)
        content = content.replace(""":icon="(subActive === 'error'""", f""":icon="(subActive === '{label}'""", 1)
        content = content.replace(""":class="{'!rotate-90' : subActive === 'error'}">""", f""":class="{'!rotate-90' : subActive === '{label}'}\">""", 1)
        count += 1
    else:
        break

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Finished. Replaced {count} subActive instances.")
