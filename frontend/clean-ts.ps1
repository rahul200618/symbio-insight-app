$files = Get-ChildItem -Recurse -Path "src" -Include "*.jsx","*.js" -File

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Remove import type statements
    $content = $content -replace "import type \{[^\}]+\} from [^;]+;?\s*\r?\n?", ""
    
    # Remove export interface declarations (multiline)
    $content = $content -replace "(?s)export interface [^\{]+\{[^\}]*\}\s*", ""
    
    # Remove interface declarations (multiline)  
    $content = $content -replace "(?s)interface [^\{]+\{[^\}]*\}\s*", ""
    
    # Remove ': Type' patterns from function parameters and variables
    $content = $content -replace "\s*:\s*React\.DragEvent", ""
    $content = $content -replace "\s*:\s*React\.MouseEvent", ""
    $content = $content -replace "\s*:\s*Message\b", ""
    $content = $content -replace "\s*:\s*SequenceMetadata\b", ""
    $content = $content -replace ",\s*e:\s*React\.\w+", ", e"
    $content = $content -replace "\(([^)]+):\s*\w+\)", '($1)'
    
    # Remove 'as const' and 'as Type' patterns
    $content = $content -replace " as const", ""
    $content = $content -replace " as \w+", ""
    
    # Remove type annotations in object properties  
    $content = $content -replace "const (\w+):\s*\w+\s*=", 'const $1 ='
    
    # Fix Number() wrapping - change value(x) to value: Number(x)
    $content = $content -replace "value\(([^)]+)\)", 'value: Number($1)'
    
    # Fix object shorthand that got mangled - name.name to name: file.name
    $content = $content -replace "name\.name,", "name: file.name,"
    $content = $content -replace "sizeBytes\.size,", "sizeBytes: file.size,"
    
    # Remove useState<Type>, useRef<Type> generic parameters
    $content = $content -replace "useState<[^>]+>", "useState"
    $content = $content -replace "useRef<[^>]+>", "useRef"
    
    # Remove optional type annotations
    $content = $content -replace "\?\s*:", ":"
    
    # Remove : { } type annotations
    $content = $content -replace ":\s*\{[^\}]+\}", ""
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "Cleaned all TypeScript syntax from JSX/JS files!"


