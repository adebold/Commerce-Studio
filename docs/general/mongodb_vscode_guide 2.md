# Using MongoDB for VS Code Extension

The MongoDB for VS Code extension provides a graphical interface for connecting to MongoDB Atlas directly within VS Code. This can be an easier way to validate your MongoDB Atlas data compared to using command-line scripts.

## Installation

1. Open VS Code
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window or pressing `Ctrl+Shift+X`
3. Search for "MongoDB for VS Code"
4. Click the Install button

## Connecting to MongoDB Atlas

### Step 1: Open the MongoDB Extension

1. Click on the MongoDB icon in the Activity Bar (it looks like a leaf)
2. If you don't see the MongoDB icon, click on the Extensions icon and make sure the MongoDB extension is installed and enabled

### Step 2: Add a Connection

1. Click on "Add Connection" in the MongoDB view
2. Select "Connect with Connection String"
3. Enter your MongoDB Atlas connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `<username>`, `<password>`, and `<cluster>` with your actual values
4. Click "Connect"

### Step 3: Explore Your Data

1. Once connected, you'll see your MongoDB Atlas cluster in the MongoDB view
2. Expand the cluster to see the available databases
3. Expand a database to see its collections
4. Right-click on a collection and select "View Documents" to see the data in that collection

## Using Advanced Connection Options

### Authentication with API Keys

To connect using API keys:

1. Click on "Add Connection" in the MongoDB view
2. Select "Connect with Connection String"
3. Enter a connection string with AWS authentication:
   ```
   mongodb+srv://<public_key>:<private_key>@<cluster>.mongodb.net/?authMechanism=MONGODB-AWS&authSource=$external
   ```
4. Click "Connect"

### Authentication with X.509 Certificates

To connect using X.509 certificates:

1. Click on "Add Connection" in the MongoDB view
2. Select "Connect with Connection String"
3. Enter a connection string with X.509 authentication:
   ```
   mongodb+srv://<cluster>.mongodb.net/?authMechanism=MONGODB-X509&tls=true&tlsCertificateKeyFile=<path_to_certificate>
   ```
4. Click "Connect"

### Authentication with GCP Service Account

To connect using a GCP service account:

1. First, make sure you've created a GCP service account and downloaded the key file (see `gcp_service_account_instructions.md`)
2. Click on "Add Connection" in the MongoDB view
3. Select "Connect with Connection String"
4. Enter a connection string with MONGODB-X509 authentication:
   ```
   mongodb+srv://<cluster>.mongodb.net/?authMechanism=MONGODB-X509&tls=true&tlsCertificateKeyFile=<path_to_key_file>
   ```
5. Click "Connect"

## Troubleshooting Connection Issues

If you encounter connection issues:

1. **Check Connection String**: Verify that your connection string is correct. You can get the correct connection string from the MongoDB Atlas dashboard.

2. **Network Access**: Ensure your IP address is whitelisted in MongoDB Atlas Network Access settings.

3. **Credentials**: Double-check your username and password or API keys.

4. **Cluster Name**: Verify the cluster name in the connection string.

5. **Extension Logs**: Check the MongoDB extension logs for more detailed error information:
   - Open the Command Palette (`Ctrl+Shift+P`)
   - Type "MongoDB: Show Extension Logs" and select it

## Validating the Apify to MongoDB Migration

To validate the Apify to MongoDB migration:

1. Connect to your MongoDB Atlas cluster using the MongoDB for VS Code extension
2. Navigate to the `eyewear_ml` database (or whatever database name was used for the migration)
3. Check for collections like `products`, `frames`, `images`, etc.
4. View documents in these collections to verify that the data was imported correctly
5. Run queries to count documents and check for Apify-related fields

Example queries you can run in the MongoDB Playground:

```javascript
// Count documents in the products collection
db.products.countDocuments()

// Find products with source="apify"
db.products.find({ source: "apify" }).limit(10)

// Get distribution of brands
db.products.aggregate([
  { $group: { _id: "$brand", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
])
```

## Advantages of Using the MongoDB for VS Code Extension

- Graphical interface for exploring databases and collections
- Built-in query editor with syntax highlighting and auto-completion
- Ability to view, edit, and delete documents
- Support for running aggregation pipelines
- Integration with VS Code's authentication and credential storage