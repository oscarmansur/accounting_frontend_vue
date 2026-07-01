# Vue Admin Boilerplate

A production-ready admin dashboard boilerplate built with Vue 3, Vite, Tailwind CSS, and Pinia. Perfect for building custom admin panels for any backend system.

## Features

- ✅ JWT Authentication
- ✅ Responsive Layout (Desktop & Mobile)
- ✅ Dark/Light Theme Toggle
- ✅ Role-based Access Control
- ✅ Generic CRUD Components
- ✅ Reusable UI Components
- ✅ Clean Architecture
- ✅ TypeScript Ready
- ✅ Best Practices

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your API configuration:
   ```env
   VITE_API_URL=http://localhost:3000/v1
   ```
4. Make sure your API server is running on port 3000
5. Start the development server: `npm run dev`
6. Build for production: `npm run build`

## Test Credentials

For testing purposes, you can use these credentials:
- **Email**: admin@example.com
- **Password**: admin123

Note: This user currently has 'user' role. For full admin functionality, update the user role to 'admin' in your database.

## API Integration

This boilerplate connects to your REST API. Configure the base URL in your `.env` file:

```env
VITE_API_URL=https://your-api-domain.com/api
```

The authentication system expects:
- Login endpoint: `POST /auth/login`
- Protected routes require `Authorization: Bearer <token>` header
- User object with `role` property for access control

## Project Structure

```
src/
├── assets/          # CSS and static assets
├── components/      # Reusable components
│   ├── common/      # Generic UI components
│   └── layout/      # Layout components
├── composables/     # Vue composables
├── layouts/         # Page layouts
├── router/          # Router configuration
├── services/        # API services
├── stores/          # Pinia stores
└── views/           # Pages/views
```

## Customization

1. **Navigation**: Modify `src/components/layout/AppSidebar.vue`
2. **Routes**: Update `src/router/index.js`
3. **Components**: Add reusable components in `src/components/common/`
4. **State Management**: Extend stores in `src/stores/`
5. **API Services**: Customize `src/services/api.js`

## Contributing

Feel free to fork this repository and submit pull requests for improvements.
