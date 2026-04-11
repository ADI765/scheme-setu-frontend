import glob
import re

for f in glob.glob('*.html') + glob.glob('js/*.js'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    def repl(m):
        cls = m.group(1)
        if 'p-4 sm:p-6' in cls: return m.group(0) # already patched
        cls = re.sub(r'\bp-6 sm:p-8\b', 'p-4 sm:p-8', cls)
        cls = re.sub(r'\bp-6\b', 'p-4 sm:p-6', cls)
        return f'class="{cls}"'
        
    new_content = re.sub(r'class=\x22([^\x22]+)\x22', repl, content)
    
    if content != new_content:
        with open(f, 'w', encoding='utf-8') as out_file:
            out_file.write(new_content)
        print(f'Updated padding p-6 in {f}')
