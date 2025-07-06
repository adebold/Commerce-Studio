# AI Avatar Chat System - Demo Launch Guide

This guide provides step-by-step instructions for setting up and launching the AI Avatar Chat System demo. The demo showcases the avatar's core features in a controlled, mock environment.

## 1. Prerequisites

Before you begin, ensure you have the following installed:
- **Git**: For version control.
- **Node.js**: To run the mock NVIDIA services server.
- **Python 3**: To run a simple web server for the demo interface.

## 2. Setup and Launch

The demo setup is automated via a shell script. Follow these steps to get started:

### Step 1: Make Scripts Executable

First, ensure the setup script is executable by running the following command from the project root:

```bash
chmod +x scripts/demo-setup.sh
```

### Step 2: Run the Demo Setup Script

Execute the script to start the mock services and the demo web server:

```bash
./scripts/demo-setup.sh
```

The script will:
1. Create the necessary demo directories.
2. Start the mock NVIDIA services server on port 8080.
3. Launch a simple web server for the demo interface.

Upon successful execution, you will see a confirmation message with a link to the demo interface.

## 3. Accessing the Demo

Once the setup script is running, open your web browser and navigate to the following URL:

[http://localhost:8080/frontend/demo-interface.html](http://localhost:8080/frontend/demo-interface.html)

## 4. Interacting with the Demo

The demo interface allows you to interact with the AI avatar in a simulated environment. Here’s what you can do:

- **Chat with the Avatar**: Type a message in the input box and press "Send" or "Enter". The avatar will respond with a mock-generated message.
- **Trigger Product Recommendations**: Ask the avatar for "glasses" or "recommendations" to see a list of sample eyewear products.
- **Simulated Face Analysis**: The system is configured to simulate face analysis, which influences the avatar's recommendations.
- **Multi-Modal Interaction**: The interface demonstrates text-based interaction. The underlying mock services are designed to simulate voice input as well.

## 5. Stopping the Demo

To stop the demo, you will need to terminate the mock server and the web server. The setup script saves the process IDs (PIDs) in the `demo/` directory.

### Step 1: Stop the Mock Server

```bash
kill $(cat demo/server.pid)
```

### Step 2: Stop the Web Server

```bash
kill $(cat demo/web-server.pid)
```

This will shut down all components of the demo.

## 6. Troubleshooting

- **Port Conflict**: If you get an error that the port is already in use, another service is running on port 8080. Stop the conflicting service or modify the `SERVER_PORT` variable in `scripts/demo-setup.sh`.
- **Script Errors**: If the setup script fails, check the `demo/demo-setup.log` file for detailed error messages.
- **File Not Found**: Ensure you are running the scripts from the root directory of the project.

---
This guide should provide everything you need to get the AI Avatar Chat System demo up and running. Enjoy the showcase!