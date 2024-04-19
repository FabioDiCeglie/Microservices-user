# Overview

This project demonstrates user authentication and authorization systems implemented across three different servers using various technologies. The project includes:

1. **Go Server with CRUD Operations**: This server is built with Go and provides endpoints for user authentication and authorization along with CRUD operations. The server ensures secure access to resources.

2. **Node.js Server**: Another server built with Node.js, providing similar functionalities as the Go server but with a different tech stack.

3. **Typescript Server with GraphQL**: This server is built with TypeScript and utilizes GraphQL for querying and mutating data. It includes a gateway and a subgraph for users, providing similar functionalities as the Go server but with a different tech stack.

## Features

- User Authentication and Authorization: All servers implement robust user authentication and authorization mechanisms to ensure secure access to resources.
- CRUD Operations: CRUD (Create, Read, Update, Delete) operations are supported across all servers, allowing users to manage data efficiently.
- GraphQL Implementation: The TypeScript server utilizes GraphQL for querying and mutating data, offering a more flexible and efficient way to interact with the server.
- Jest Testing: The TypeScript server includes Jest testing to ensure the reliability and correctness of the implemented functionalities.

## Technologies Used

- Go: Used for the Go server implementation.
- Node.js: Utilized for building the Node.js server.
- TypeScript: Employed for developing the TypeScript server with GraphQL.
- GraphQL: Implemented for the TypeScript server, providing a query language for APIs.
- Jest: Used for testing the TypeScript server to ensure the robustness of the implemented features.

## Getting Started

To get started with the project, follow these steps:

1. **Clone the Repository**: Clone this repository to your local machine.

2. **Navigate to Each Server**: Explore each server's directory to understand its implementation and dependencies.

3. **Install Dependencies**: For each server, install the necessary dependencies using the package manager of your choice.

4. **Set Environment Variables**: Before running the servers, make sure to set the required environment variables. Copy the contents of the `env.example` file provided in each project's directory and create a new `.env` file with those variables, adjusting the values as necessary for your environment.

5. **Run the Servers**: Run each server individually using the provided scripts or commands.

6. **Test the Functionality**: Once the servers are up and running, test the implemented functionalities using the provided endpoints or GraphQL queries.  


## Directory Structure

```
project-root/
│
├── server-go/                  # Go server implementation
│   ├── requests.rest/          # Example endpoints for Go server
│ 
├── server-nodeJS/              # Node.js server implementation
│   ├── requests.rest/          # Example endpoints for NodeJS server
│
├── server-typescript-graphql/  # TypeScript server implementation
│   ├── gateway/                # GraphQL gateway implementation
│   ├── services/               
│        ├── users/              # GraphQL users subgraph implementation
│             ├── resolvers/
│                     ├── user.test.ts x 2/             # Jest tests for TypeScript server
└── ...
```

## Tests coverage TypeScript Server