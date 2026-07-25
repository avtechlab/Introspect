import re

css_path = 'css/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Login card width
content = re.sub(
    r'\.login-card\s*\{[\s]*width:\s*420px;',
    '.login-card {\n    width: 100%;\n    max-width: 420px;',
    content
)

# 2. Insert Global Forms before .main-header or after body
global_forms = """
/* =====================
   Global Form Controls
===================== */

.form-label,
.input-group label,
.reflection-form label,
#nivedanForm label,
.input-label {
    display: block;
    color: #D8E8FF;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
}

.form-control,
.input-group input,
.input-group select,
.reflection-form textarea,
.reflection-form select,
.nivedan-input,
.nivedan-textarea,
#bhaavferiHours,
#reason {
    width: 100%;
    padding: 14px;
    border-radius: 10px;
    border: 1px solid rgba(56,189,248,0.25);
    background: rgba(6,20,37,0.8);
    color: #EDF6FF;
    outline: none;
    font-family: 'Poppins', system-ui, sans-serif;
    font-size: 15px;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.form-control:focus,
.input-group input:focus,
.input-group select:focus,
.reflection-form textarea:focus,
.reflection-form select:focus,
.nivedan-input:focus,
.nivedan-textarea:focus,
#bhaavferiHours:focus,
#reason:focus {
    border-color: #38BDF8;
    box-shadow: 0 0 12px rgba(56,189,248,0.25);
}

.form-control::placeholder,
.input-group input::placeholder,
.reflection-form textarea::placeholder,
.nivedan-input::placeholder,
.nivedan-textarea::placeholder,
#bhaavferiHours::placeholder,
#reason::placeholder {
    color: rgba(175, 196, 221, 0.5);
}

"""
content = re.sub(
    r'(\/\* =====================\s*Header\s*===================== \*\/)',
    global_forms + r'\1',
    content
)

# 3. Clean up duplicates
# .input-group label
content = re.sub(r'\.input-group label\s*\{[^}]+\}', '', content)

# .input-group input and focus
content = re.sub(r'\.input-group input\s*\{[^}]+\}', '', content)
content = re.sub(r'\.input-group input:focus\s*\{[^}]+\}', '', content)

# .input-group select
content = re.sub(r'\.input-group select\s*\{[^}]+\}', '.input-group select {\n    cursor: pointer;\n}', content)
content = re.sub(r'\.input-group select:focus\s*\{[^}]+\}', '', content)

# .reflection-form label
content = re.sub(r'\.reflection-form label\s*\{[^}]+\}', '.reflection-form label {\n    margin-top: 20px;\n}', content)

# .reflection-form textarea and focus
content = re.sub(r'\.reflection-form textarea\s*\{[^}]+\}', '.reflection-form textarea {\n    resize: none;\n}', content)
content = re.sub(r'\.reflection-form textarea:focus\s*\{[^}]+\}', '', content)

# .reflection-form select
content = re.sub(r'\.reflection-form select\s*\{[^}]+\}', '.reflection-form select {\n    margin-bottom: 20px;\n    cursor: pointer;\n}', content)

# #nivedanForm label
content = re.sub(r'#nivedanForm label\s*\{[^}]+\}', '', content)

# .radio-group label
content = re.sub(
    r'(\.radio-group label\s*\{[^}]+)(^\s*cursor:\s*pointer;)([\s\S]*?\})',
    r'\1\2\n    padding: 8px 0;\3',
    content, flags=re.MULTILINE
)

# #bhaavferiHours, #reason
content = re.sub(r'#bhaavferiHours,\s*#reason\s*\{[^}]+\}', '', content)
content = re.sub(r'#bhaavferiHours::placeholder,\s*#reason::placeholder\s*\{[^}]+\}', '', content)

# .input-label
content = re.sub(r'\.input-label\s*\{[^}]+\}', '', content)

# .nivedan-input, .nivedan-textarea and focus/placeholder
content = re.sub(r'\.nivedan-input,\s*\.nivedan-textarea\s*\{[^}]+\}', '', content)
content = re.sub(r'\.nivedan-input:focus,\s*\.nivedan-textarea:focus\s*\{[^}]+\}', '', content)
content = re.sub(r'\.nivedan-input::placeholder,\s*\.nivedan-textarea::placeholder\s*\{[^}]+\}', '', content)

# Remove multiple blank lines created by deletion
content = re.sub(r'\n{4,}', '\n\n', content)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modification complete.")
