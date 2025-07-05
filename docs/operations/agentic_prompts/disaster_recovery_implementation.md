# Disaster Recovery Implementation Agentic Prompts

This document provides AI-ready agentic prompts for implementing the disaster recovery and backup strategy. Each prompt is designed to assist in creating specific components of the backup and recovery infrastructure.

## How to Use These Prompts

1. Select the prompt for the specific backup or recovery component you're implementing
2. Provide the prompt to your AI assistant along with any relevant context
3. Work with the assistant iteratively to complete the implementation
4. Test and validate the resulting scripts or configurations
5. Document any adjustments made during implementation

## MongoDB Backup Script Implementation

```
I need to implement a robust MongoDB backup script for our EyewearML platform. The script should:

1. Create daily full backups and hourly incremental backups
2. Support both local MongoDB and MongoDB Atlas
3. Organize backups by date with clear naming conventions
4. Implement backup encryption for at-rest data
5. Perform automated integrity checks after each backup
6. Implement retention policies (30 days for daily, 12 weeks for weekly, 12 months for monthly)
7. Send success/failure notifications
8. Include detailed logging
9. Handle error recovery for failed backups

Please provide a bash script implementing these requirements. For context, our MongoDB database contains product information, user sessions, and AI assistant logs. The script should be configurable via environment variables or config file. Consider including comments that explain each major section of the script.
```

## Firestore Backup Script Implementation

```
I need to implement a Firestore backup script for our EyewearML platform. The script should:

1. Create daily exports of our Firestore database
2. Use Google Cloud Storage for backup storage
3. Organize backups in a structured format with date-based folders
4. Implement a 30-day rolling retention policy
5. Verify export integrity after completion
6. Include detailed logging
7. Send notifications on completion or failure
8. Handle error recovery for failed exports

Please provide a script (bash or Python) implementing these requirements. The script will run in Google Cloud environment with appropriate permissions. Our Firestore database primarily stores conversation context and user preferences. Consider including verbose comments to explain each part of the implementation.
```

## Google Cloud Storage Backup Script Implementation

```
I need to implement a Google Cloud Storage backup solution for our EyewearML platform. The script should:

1. Perform daily synchronization between primary buckets and backup buckets
2. Maintain file versioning with 90-day history
3. Verify file integrity using hash comparison for critical files
4. Organize backups in a structured format
5. Include detailed logging
6. Send notifications on completion or failure
7. Handle error recovery for failed operations

Please provide a script (bash or Python) implementing these requirements. The script will run in a Google Cloud environment with appropriate permissions. Our GCS buckets contain ML model assets, exported data, and application resources. Consider including comprehensive error handling for network issues and permission problems.
```

## ML Model Backup Script Implementation

```
I need to implement a backup system for our ML model artifacts in the EyewearML platform. The script should:

1. Back up models after each deployment and daily for active models
2. Use Google Cloud Storage for backup storage
3. Include model metadata, weights, and configuration files
4. Implement indefinite retention for production models
5. Validate models after backup to ensure they can be loaded
6. Include detailed logging
7. Send notifications on completion or failure
8. Handle error recovery for failed operations

Please provide a Python script implementing these requirements. Our ML models include face analysis models, recommendation systems, and classification models used in our eyewear platform. The script should handle different model formats (TensorFlow, PyTorch, custom formats), and ensure all components needed to restore a model are properly backed up.
```

## Application Configuration Backup Script Implementation

```
I need to implement a backup system for our application configuration in the EyewearML platform. The script should:

1. Back up configuration after each change and create daily snapshots
2. Include Git repository backup and Secret Manager export
3. Support encryption of sensitive data
4. Validate configuration syntax after backup
5. Include detailed logging
6. Send notifications on completion or failure
7. Implement appropriate retention policies
8. Handle error recovery for failed operations

Please provide a script (bash or Python) implementing these requirements. Our configuration includes application settings, API credentials, environment variables, and deployment configurations. Consider including comprehensive error handling and validation to ensure the backed-up configurations are complete and valid.
```

## MongoDB Restore Script Implementation

```
I need to implement a MongoDB restore script for our EyewearML platform. The script should:

1. Support restoration from both full and incremental backups
2. Allow point-in-time recovery where possible
3. Support both local MongoDB and MongoDB Atlas
4. Include pre-restore validation of backup integrity
5. Create restore plans that show what will be restored
6. Include options for test restores without affecting production
7. Implement detailed logging
8. Add post-restore validation
9. Handle error recovery for failed restores

Please provide a bash script implementing these requirements. The script should be designed to work with our backup system and include comprehensive error handling and validation.
```

## Firestore Restore Script Implementation

```
I need to implement a Firestore restore script for our EyewearML platform. The script should:

1. Support restoration from GCS-stored Firestore exports
2. Include options for complete or selective restoration
3. Allow for restoration to a test environment
4. Implement pre-restore validation
5. Create restore plans showing what will be restored
6. Include detailed logging
7. Add post-restore validation
8. Handle error recovery for failed restores

Please provide a script (bash or Python) implementing these requirements. The script should be designed to work with our backup system and include comprehensive error handling and validation.
```

## GCS Restore Script Implementation

