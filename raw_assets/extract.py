import re
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract and replace style
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if style_match:
    style_content = style_match.group(1).strip()
    with open('assets/css/style.css', 'w', encoding='utf-8') as f:
        f.write(style_content)
    content = content[:style_match.start()] + '<link rel="stylesheet" href="assets/css/style.css">' + content[style_match.end():]

# Extract and replace script
# Only the custom script block at the end, not the GSAP CDNs.
# The custom script starts with <script>\n    document.addEventListener...
script_match = re.search(r'<script>(.*?document\.addEventListener\("DOMContentLoaded".*?)</script>', content, re.DOTALL)
if script_match:
    script_content = script_match.group(1).strip()
    with open('assets/js/main.js', 'w', encoding='utf-8') as f:
        f.write(script_content)
    content = content[:script_match.start()] + '<script src="assets/js/main.js"></script>' + content[script_match.end():]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Extraction complete')
