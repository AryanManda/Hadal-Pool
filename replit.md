# Privacy Mixer - Cryptocurrency Mixing Protocol

## Overview

Privacy Mixer is a decentralized cryptocurrency mixing protocol that enhances financial privacy through time-locked deposits and anonymized withdrawals. Built as a full-stack web application, it provides users with a secure interface to deposit funds into privacy pools, wait for anonymization periods, and withdraw to fresh addresses with enhanced privacy guarantees.

The application implements a multi-pool system with different time delays (6h, 24h, 72h) and includes a privacy fund mechanism funded by deposit fees. Users can deposit cryptocurrency, wait for the specified time lock period to enhance the anonymity set, and then withdraw to new addresses to break transaction linkability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: Radix UI components with Tailwind CSS for styling using a dark-themed design system
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Wallet Integration**: Custom wallet provider supporting MetaMask and WalletConnect connections

### Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **API Design**: RESTful endpoints for deposit management, withdrawal processing, and pool statistics
- **Storage**: In-memory storage implementation with interface for future database integration
- **Development**: Hot module replacement and live reloading through Vite middleware integration

### Database & Schema Design
- **ORM**: Drizzle ORM configured for PostgreSQL with Neon serverless database
- **Schema**: Three main entities - users, deposits, and pool statistics
- **Validation**: Zod schemas for runtime type checking and API request validation
- **Migrations**: Drizzle Kit for database schema migrations and management

### Blockchain Integration
- **Database**: PostgreSQL (via Neon serverless) for production data persistence
- **Blockchain Layer**: Mock Web3 provider currently implemented, designed for easy integration with ethers.js or web3.js
- **Smart Contract Interface**: Prepared structure for deposit, withdrawal, and pool statistics contract interactions
- **Wallet Connection**: Browser-based Ethereum wallet integration with MetaMask support

### Privacy & Security Features
- **Time-locked Withdrawals**: Configurable delay periods per pool to increase anonymity set size
- **Privacy Fund**: 0.3% fee on deposits contributes to protocol sustainability and privacy research
- **Anonymity Set Tracking**: Real-time monitoring of users in each pool for privacy warnings
- **Fresh Address Withdrawals**: Interface supports withdrawing to new addresses to break transaction links

### Development & Deployment
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Environment**: Replit-optimized with development banner and error overlay plugins
- **Code Quality**: TypeScript strict mode, path aliases for clean imports
- **Styling**: CSS variables for theming, custom fonts (Inter, JetBrains Mono), responsive design

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **Development Tools**: Vite, TypeScript, esbuild for build processes
- **UI Components**: Radix UI component library for accessible interface elements

### Database & Backend Services
- **Neon Database**: Serverless PostgreSQL for production data storage
- **Drizzle ORM**: Type-safe database operations and migrations
- **Express.js**: Web server framework with session management

### Styling & Design
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Class Variance Authority**: Component variant management
- **Lucide React**: Icon library for consistent iconography

### Blockchain & Web3
- **Prepared for**: ethers.js or web3.js integration (currently mocked)
- **Wallet Support**: MetaMask browser extension integration
- **Future Integration**: Smart contract ABI and deployment configurations

### Development & Quality Tools
- **TanStack Query**: Server state management and caching
- **Zod**: Runtime schema validation and type inference
- **React Hook Form**: Form state management with validation
- **date-fns**: Date manipulation and formatting utilities