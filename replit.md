# Overview

This is a full-stack e-commerce web application called "My Shopping Store" built with modern web technologies. The application provides a complete online shopping experience with user authentication, product browsing, shopping cart functionality, and order management. It includes both customer-facing features and a comprehensive admin dashboard for managing products, orders, and users.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built using React with TypeScript and follows a component-based architecture:
- **UI Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for client-side navigation
- **State Management**: React Context API for authentication and shopping cart state
- **Data Fetching**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
The server-side follows a RESTful API design pattern:
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the stack
- **Authentication**: JWT (JSON Web Tokens) for stateless authentication
- **Password Security**: bcryptjs for password hashing
- **Data Storage**: In-memory storage implementation (designed to be easily replaceable with database)
- **API Structure**: RESTful endpoints organized by resource (auth, products, orders, users)

## Authentication & Authorization
- **JWT-based Authentication**: Stateless token-based authentication system
- **Role-based Access Control**: Separate user and admin roles with different permissions
- **Protected Routes**: Client-side route protection based on authentication status and user roles
- **Secure Password Handling**: Passwords are hashed using bcryptjs before storage

## Data Layer
- **Schema Definition**: Shared TypeScript schemas using Drizzle ORM for type safety
- **Database Design**: PostgreSQL schema with tables for users, products, orders, and order items
- **Storage Interface**: Abstract storage interface allowing for easy database implementation switching
- **Data Validation**: Zod schemas for runtime type validation on both client and server

## Development Tools & Build System
- **Build Tool**: Vite for fast development and optimized production builds
- **Code Quality**: TypeScript strict mode for compile-time error checking
- **Development Experience**: Hot module replacement and error overlays for rapid development
- **Module Resolution**: Path aliases for clean import statements

## Component Architecture
The frontend follows a modular component structure:
- **UI Components**: Reusable components from shadcn/ui library
- **Page Components**: Route-specific components for different application views
- **Layout Components**: Shared layout components for consistent page structure
- **Context Providers**: React Context for global state management (auth, cart)

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity for serverless environments
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **express**: Web application framework for Node.js
- **react & react-dom**: Frontend framework and DOM rendering

## UI and Styling
- **@radix-ui/\***: Headless UI components for accessibility and functionality
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for managing component variants
- **lucide-react**: Icon library for consistent iconography

## Development and Build Tools
- **vite**: Build tool and development server
- **typescript**: Type system for JavaScript
- **@replit/vite-plugin-\***: Replit-specific development plugins
- **esbuild**: Fast JavaScript bundler for production builds

## Data Management and Validation
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form handling and validation
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Runtime type validation and schema definition

## Authentication and Security
- **jsonwebtoken**: JWT token generation and verification
- **bcryptjs**: Password hashing and comparison

## Database and ORM
- **drizzle-kit**: Database migration and development tools
- **connect-pg-simple**: PostgreSQL session store (for future session management)

The application is configured for deployment on Replit with PostgreSQL database integration, and the architecture supports easy scaling and feature additions through its modular design.