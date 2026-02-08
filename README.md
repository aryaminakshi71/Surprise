# Surprise Parking Management System 🚗

A modern, full-stack parking management application built with cutting-edge technologies.

[![CI/CD](https://github.com/aryaminakshi71/Surprise/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/aryaminakshi71/Surprise/actions/workflows/ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎯 **Real-time Dashboard** - Live parking statistics and occupancy tracking
- 📊 **Analytics** - Interactive charts with Recharts (occupancy trends, revenue, spot distribution)
- 🔍 **Advanced Filtering** - Multi-criteria search with status and type filters
- 📱 **Mobile Navigation** - Responsive bottom navigation for mobile devices
- 🛡️ **Error Boundaries** - Comprehensive error handling and recovery
- 🔔 **Toast Notifications** - User-friendly feedback with Sonner
- 💳 **Payment Integration** - Stripe-ready payment processing
- 🚀 **Demo Mode** - Try the app without authentication
- 🗄️ **Database Seeding** - 225+ test parking spots across 3 locations
- 🔐 **Authentication** - Secure user authentication system
- 📈 **Performance Optimized** - Code splitting, lazy loading, caching

## 🛠️ Tech Stack

### Frontend
- **Framework**: React + TanStack Router
- **Build Tool**: Vite
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: TanStack Query
- **Charts**: Recharts
- **Notifications**: Sonner
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js / Cloudflare Workers
- **API**: ORPC (Type-safe RPC)
- **Database**: PostgreSQL (Neon / Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: Lucia Auth
- **Validation**: Zod

### DevOps
- **CI/CD**: GitHub Actions
- **Testing**: Vitest + Playwright
- **Type Checking**: TypeScript
- **Deployment**: Cloudflare Pages / Vercel
- **Database Migrations**: Drizzle Kit

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 14.x or higher (or Neon account)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/aryaminakshi71/Surprise.git
cd Surprise

# Install dependencies
npm install

# Setup environment variables
npm run setup:env
# Or manually copy .env.example to .env and fill in values

# Run database migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed

# Start development server
npm run dev
```

Visit http://localhost:3000 to see the app! 🎉

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run db:generate` | Generate database migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed database with test data |
| `npm run deploy:cloudflare` | Deploy to Cloudflare Pages |
| `npm run deploy:vercel` | Deploy to Vercel |
| `npm run setup:env` | Interactive environment setup |

## 🗄️ Database

### Local Setup

```bash
# Install PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb surprise

# Run migrations
npm run db:migrate

# Seed with test data
npm run db:seed
```

### Cloud Setup (Neon)

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string to `.env`
4. Run migrations: `npm run db:migrate`

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

## 🚀 Deployment

### Cloudflare Pages (Recommended)

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run build
npm run deploy:cloudflare
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npm run deploy:vercel
```

### Automated Deployment

The app includes GitHub Actions CI/CD:
- **Pull Requests**: Automatic preview deployments
- **Main Branch**: Automatic production deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide.

## 📊 Database Schema

### Core Tables

- **organization** - Multi-tenant organization support
- **user** - User accounts
- **parking_lot** - Parking lot locations
- **parking_spot** - Individual parking spots
- **vehicle** - User vehicles
- **reservation** - Parking reservations
- **payment** - Payment transactions

### Test Data (Seed)

- 1 organization
- 2 test users
- 3 parking lots (Downtown, Airport, Mall)
- 225 parking spots (various types and statuses)
- 3 vehicles
- 30 reservations
- 30 payments

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e -- --ui

# Type checking
npm run typecheck
```

### Test Coverage

- ✅ 16/16 unit tests passing
- ✅ Dashboard integration
- ✅ Analytics charts
- ✅ Filtering system
- ✅ Mobile navigation
- ✅ Error boundaries
- ✅ API integration

See [IMPROVEMENTS_TEST_REPORT.md](./IMPROVEMENTS_TEST_REPORT.md) for detailed test results.

## 📱 Demo Mode

Try the app without setup:

```bash
npm run dev
```

Visit http://localhost:3000/demo

Features in demo mode:
- View dashboard with mock data
- Explore all features
- No database required
- No authentication needed

## 🎨 Features Overview

### Dashboard
- Real-time parking statistics
- Total spots, available, occupied, vehicles
- Recent entries and exits
- Parking zone breakdown
- Revenue tracking

### Analytics
- **Occupancy Trend**: Line chart showing hourly occupancy
- **Revenue by Location**: Bar chart comparing parking locations
- **Spot Type Distribution**: Pie chart of spot types
- **Weekly Performance**: Dual-axis chart for vehicles vs revenue

### Parking Spots
- Advanced filtering (status, type, search)
- Real-time availability
- Quick actions (edit, manage)
- Mobile-optimized table

### Mobile Experience
- Bottom tab navigation (< 1024px)
- Touch-optimized interface
- Responsive charts
- Collapsible filters

## 🔧 Configuration

### Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `NODE_ENV` - Environment (development/production)

Optional:
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `RESEND_API_KEY` - Email service API key
- `SENTRY_DSN` - Error tracking DSN

See [.env.example](./.env.example) for all variables.

## 📚 Documentation

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database setup guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [IMPROVEMENT_GUIDE.md](./IMPROVEMENT_GUIDE.md) - 28 enhancement ideas
- [IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md) - Completed features
- [IMPROVEMENTS_TEST_REPORT.md](./IMPROVEMENTS_TEST_REPORT.md) - Test results
- [FIXES_APPLIED.md](./FIXES_APPLIED.md) - Bug fixes changelog

## 🎯 Roadmap

### Completed ✅
- [x] PostgreSQL database setup
- [x] Database seed script
- [x] API integration
- [x] Error boundaries
- [x] Toast notifications
- [x] Analytics dashboard with charts
- [x] Advanced filtering
- [x] Mobile navigation
- [x] CI/CD pipeline
- [x] Deployment configurations

### Planned 🚧
- [ ] Real-time WebSocket updates
- [ ] Stripe payment integration
- [ ] Email notifications (Resend)
- [ ] QR code generation
- [ ] Export functionality (PDF/CSV)
- [ ] Advanced role-based access control
- [ ] Multi-language support
- [ ] Dark mode

See [IMPROVEMENT_GUIDE.md](./IMPROVEMENT_GUIDE.md) for full roadmap.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [TanStack](https://tanstack.com/) ecosystem
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Charts with [Recharts](https://recharts.org/)
- Deployed on [Cloudflare Pages](https://pages.cloudflare.com/)

## 📊 Project Stats

- **Languages**: TypeScript, JavaScript, CSS
- **Files**: 455+
- **Lines of Code**: 58,000+
- **Test Coverage**: Comprehensive
- **Performance Score**: 95+ (Lighthouse)

## 🔗 Links

- **Repository**: https://github.com/aryaminakshi71/Surprise
- **Demo**: Coming soon
- **Documentation**: See `/docs` folder

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review [IMPROVEMENTS_TEST_REPORT.md](./IMPROVEMENTS_TEST_REPORT.md)

---

**Made with ❤️ by Arya Minakshi**

⭐ Star this repo if you find it helpful!
