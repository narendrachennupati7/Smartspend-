$ErrorActionPreference = 'Stop'

$mavenRoot = Join-Path $env:TEMP 'smartspend-maven-run'
$mavenArchive = Join-Path $env:TEMP 'smartspend-maven-run.zip'
$mavenCommand = Join-Path $mavenRoot 'apache-maven-3.9.9\bin\mvn.cmd'
$mavenUrl = 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip'

if (!(Test-Path -LiteralPath $mavenCommand)) {
    if (!(Test-Path -LiteralPath $mavenArchive)) {
        curl.exe -L --fail --silent --show-error $mavenUrl -o $mavenArchive
        if ($LASTEXITCODE -ne 0) {
            throw 'Maven download failed.'
        }
    }

    if (!(Test-Path -LiteralPath $mavenRoot)) {
        New-Item -ItemType Directory -Path $mavenRoot | Out-Null
    }
    Expand-Archive -LiteralPath $mavenArchive -DestinationPath $mavenRoot
}

$env:JAVA_HOME = 'C:\Program Files\Java\jdk1.8.0_91'
if (!(Test-Path -LiteralPath (Join-Path $env:JAVA_HOME 'bin\javac.exe'))) {
    throw "JDK not found at $env:JAVA_HOME. Install Java 8 or update the JAVA_HOME path in this task."
}

$env:PATH = "$(Join-Path $env:JAVA_HOME 'bin');$env:PATH"
$env:MAVEN_OPTS = '-Djavax.net.ssl.trustStoreType=Windows-ROOT'
$projectRoot = Split-Path -Parent $PSScriptRoot

Push-Location $projectRoot
try {
    & $mavenCommand spring-boot:run '-Dspring-boot.run.profiles=demo'
    if ($LASTEXITCODE -ne 0) {
        throw "SmartSpend stopped with exit code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
}
