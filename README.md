# YibYerm Project

Welcome to the YibYerm project! This project is a web application built using Next.js for the frontend and Go for the backend. It utilizes Tailwind CSS for styling, along with various libraries to enhance the user experience.

## Table of Contents

- [Project Structure](#project-structure)
- [Frontend](#frontend)
- [Backend](#backend)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Project Structure

```
yibyerm-project
├── frontend
│   ├── src
│   │   ├── app
│   │   ├── components
│   │   ├── hooks
│   │   ├── lib
│   │   └── types
│   ├── components.json
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── next.config.js
├── backend
│   ├── cmd
│   ├── internal
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   └── services
│   ├── go.mod
│   └── go.sum
└── README.md
```

## Frontend

The frontend is built with Next.js and styled using Tailwind CSS. It includes reusable components for UI elements, custom hooks for API interactions, and utility functions for various tasks.

### Key Files

- **globals.css**: Contains global styles and Tailwind CSS imports.
- **layout.tsx**: Defines the main layout for the application.
- **page.tsx**: Entry point for the main page.
- **components**: Contains reusable UI components like buttons, cards, and inputs.

## Backend

The backend is developed in Go and follows a clean architecture pattern. It includes controllers, middleware, models, routes, and services to handle user-related operations.

### Key Files

- **main.go**: Entry point for the Go application.
- **controllers**: Contains logic for handling API requests.
- **middleware**: Includes authentication and CORS handling.
- **models**: Defines data structures and database interactions.

## Installation

To get started with the project, follow these steps:

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/yibyerm-project.git
   cd yibyerm-project
   ```

2. Install frontend dependencies:

   ```
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```
   cd backend
   go mod tidy
   ```

## Usage

To run the frontend and backend applications:

1. Start the backend server:

   ```
   cd backend
   go run cmd/main.go
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

Visit `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
