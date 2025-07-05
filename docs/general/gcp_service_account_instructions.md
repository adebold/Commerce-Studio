# Creating and Downloading a GCP Service Account Key for MongoDB Atlas

To connect to MongoDB Atlas using a Google Cloud Platform (GCP) service account, you need to create and download a service account key file. Follow these steps:

## 1. Access the Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account that has access to the project

## 2. Navigate to Service Accounts

1. In the left navigation menu, go to "IAM & Admin" > "Service Accounts"
2. Find the service account you created for MongoDB Atlas:
   ```
   mongodb-atlas-qrcocdvpqqpbzi5d@p-qo02azx9jpwkne0z4u77madz.iam.gserviceaccount.com
   ```

## 3. Create a Key for the Service Account

1. Click on the service account name to open its details
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" as the key type
5. Click "Create"

The key file will be automatically downloaded to your computer. This is a sensitive file that contains credentials, so keep it secure.

## 4. Use the Key File with the MongoDB Connection Script

1. Note the location where the key file was downloaded
2. When running the `mongodb_gcp_auth.py` script, provide the full path to this key file when prompted
3. The script will use this key file to authenticate with MongoDB Atlas

## Important Security Notes

- **Never commit the key file to version control**
- **Do not share the key file with unauthorized individuals**
- **Consider setting an expiration date for the key in production environments**
- **Store the key file securely and restrict access permissions**

## Troubleshooting

If you encounter authentication issues:

1. Verify that the service account has been properly added to MongoDB Atlas with the correct permissions
2. Check that the service account key hasn't expired
3. Ensure the service account has the necessary IAM roles in your Google Cloud project
4. Confirm that the MongoDB Atlas cluster is configured to allow authentication via Google Cloud IAM