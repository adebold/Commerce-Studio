# PMS Integration Agentic Prompts

This directory contains prompts for AI agents designed to facilitate integration between the eyewear-ML platform and various Practice Management Systems (PMS). These agents work together to automate, optimize, and monitor the process of connecting with healthcare systems, with a focus on accessing patient data, prescription information, and other relevant optical healthcare data.

## Agent Framework Overview

The agent architecture uses a layered approach where specialized agents handle different aspects of the integration lifecycle:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Integration Orchestration                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
    ┌───────────────────────────┼───────────────────────────┐
    │                           │                           │
┌───▼───────────────┐   ┌───────▼────────────┐    ┌─────────▼──────────┐
│  Configuration    │   │  Data Mapping      │    │  Monitoring &      │
│  Agent            │   │  Intelligence      │    │  Healing           │
└───────────────────┘   └───────────────────────┘  └────────────────────┘
          │                       │                         │
          │                       │                         │
┌─────────▼───────────┐   ┌──────▼─────────────┐   ┌───────▼──────────────┐
│  Synchronization    │   │   System-Specific  │   │   Security &         │
│  Optimization       │   │   Adapter Agents   │   │   Compliance         │
└─────────────────────┘   └────────────────────┘   └──────────────────────┘
```

## Core Agents

### [Integration Configuration Agent](./integration_configuration_agent.md)
Responsible for automating and simplifying the setup of connections between eyewear-ML and various PMS systems. This agent detects system capabilities, configures optimal integration pathways, and validates connections with minimal human intervention.

### [Data Mapping Intelligence Agent](./data_mapping_intelligence_agent.md)
Creates and maintains data mappings between PMS systems and eyewear-ML by analyzing schemas, inferring field relationships, and generating accurate transformation rules. This agent learns from corrections to continuously improve mapping precision.

### [Integration Monitoring Agent](./integration_monitoring_agent.md)
Proactively monitors integration health, detects anomalies, diagnoses problems, automatically remediates issues when possible, and provides actionable guidance when human intervention is required.

### [Synchronization Optimization Agent](./synchronization_optimization_agent.md)
Analyzes data change patterns, optimizes synchronization timing and frequency, efficiently batches operations, and balances system load to ensure timely data availability while minimizing resource usage.

## System-Specific Adapter Agents

### [Epic Integration Agent](./epic_integration_agent.md)
Specializes in connecting with Epic electronic health record systems, with deep knowledge of Epic's unique architecture, APIs, data models, and best practices for external system integration.

### [Apollo Integration Agent](./apollo_integration_agent.md)
Facilitates seamless data exchange with Apollo optical management systems (Oogwereld), with specialized handling for European optical retail data formats, prescription notation, and GDPR compliance requirements.

### [Generic PMS Adapter Agent](./generic_pms_adapter_agent.md)
Provides a flexible integration layer for a wide variety of PMS systems that don't have dedicated system-specific agents, adapting to different architectures, APIs, and data models to ensure consistent integration.

## Using These Prompts

These agent prompts are designed to be used within large language model (LLM) systems that support the execution of specialized roles. Each prompt defines:

1. **Agent Purpose**: The overall objective and role of the agent
2. **Knowledge Requirements**: Domain expertise needed for the agent to function effectively
3. **Input Context**: Information the agent requires to make decisions
4. **Decision Process**: Structured approach to analyzing information and determining actions
5. **Output Format**: Standardized JSON structure for agent responses
6. **Example Interactions**: Sample dialogues demonstrating the agent's capabilities
7. **Failure Modes and Recovery**: Common issues and how to address them
8. **System Integration**: How the agent interacts with other components

## Integration Workflow

The typical workflow for integrating with a new PMS system involves:

1. **Configuration Phase**: The Integration Configuration Agent analyzes the target PMS and establishes connectivity
2. **Mapping Phase**: The Data Mapping Intelligence Agent creates data transformations between systems
3. **Optimization Phase**: The Synchronization Optimization Agent determines optimal sync patterns
4. **Monitoring Setup**: The Integration Monitoring Agent establishes baselines and alerting
5. **Ongoing Operations**: Continuous monitoring, healing, and optimization by the agent ensemble

## Future Development

Additional system-specific adapter agents can be added to this directory as new PMS integrations are implemented. This modular approach allows for:

- Specialized knowledge encapsulation for each major PMS vendor
- System-specific optimizations and workarounds
- Incremental improvement of integration capabilities
- Common integration framework with customized implementations
