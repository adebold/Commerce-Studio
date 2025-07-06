# PowerShell script to export Dialogflow CX agent configuration for version control

# Default values
$DEFAULT_PROJECT_ID = "eyewearml-conversational-ai"
$DEFAULT_LOCATION = "us-central1"
$DEFAULT_AGENT_NAME = "EyewearML Virtual Style Assistant"
$DEFAULT_OUTPUT_DIR = "./exports"
$DEFAULT_ENV = "development"

# Parse command line arguments or use defaults
$PROJECT_ID = if ($args[0]) { $args[0] } else { $DEFAULT_PROJECT_ID }
$LOCATION = if ($args[1]) { $args[1] } else { $DEFAULT_LOCATION }
$AGENT_NAME = if ($args[2]) { $args[2] } else { $DEFAULT_AGENT_NAME }
$OUTPUT_DIR = if ($args[3]) { $args[3] } else { $DEFAULT_OUTPUT_DIR }
$ENVIRONMENT = if ($args[4]) { $args[4] } else { $DEFAULT_ENV }

# Ensure output directory exists
if (-not (Test-Path $OUTPUT_DIR)) {
    New-Item -Path $OUTPUT_DIR -ItemType Directory | Out-Null
}

Write-Host "Exporting Dialogflow CX agent configuration..."
Write-Host "Project ID: $PROJECT_ID"
Write-Host "Location: $LOCATION"
Write-Host "Agent Name: $AGENT_NAME"
Write-Host "Output Directory: $OUTPUT_DIR"
Write-Host "Environment: $ENVIRONMENT"

# Get the date for versioning
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$OUTPUT_FILE = "$OUTPUT_DIR/agent_export_${ENVIRONMENT}_${TIMESTAMP}.json"

# Create sub-directory for this export
$EXPORT_DIR = "$OUTPUT_DIR/${ENVIRONMENT}_${TIMESTAMP}"
New-Item -Path $EXPORT_DIR -ItemType Directory -Force | Out-Null
New-Item -Path "$EXPORT_DIR/flows" -ItemType Directory -Force | Out-Null
New-Item -Path "$EXPORT_DIR/intents" -ItemType Directory -Force | Out-Null
New-Item -Path "$EXPORT_DIR/entity_types" -ItemType Directory -Force | Out-Null
New-Item -Path "$EXPORT_DIR/webhooks" -ItemType Directory -Force | Out-Null

# Step 1: List agents to find the agent ID
Write-Host "Finding agent ID for '$AGENT_NAME'..."
$AGENT_LIST = gcloud alpha dialogflow cx agents list `
    --project="$PROJECT_ID" `
    --location="$LOCATION" `
    --format="json" | ConvertFrom-Json

# Extract agent ID
$AGENT = $AGENT_LIST | Where-Object { $_.displayName -eq "$AGENT_NAME" }
if (-not $AGENT) {
    Write-Error "Error: Could not find agent with name '$AGENT_NAME'"
    exit 1
}
$AGENT_ID = ($AGENT.name -split '/')[-1]

Write-Host "Found agent ID: $AGENT_ID"

# Step 2: Export the agent configuration
Write-Host "Exporting agent configuration..."
$ExportResult = gcloud alpha dialogflow cx agents export `
    --project="$PROJECT_ID" `
    --location="$LOCATION" `
    --agent="$AGENT_ID" `
    --destination="$OUTPUT_FILE"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Error: Failed to export agent configuration"
    exit 1
}

Write-Host "Agent configuration exported to: $OUTPUT_FILE"

# Step 3: Extract individual components for better version control
Write-Host "Extracting individual components for better version control..."

# Extract flows
Write-Host "Extracting flows..."
$FLOWS = gcloud alpha dialogflow cx flows list `
    --project="$PROJECT_ID" `
    --location="$LOCATION" `
    --agent="$AGENT_ID" `
    --format="json" | ConvertFrom-Json

foreach ($FLOW in $FLOWS) {
    $FLOW_ID = ($FLOW.name -split '/')[-1]
    $FLOW_NAME = $FLOW.displayName -replace " ", "_"
    
    Write-Host "Exporting flow: $FLOW_NAME (ID: $FLOW_ID)"
    
    $FLOW_DETAILS = gcloud alpha dialogflow cx flows get `
        --project="$PROJECT_ID" `
        --location="$LOCATION" `
        --agent="$AGENT_ID" `
        --flow="$FLOW_ID" `
        --format="json" | ConvertFrom-Json
    
    $FLOW_DETAILS | ConvertTo-Json -Depth 100 | Out-File "$EXPORT_DIR/flows/${FLOW_NAME}.json" -Encoding utf8
}

