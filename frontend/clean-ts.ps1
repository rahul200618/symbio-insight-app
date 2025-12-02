$files = Get-ChildItem -Recurse -Path "src" -Include "*.jsx","*.js" -File

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Remove import type statements
    $content = $content -replace "import type \{[^\}]+\} from [^;]+;?\s*\r?\n?", ""
    
    # Remove export interface declarations (multiline)
    $content = $content -replace "export interface [^\{]+\{[^\}]*\}\s*", ""
    
    # Remove interface declarations (multiline)  
    $content = $content -replace "interface [^\{]+\{[^\}]*\}\s*", ""
    
    # Remove type annotations in function signatures
    $content = $content -replace "\}\):\s*\w+Props", "})"
    
    # Remove type annotations from destructured parameters
    $content = $content -replace "(\{[^\}]+\})\s*:\s*\w+Props", '$1'
    
    # Remove type annotations from function parameters
    $content = $content -replace ":\s*(string|number|boolean|any|void|ReactNode|ViewType|SequenceMetadata\[\]|File|HTMLElement|\w+Props)", ""
    
    # Remove type casts
    $content = $content -replace " as (ViewType|HTMLElement|keyof typeof \w+)", ""
    
    # Remove optional type annotations
    $content = $content -replace "\?\s*:", ":"
    
    # Remove generic type parameters from useState, etc
    $content = $content -replace "useState<[^>]+>", "useState"
    $content = $content -replace "useRef<[^>]+>", "useRef"
    
    # Remove : { } type annotations
    $content = $content -replace ":\s*\{[^\}]+\}", ""
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "Cleaned all TypeScript syntax from JSX/JS files!"

