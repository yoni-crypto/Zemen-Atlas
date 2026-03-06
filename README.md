# Zemen Atlas - Ethiopian Historical Atlas

Interactive historical atlas of Ethiopia featuring regions, rulers, battles, notable people, and historical places. Built with Node.js, Express, MongoDB, and vanilla JavaScript.

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## SEO Keywords

ethiopian history, ethiopian atlas, african history app, historical maps ethiopia, ethiopian rulers, ethiopian battles timeline, amhara history, tigray history, oromo history, ancient ethiopia, axum empire history, zemen ethiopia, ethiopian heritage, east african history, historical places ethiopia, ethiopian kings and queens

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Zemen Atlas is a comprehensive digital platform dedicated to preserving and showcasing Ethiopia's rich historical heritage. From ancient kingdoms and legendary rulers to pivotal battles and cultural landmarks, this interactive atlas provides:

- Interactive maps of historical regions
- Detailed profiles of Ethiopian rulers and emperors
- Chronological battle timelines
- Biographies of notable historical figures
- Database of historical places and landmarks
- Cultural heritage e-commerce store

The name "Zemen" (ዘመን) means "era" or "generation" in Amharic, reflecting our mission to connect generations through Ethiopia's storied past.

---

## Features

### Historical Data Modules
- Regions - Explore Ethiopia's historical regions and territories
- Rulers - Browse kings, queens, and emperors with their reign periods
- Battles - Discover pivotal military engagements in Ethiopian history
- People - Learn about influential figures who shaped the nation
- Places - Visit historical sites, monuments, and cultural landmarks

### Interactive Timeline
- Chronological visualization of historical events
- Filter by era, region, or category
- Cross-referenced with rulers and battles

### Mapping System
- Interactive historical maps
- Geographic visualization of territorial changes
- Location-based historical exploration

### Authentication & User Features
- JWT-based user authentication
- Personalized user profiles with location
- Order history and e-commerce integration

### Cultural Store
- Ethiopian historical books, artifacts, and cultural items
- Shopping cart functionality
- Secure checkout process

---

## Tech Stack

### Backend
- Node.js - JavaScript runtime
- Express.js - Web application framework
- MongoDB - NoSQL database
- Mongoose - MongoDB ODM
- JWT - JSON Web Token authentication
- bcrypt - Password hashing
- CORS - Cross-origin resource sharing

### Frontend
- HTML5 - Semantic markup
- CSS3 - Styling and responsive design
- Vanilla JavaScript - ES6+ features
- Fetch API - HTTP requests

### Development & Deployment
- Git - Version control
- npm - Package management
- Environment Variables - Configuration management

---

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Clone Repository

```bash
git clone https://github.com/yoni-crypto/Zemen-Atlas.git
cd Zemen-Atlas
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zemen-atlas
JWT_SECRET=your_jwt_secret_key_here
```

Start the development server:

```bash
npm start
# or
node server.js
```

### Frontend Setup

```bash
cd frontend
# Serve using any static server (Live Server, http-server, etc.)
# Example with npx
npx http-server -p 3000
```

Or simply open `frontend/index.html` in your browser.

---

## Usage

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/me` - Get current user profile

#### Historical Data
- `GET /api/regions` - List all regions
- `GET /api/rulers` - List all rulers
- `GET /api/battles` - List all battles
- `GET /api/people` - List all notable people
- `GET /api/places` - List all historical places
- `GET /api/timeline` - Get chronological timeline

#### E-Commerce
- `GET /api/products` - List all products
- `POST /api/orders` - Create new order (auth required)
- `GET /api/orders` - Get user order history (auth required)

---

## Project Structure

```
Zemen-Atlas/
├── backend/
│   ├── models/           # Mongoose schemas
│   │   ├── Battle.js
│   │   ├── Order.js
│   │   ├── Person.js
│   │   ├── Place.js
│   │   ├── Product.js
│   │   ├── Region.js
│   │   ├── Ruler.js
│   │   └── User.js
│   ├── server.js         # Express app entry point
│   ├── seed.js           # Database seeding
│   └── package.json
│
├── frontend/
│   ├── auth/             # Authentication UI
│   ├── cart/             # Shopping cart
│   ├── data/             # Static JSON data
│   ├── detail/           # Detail views
│   ├── history/          # History/timeline views
│   ├── map/              # Map visualization
│   ├── orders/           # Order management
│   ├── store/            # E-commerce store
│   └── index.html
│
├── README.md
└── LICENSE
```

---

## Contributing

Contributions are welcome. This is an open-source project dedicated to Ethiopian historical preservation.

### How to Contribute

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/Zemen-Atlas.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Contribution Areas
- Historical data accuracy and expansion
- Additional language support (Amharic, Tigrinya, Oromo, etc.)
- Historical image contributions
- Bug fixes and performance improvements
- New features and enhancements

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

