import glob
import re

def fix_buttons():
    files = glob.glob('*.html') + glob.glob('js/*.js')
    
    for f in files:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()

        def repl(m):
            tag = m.group(1) # '<button' or '<a'
            attrs_before = m.group(2)
            cls = m.group(3)
            attrs_after = m.group(4)
            
            # Don't touch auth tabs which have explicit design
            if 'auth-tab' in cls:
                return m.group(0)

            # Ignore <a> tags that are not buttons
            if tag == '<a' and 'btn-' not in cls:
                return m.group(0)

            # Circular buttons we exclude
            if 'w-16 h-16' in cls or 'w-12 h-12' in cls:
                return m.group(0)

            # Exclude explicit icons with small p-1.5 unless they are standalone?
            # Wait, Task says: "wishlist.html (Apply, More Info, Remove buttons)"
            # "Remove" button in wishlist has `remove-btn p-1.5 ...`. We should change `p-1.5` to `p-3 sm:p-1.5 w-12 h-12 sm:w-8 sm:h-8`? The instructions say "Search project files for ALL buttons... Change to minimum h-12 or py-3 (48px)"
            
            old_cls = cls
            
            # If it has py-2.5
            if re.search(r'\bpy-2\.5\b', cls):
                cls = re.sub(r'\bpy-2\.5\b', 'py-3 sm:py-2.5 h-12 sm:h-10', cls)
            # If it has py-2
            elif re.search(r'\bpy-2\b', cls):
                cls = re.sub(r'\bpy-2\b', 'py-3 sm:py-2 h-12 sm:h-10', cls)
            elif re.search(r'\bpy-3.5\b', cls): # Actually let's not replace py-3.5 since it's already big enough, but the instructions say specifically "py-2, py-2.5, h-10, h-12, etc."
                if 'h-12' not in cls:
                    cls += ' h-12 sm:h-auto'
            elif re.search(r'\bpy-3\b', cls):
                if 'h-12' not in cls and 'auth-btn' not in cls:
                    cls += ' h-12 sm:h-10'
            elif re.search(r'\bp-1\.5\b', cls) and 'remove-btn' in cls:
                cls = re.sub(r'\bp-1\.5\b', 'p-3 sm:p-1.5 w-12 h-12 sm:w-auto sm:h-auto', cls)
            
            # Also cover any remaining button without h-12 or py-3 that could be missed?
            # E.g. search-bar-btn in css/styles.css probably has its height?
            # "search.html (Apply, Save, Info buttons)" - Search button not listed, but "Info buttons" is. 
            # I'll stick to replacing padding directly on in-element classes.

            return f'{tag}{attrs_before}class=\"{cls}\"{attrs_after}'

        new_content = re.sub(r'(<button|<a)([^>]*?)class=\x22([^\x22]+)\x22([^>]*>)', repl, content)
        
        if content != new_content:
            with open(f, 'w', encoding='utf-8') as out_file:
                out_file.write(new_content)
            print(f'Updated buttons in {f}')

fix_buttons()
