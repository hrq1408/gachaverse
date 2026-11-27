[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$DiretorioPrivado,
    [string]$RelatorioLocal,
    [ValidateSet('pt-BR','en','es','todos')][string]$Idioma = 'todos'
)
$ErrorActionPreference = 'Stop'
$checkout = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$root = (Get-Item -LiteralPath $DiretorioPrivado).FullName
$relative = [IO.Path]::GetRelativePath($checkout, $root)
if ($relative -eq '.' -or !($relative -match '^\.\.[\\/]' -or [IO.Path]::IsPathRooted($relative))) {
    throw 'A rotina exige um diretório privado fora do checkout.'
}
function Get-Report {
    if ($RelatorioLocal) { return Get-Content -LiteralPath $RelatorioLocal -Raw | ConvertFrom-Json }
    $credentialRequest = @('protocol=https','host=github.com','path=hrq1408/gachaverse-intelligence.git','','') -join [char]10
    $env:GIT_TERMINAL_PROMPT = '0'
    $env:GCM_INTERACTIVE = 'Never'
    $secret = $credentialRequest | git credential fill 2>$null | Where-Object { $_.StartsWith('password=') } | Select-Object -First 1
    if (!$secret) { throw 'Credencial GitHub autorizada indisponível para leitura privada.' }
    $headers = @{ Authorization = 'Bearer ' + $secret.Substring(9); 'User-Agent' = 'GachaVerse editorial' }
    $repo = 'https://api.github.com/repos/hrq1408/gachaverse-intelligence'
    $metadata = Invoke-RestMethod $repo -Headers $headers -TimeoutSec 30
    if (!$metadata.private -or $metadata.id -ne 1473633500) { throw 'Repositório privado inesperado.' }
    $runs = (Invoke-RestMethod "$repo/actions/workflows/432079726/runs?status=success&branch=main&per_page=5" -Headers $headers -TimeoutSec 30).workflow_runs
    foreach ($run in $runs) {
        if ([datetimeoffset]$run.created_at -lt [datetimeoffset]::UtcNow.AddDays(-3)) { continue }
        $artifacts = (Invoke-RestMethod "$repo/actions/runs/$($run.id)/artifacts" -Headers $headers -TimeoutSec 30).artifacts
        foreach ($artifact in $artifacts) {
            if ($artifact.expired -or $artifact.size_in_bytes -gt 10MB) { continue }
            $download = Invoke-WebRequest "$repo/actions/artifacts/$($artifact.id)/zip" -Headers $headers -TimeoutSec 40
            $zip = [IO.Compression.ZipArchive]::new($download.RawContentStream)
            try {
                $entry = $zip.Entries | Where-Object { $_.Name -eq 'inteligencia-editorial.json' -and $_.Length -le 10MB } | Select-Object -First 1
                if (!$entry) { continue }
                $reader = [IO.StreamReader]::new($entry.Open())
                try { return $reader.ReadToEnd() | ConvertFrom-Json } finally { $reader.Dispose() }
            } finally { $zip.Dispose() }
        }
    }
    return $null
}
$log = Join-Path $root 'execucoes.log'
$lock = [IO.File]::Open((Join-Path $root 'rotina.lock'),'OpenOrCreate','ReadWrite','None')
try {
    $current = Get-Report
    $eligible = @($current.queue | Where-Object { $_.evidence -eq 'hipótese editorial' -and $_.action -eq 'nova pauta' -and $_.officialSources.Count -gt 0 })
    $intake = Join-Path $root 'pautas'
    $null = New-Item -ItemType Directory -Path $intake -Force
    $briefs = @(Get-ChildItem -LiteralPath $intake -Directory)
    $pending = @($eligible | Where-Object { $_.id -notin $briefs.Name })
    if ($pending.Count -gt 0) {
        $scratch = Join-Path $root ('seletor-' + [guid]::NewGuid().ToString('N'))
        $null = New-Item -ItemType Directory -Path $scratch
        $report = Join-Path $scratch 'candidatas.json'
        @{ queue = @($pending | Select-Object id,game,slug,action) } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $report -Encoding utf8
        Push-Location $checkout
        try {
            & pnpm exec tsx scripts/editorial-engine.ts --select --report $report --out $scratch
            if ($LASTEXITCODE -ne 0) { throw 'Falha no seletor editorial.' }
        } finally { Pop-Location }
        $selected = Get-ChildItem -LiteralPath $scratch -Recurse -Filter pauta.json | Select-Object -First 1
        if ($selected) {
            $pauta = Get-Content -LiteralPath $selected.FullName -Raw | ConvertFrom-Json
            $chosen = $pending | Where-Object id -eq $pauta.id | Select-Object -First 1
            if (!$chosen -or $pauta.id -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$') { throw 'Pauta selecionada fora do conjunto permitido.' }
            $place = Join-Path $intake $pauta.id
            $null = New-Item -ItemType Directory -Path $place
            Copy-Item -LiteralPath $selected.FullName -Destination (Join-Path $place 'pauta.json')
            @{ editorialId = $pauta.slug; reviewedSources = $false; facts = @(); sources = @($chosen.officialSources); approvedOriginal = '' } |
                ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $place 'briefing.json') -Encoding utf8
            Add-Content -LiteralPath $log -Value "$(Get-Date -Format o) Pauta preparada para revisão."
        }
    }
    $drafted = 0
    $languages = if ($Idioma -eq 'todos') { @('pt-BR','en','es') } else { @($Idioma) }
    foreach ($item in $briefs) {
        $briefing = Join-Path $item.FullName 'briefing.json'
        if (!(Test-Path -LiteralPath $briefing)) { continue }
        $notes = Get-Content -LiteralPath $briefing -Raw | ConvertFrom-Json
        if ($notes.reviewedSources -ne $true) { continue }
        foreach ($language in $languages) {
            if ($language -eq 'pt-BR' -and $notes.approvedOriginal) { continue }
            if ($language -ne 'pt-BR' -and !$notes.approvedOriginal) { continue }
            $revision = (Get-FileHash -LiteralPath $briefing -Algorithm SHA256).Hash.ToLowerInvariant()
            & (Join-Path $PSScriptRoot 'redigir-editorial.ps1') -Pauta (Join-Path $item.FullName 'pauta.json') -Briefing $briefing -Saida $item.FullName -Idioma $language -Revisao $revision
            $drafted++
        }
    }
    Add-Content -LiteralPath $log -Value "$(Get-Date -Format o) Rotina concluída. Candidatas públicas: $($eligible.Count). Briefings aptos em $Idioma = $drafted."
} catch {
    Add-Content -LiteralPath $log -Value "$(Get-Date -Format o) Rotina interrompida antes da publicação."
    throw
} finally { $lock.Dispose() }
