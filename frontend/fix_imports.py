import os
import re

directory = r'c:\Users\ASUS\Documents\intelliclaim new\intelliclaim\frontend\src'
pattern = re.compile(r'from\s+[\'"](@?[a-zA-Z0-9_\-]+(?:/[a-zA-Z0-9_\-]+)*)@[A-Za-z0-9\.\-]+[\'"]')

# also handle imports like `import { format } from "date-fns@3.6.0"` -> `from "date-fns"`
# pattern handles optional @ scope, then package name with possible slashes, then @version
count = 0
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = pattern.sub(r'from "\1"', content)
            
            if new_content != content:
                print(f"Fixed {filepath}")
                count += 1
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)

print(f"Fixed {count} files.")
