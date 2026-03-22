# IntelliClaim Backend (Java Spring Boot)

This directory contains the modernized microservices architecture for IntelliClaim.

## 🚀 Services Overview

1.  **Discovery Service** (`:8761`): Eureka Server for service registration.
2.  **Gateway Service** (`:8080`): API Gateway routing requests to microservices.
3.  **Identity Service** (Coming Soon): Authentication & User Management.
4.  **Claim Service** (Coming Soon): Core business logic.
5.  **Forensics Service** (Coming Soon): Bridge to Python AI models.

## 🛠️ Prerequisites

The project is built with **Spring Boot 3.2.3**, which requires a modern Java version.

*   **Java**: JDK 17 or higher (Recommended: JDK 21)
    *   *Check version*: `java -version`
*   **Maven**: 3.8+
    *   *Check version*: `mvn -version`

### ⚠️ Environment Setup Required
Your current system appears to have Java 8 installed. **You must upgrade to JDK 17+ to run this project.**

[Download OpenJDK 17](https://adoptium.net/temurin/releases/?version=17)

## 🏃‍♂️ How to Run

1.  **Build the Project**:
    ```bash
    cd intelliclaim-backend-java
    mvn clean install
    ```

2.  **Start Services (Order Matters)**:
    *   **Terminal 1 (Discovery)**:
        ```bash
        cd discovery-service
        mvn spring-boot:run
        ```
    *   **Terminal 2 (Gateway)**:
        ```bash
        cd gateway-service
        mvn spring-boot:run
        ```

3.  **Access Eureka Dashboard**: Open `http://localhost:8761` in your browser.
