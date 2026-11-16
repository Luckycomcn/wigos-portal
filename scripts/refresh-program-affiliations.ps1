# Download every member of the WMO programme/network register, including deprecated codes.
$ErrorActionPreference = 'Stop'
$response = Invoke-WebRequest 'https://codes.wmo.int/wmdr/ProgramAffiliation?_format=rdf' -Headers @{ Accept = 'application/rdf+xml' }
[xml]$register = $response.Content
$ns = [System.Xml.XmlNamespaceManager]::new($register.NameTable)
$ns.AddNamespace('skos', 'http://www.w3.org/2004/02/skos/core#')
$ns.AddNamespace('rdfs', 'http://www.w3.org/2000/01/rdf-schema#')
$codes = @($register.SelectNodes('//skos:member/skos:Concept', $ns) | ForEach-Object {
    $id = $_.SelectSingleNode('skos:notation', $ns).InnerText
    $label = $_.SelectSingleNode('rdfs:label', $ns).InnerText
    if ($id) {
        $title = if ($label -and $label -ne $id) { "$id — $label" } else { $id }
        [PSCustomObject]@{ id = $id; title = $title }
    }
} | Sort-Object id)
if ($codes.Count -lt 100 -or 'GCWCryoNet' -notin $codes.id) { throw 'Incomplete WMO register response; existing snapshot preserved.' }
$path = Join-Path $PSScriptRoot '../src/data/programAffiliations.json'
$codes | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath $path -Encoding utf8NoBOM
Write-Output "Refreshed $($codes.Count) programme affiliations."