# Extract intents
Write-Host "Extracting intents..."
$INTENTS = gcloud alpha dialogflow cx intents list `
    --project="$PROJECT_ID" `
    --location="$LOCATION" `
    --agent="$AGENT_ID" `
    --format="json" | ConvertFrom-Json

foreach ($INTENT in $INTENTS) {
    $INTENT_ID = ($INTENT.name -split '/')[-1]
    $INTENT_NAME = $INTENT.displayName -replace " ", "_"
    
    Write-Host "Exporting intent: $INTENT_NAME (ID: $INTENT_ID)"
    
    $INTENT_DETAILS = gcloud alpha dialogflow cx intents get `
        --project="$PROJECT_ID" `
        --location="$LOCATION" `
        --agent="$AGENT_ID" `
        --intent="$INTENT_ID" `
        --format="json" | ConvertFrom-Json
    
    $INTENT_DETAILS | ConvertTo-Json -Depth 100 | Out-File "$EXPORT_DIR/intents/${INTENT_NAME}.json" -Encoding utf8
}

# Extract entity types
Write-Host "Extracting entity types..."
$ENTITY_TYPES = gcloud alpha dialogflow cx entity-types list `
    --project="$PROJECT_ID" `
    --location="$LOCATION" `
    --agent="$AGENT_ID" `
    --format="json" | ConvertFrom-Json

foreach ($ENTITY_TYPE in $ENTITY_TYPES) {
    $ENTITY_TYPE_ID = ($ENTITY_TYPE.name -split '/')[-1]
    $ENTITY_TYPE_NAME = $ENTITY_TYPE.displayName -replace " ", "_"
    
    Write-Host "Exporting entity type: $ENTITY_TYPE_NAME (ID: $ENTITY_TYPE_ID)"
    
    $ENTITY_TYPE_DETAILS = gcloud alpha dialogflow cx entity-types get `
        --project="$PROJECT_ID" `
        --location="$LOCATION" `
        --agent="$AGENT_ID" `
        --entity-type="$ENTITY_TYPE_ID" `
        --format="json" | ConvertFrom-Json
    
    $ENTITY_TYPE_DETAILS | ConvertTo-Json -Depth 100 | Out-File "$EXPORT_DIR/entity_types/${ENTITY_TYPE_NAME}.json" -Encoding utf8
}

# Extract webhooks
Write-Host "Extracting webhooks..."
$WEBHOOKS = gcloud alpha dialogflow cx webhooks list `
    --project="$PROJECT_ID" `
    --location="$LOCATION" `
    --agent="$AGENT_ID" `
    --format="json" | ConvertFrom-Json

foreach ($WEBHOOK in $WEBHOOKS) {
    $WEBHOOK_ID = ($WEBHOOK.name -split '/')[-1]
    $WEBHOOK_NAME = $WEBHOOK.displayName -replace " ", "_"
    
    Write-Host "Exporting webhook: $WEBHOOK_NAME (ID: $WEBHOOK_ID)"
    
    $WEBHOOK_DETAILS = gcloud alpha dialogflow cx webhooks get `
        --project="$PROJECT_ID" `
        --location="$LOCATION" `
        --agent="$AGENT_ID" `
        --webhook="$WEBHOOK_ID" `
        --format="json" | ConvertFrom-Json
    
    $WEBHOOK_DETAILS | ConvertTo-Json -Depth 100 | Out-File "$EXPORT_DIR/webhooks/${WEBHOOK_NAME}.json" -Encoding utf8
}

Write-Host "Export complete! Files stored in $EXPORT_DIR"
Write-Host "Full agent export: $OUTPUT_FILE"

# Step 4: Sync to Git repository
$GIT_COMMIT = Read-Host "Would you like to commit these changes to Git? (y/n)"

if ($GIT_COMMIT -eq "y") {
    git add "$EXPORT_DIR"
    git commit -m "Export Dialogflow CX agent configuration - $ENVIRONMENT - $(Get-Date -Format 'yyyy-MM-dd')"
    Write-Host "Changes committed to Git"
}

Write-Host "Done!"
