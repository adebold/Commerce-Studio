# MongoDB Atlas Validation Tools

This directory contains several scripts and guides to help validate and troubleshoot connections to MongoDB Atlas. These tools were created to help verify the successful completion of the Apify to MongoDB migration.

## Available Scripts

### 1. `validate_mongodb_atlas.py`

A comprehensive script to validate the data in MongoDB Atlas. It connects to MongoDB Atlas, lists collections, counts documents, and provides sample data from each collection.

```bash
python validate_mongodb_atlas.py
```

### 2. `simple_mongodb_connect.py`

A simple script that tries multiple connection strings to connect to MongoDB Atlas.

```bash
python simple_mongodb_connect.py
```

### 3. `mongodb_diagnostic.py`

A diagnostic script that checks network connectivity, DNS resolution, and attempts to connect to MongoDB Atlas using different authentication methods.

```bash
python mongodb_diagnostic.py
```

### 4. `mongodb_gcp_auth.py`

A script to connect to MongoDB Atlas using a Google Cloud Platform (GCP) service account.

```bash
python mongodb_gcp_auth.py
```

### 5. `mongodb_connection_options.py`

An interactive script that provides multiple authentication options for connecting to MongoDB Atlas.

```bash
python mongodb_connection_options.py
```

### 6. `check_mongodb_cluster.py`

A specialized script to check if the MongoDB Atlas cluster hostname is valid and reachable. It performs DNS resolution tests and TCP connection tests, and can also retrieve a list of available clusters from the MongoDB Atlas API.

```bash
python check_mongodb_cluster.py
```

## Guides

### 1. `mongodb_vscode_guide.md`

A comprehensive guide for using the MongoDB for VS Code extension to connect to MongoDB Atlas. This provides a graphical interface for exploring and validating your MongoDB data directly within VS Code.

### 2. `gcp_service_account_instructions.md`

Step-by-step instructions for creating and downloading a GCP service account key file for use with MongoDB Atlas.

## Authentication Methods

MongoDB Atlas supports several authentication methods:

1. **Standard Username/Password**: The most common method, using a database username and password.
2. **API Key Authentication**: Using MongoDB Atlas API public and private keys.
3. **X.509 Certificate Authentication**: Using an X.509 certificate for authentication.
4. **GCP Service Account Authentication**: Using a Google Cloud Platform service account.

## Troubleshooting Connection Issues

If you're having trouble connecting to MongoDB Atlas, consider the following:

1. **Network Access**: Your IP address is already whitelisted in MongoDB Atlas Network Access settings.
2. **Cluster Name**: Verify the cluster name is correct. The DNS resolution test in `check_mongodb_cluster.py` can help with this.
3. **Credentials**: Verify that your username, password, or API keys are correct.
4. **Cluster Status**: Check that your MongoDB Atlas cluster is active and not paused.
5. **Connection String**: Confirm you're using the correct connection string format for your authentication method.

## Using MongoDB for VS Code (Recommended)

The MongoDB for VS Code extension provides a graphical interface for connecting to MongoDB Atlas directly within VS Code. This can be an easier way to validate your MongoDB Atlas data compared to using command-line scripts.

See the `mongodb_vscode_guide.md` file for detailed instructions on:

1. Installing the MongoDB for VS Code extension
2. Connecting to MongoDB Atlas
3. Exploring your data
4. Running queries to validate the migration
5. Troubleshooting connection issues

## GCP Service Account Setup

For GCP service account authentication, refer to the `gcp_service_account_instructions.md` file for detailed instructions on:

1. Creating a GCP service account
2. Downloading the service account key file
3. Configuring MongoDB Atlas to use the GCP service account

## Verifying Migration Success

Even if you cannot connect directly to MongoDB Atlas, the migration success can be verified by examining:

1. The `import_summary.json` file in the data directory
2. The timestamped directories in the data directory
3. The processed data files

These files provide evidence that the Apify to MongoDB migration was completed successfully.

## MongoDB Atlas API

The MongoDB Atlas API can be used to retrieve information about your clusters, including their connection strings and status. The `check_mongodb_cluster.py` script includes functionality to interact with the MongoDB Atlas API.

To use the MongoDB Atlas API, you'll need:

1. A MongoDB Atlas API Public Key
2. A MongoDB Atlas API Private Key
3. Your MongoDB Atlas Organization ID

You can create API keys in the MongoDB Atlas dashboard under Project Settings > Access Manager > API Keys.