```
I need to implement a Google Cloud Storage restore script for our EyewearML platform. The script should:

1. Support restoration from backup buckets
2. Allow for point-in-time restoration using versioned objects
3. Include options for complete or selective restoration
4. Implement file integrity verification during restore
5. Create restore plans showing what will be restored
6. Include detailed logging
7. Handle error recovery for failed operations
8. Support different target locations for test restores

Please provide a script (bash or Python) implementing these requirements. Consider different restore scenarios and how to handle conflicts or inconsistencies during the restore process.
```

## ML Model Restore Script Implementation

```
I need to implement a restore script for our ML model artifacts in the EyewearML platform. The script should:

1. Support restoration of full model packages from backups
2. Include options for restoring to different environments
3. Implement model validation after restore
4. Allow for selective restoration of specific models
5. Create restore plans showing what will be restored
6. Include detailed logging
7. Handle error recovery for failed restores
8. Support A/B testing of restored models

Please provide a Python script implementing these requirements. The script should handle the complexities of different model formats and ensure that restored models are fully functional.
```

## Configuration Restore Script Implementation

```
I need to implement a restore script for our application configuration in the EyewearML platform. The script should:

1. Support restoration from both Git backups and snapshot backups
2. Include options for selective restoration of specific configurations
3. Implement configuration validation before applying
4. Allow for test application of configuration
5. Create restore plans showing what will be restored
6. Include detailed logging
7. Handle error recovery for failed restores
8. Support different target environments

Please provide a script (bash or Python) implementing these requirements. The script should include safeguards against applying incompatible configurations and ensure that restored configurations are valid before application.
```

## Backup Validation System Implementation

```
I need to implement a backup validation system for our EyewearML platform that can automatically verify the integrity and usability of our backups. The system should:

1. Periodically test restores to a test environment
2. Validate database backup integrity
3. Verify file integrity in storage backups
4. Test loading and basic functionality of ML models
5. Validate configuration syntax and completeness
6. Generate detailed reports on backup health
7. Send notifications for any validation failures
8. Maintain historical validation data for trend analysis

Please provide a design and implementation for this validation system. Consider both the scripts needed for validation as well as the reporting and notification infrastructure. The solution should be automated and require minimal human intervention except in failure scenarios.
```

## Recovery Drill System Implementation

```
I need to implement a system for conducting regular disaster recovery drills for our EyewearML platform. The system should:

1. Automate the setup of an isolated test environment
2. Execute full recovery procedures in a controlled manner
3. Measure and record recovery time metrics
4. Validate system functionality after recovery
5. Generate comprehensive reports on the drill
6. Identify optimization opportunities
7. Document any manual interventions required
8. Maintain historical drill data for trend analysis

Please design a framework for conducting these recovery drills quarterly. Include both the technical components (scripts, validation tests) as well as the process components (roles, documentation templates). The goal is to ensure our recovery procedures are regularly tested and improved.
```

## Backup Monitoring Dashboard Implementation

```
I need to implement a monitoring dashboard for our backup and recovery systems in the EyewearML platform. The dashboard should:

1. Display real-time status of all backup operations
2. Show historical backup success/failure rates
3. Track backup sizes and growth trends
4. Monitor recovery point objectives (RPO) compliance
5. Display validation test results
6. Provide alerts for missed or failed backups
7. Include metrics on storage utilization
8. Offer drill-down capabilities for detailed analysis

Please design a comprehensive dashboard solution for monitoring our backup and recovery systems. Consider both the data collection mechanisms needed as well as the visualization components. The dashboard should provide at-a-glance status information as well as detailed metrics for deeper analysis.
```

## Multi-Region Backup Strategy Implementation

```
I need to design and implement a multi-region backup strategy for our EyewearML platform to enhance our disaster recovery capabilities. The strategy should:

1. Distribute backup storage across multiple geographic regions
2. Implement automated replication between regions
3. Support region failover for backup and restore operations
4. Optimize for both cost and recovery speed
5. Include region-specific retention policies where appropriate
6. Provide a unified view across all regions
7. Monitor cross-region replication health
8. Support disaster scenarios where entire regions are unavailable

Please provide a design document and implementation plan for this multi-region backup strategy. Consider cloud-specific tools and approaches, cost implications, and performance considerations. The solution should balance redundancy with cost-effectiveness.
```

## Automated Failover System Implementation

```
I need to design and implement an automated failover system for critical components of our EyewearML platform. The system should:

1. Monitor the health of key systems and services
2. Detect failures quickly and accurately
3. Implement automatic failover to standby systems
4. Minimize downtime during failover events
5. Provide clear notifications of failover events
6. Support manual failover for maintenance
7. Include failback procedures
8. Log detailed information about failover events

Please design a comprehensive automated failover solution for our platform. Consider monitoring approaches, failover triggers, and synchronization requirements. The solution should be robust against false positives while still responding quickly to genuine failures.
```

## Usage Examples

### Example 1: Creating the MongoDB Backup Script

To implement the MongoDB backup script:

1. Select the "MongoDB Backup Script Implementation" prompt
2. Provide it to your AI assistant
3. Provide additional context about your specific MongoDB configuration
4. Review and refine the generated script
5. Test the script in a development environment
6. Implement in production with appropriate monitoring

### Example 2: Planning a Recovery Drill

To plan and implement a recovery drill:

1. Select the "Recovery Drill System Implementation" prompt
2. Work with your AI assistant to design the drill framework
3. Create the necessary test environments and scripts
4. Document the drill procedure
5. Execute the drill with appropriate team members
6. Document results and improvement opportunities
7. Implement improvements to the recovery process
