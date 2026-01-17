---
description: Build and deploy the application to Firebase
---
# Build and Deploy Workflow

1.  **Build the Project**:
    - Run the build command to generate production assets.
    ```bash
    npm run build
    ```
    // turbo

2.  **Deploy to Firebase**:
    - Deploy the specific site target.
    ```bash
    firebase deploy --only hosting
    ```
