# Online Shop - E-Commerce Platform

A comprehensive, industry-grade e-commerce platform built with Next.js 15, TypeScript, and modern web technologies.

## 🚀 Features

- **Modern Tech Stack**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js v5 with credentials provider
- **State Management**: Jotai for global state, React Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Database**: Prisma ORM with PostgreSQL
- **Payment Processing**: Authorize.net integration
- **Email Notifications**: Resend API
- **Product Management**: Full CRUD operations with categories
- **Shopping Cart**: Persistent cart with local storage
- **Wishlist**: Save favorite products
- **User Reviews**: Product rating and review system
- **Order Management**: Complete order tracking and history
- **Admin Dashboard**: Product, order, and user management
- **Responsive Design**: Mobile-first approach
- **Image Optimization**: Next.js Image component
- **SEO Optimized**: Metadata API for better search rankings

## 📋 Prerequisites

- Node.js 18.x or higher
- Cloud database account (Neon, Supabase, Railway, or Vercel Postgres - all have free tiers)
- npm or yarn package manager

**No local database installation required!** 🎉

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd online-shop
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up a FREE cloud database** (Choose one)

> 💡 **See [CLOUD_DATABASE_SETUP.md](./CLOUD_DATABASE_SETUP.md) for detailed setup guides for each provider.**

### Quick Start with Neon (Recommended ⭐)

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for free (No credit card required!)
3. Create a new project
4. Copy the connection string

### Other Options

- **Supabase**: [https://supabase.com](https://supabase.com) - Includes auth, storage, realtime
- **Railway**: [https://railway.app](https://railway.app) - Simple setup, $5 free credit
- **Vercel Postgres**: [https://vercel.com/storage/postgres](https://vercel.com/storage/postgres) - Great for Vercel deployment

4. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database (paste your cloud database URL here)
DATABASE_URL="postgresql://username:password@your-cloud-provider.com:5432/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Authorize.net (Optional - for payments)
AUTHORIZE_NET_API_LOGIN_ID="your-api-login-id"
AUTHORIZE_NET_TRANSACTION_KEY="your-transaction-key"
AUTHORIZE_NET_ENVIRONMENT="sandbox" # or "production"

# Email (Optional - for notifications)
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

5. **Generate NEXTAUTH_SECRET**

```bash
openssl rand -base64 32
# Or use: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

6. **Set up the database**

```bash
# Push the schema to your database
npm run db:push

# Generate Prisma Client
npm run db:generate

# Seed the database with sample data
npm run db:seed
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

### Database Commands

```bash
# Open Prisma Studio (Database GUI)
npm run db:studio

# Create a migration
npm run db:migrate

# Push schema changes
npm run db:push

# Seed database
npm run db:seed
```

## 📁 Project Structure

```
online-shop/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── products/        # Product endpoints
│   │   ├── categories/      # Category endpoints
│   │   └── orders/          # Order endpoints
│   ├── auth/                # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── products/            # Product pages
│   ├── cart/                # Shopping cart
│   ├── checkout/            # Checkout process
│   ├── account/             # User account
│   ├── admin/               # Admin dashboard
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── layout/             # Layout components
│   │   ├── header.tsx
│   │   └── footer.tsx
│   ├── products/           # Product components
│   ├── ui/                 # Shadcn UI components
│   └── providers.tsx       # Context providers
├── lib/                     # Utility libraries
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Helper functions
├── stores/                  # Jotai state stores
│   ├── cart.ts
│   └── wishlist.ts
├── types/                   # TypeScript types
│   ├── index.ts
│   └── next-auth.d.ts
├── prisma/                  # Database schema
│   ├── schema.prisma
│   └── seed.ts
├── public/                  # Static assets
├── .env.example            # Environment variables template
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies

```

## 🗄️ Database Schema

### Main Models

- **User**: Customer and admin accounts
- **Product**: Product catalog with images and pricing
- **Category**: Product categories with hierarchy
- **Order**: Customer orders with status tracking
- **OrderItem**: Individual items in orders
- **Address**: Shipping and billing addresses
- **Review**: Product reviews and ratings
- **WishlistItem**: Saved products

## 🔑 Default Credentials

After seeding the database, you can log in with:

**Admin Account:**

- Email: `admin@example.com`
- Password: `admin123`

**Note:** Change these credentials in production!

## 🎨 UI Components

This project uses Shadcn UI components built on Radix UI primitives:

- Button, Input, Label, Card
- Dialog, Dropdown Menu, Select
- Toast notifications (Sonner)
- Form components with React Hook Form
- And many more...

## 🔐 Authentication

- NextAuth.js v5 (Auth.js)
- Credentials provider (email/password)
- Session-based authentication
- Protected routes and API endpoints
- Role-based access control (Customer/Admin)

## 💳 Payment Integration

Authorize.net integration for secure payment processing:

- Credit card payments
- Transaction management
- Sandbox and production modes
- Secure payment form

## 📧 Email Notifications

Resend API integration for transactional emails:

- Order confirmations
- Shipping notifications
- Account verification
- Password reset

## 🛒 Shopping Features

- **Product Catalog**: Browse and search products
- **Product Details**: Images, description, reviews, ratings
- **Shopping Cart**: Add, remove, update quantities
- **Wishlist**: Save products for later
- **Search**: Find products by name or description
- **Filters**: Category, price range, availability
- **Reviews**: Read and write product reviews

## 👤 User Features

- **Account Management**: Profile, addresses, preferences
- **Order History**: View past orders and tracking
- **Wishlist**: Manage saved products
- **Reviews**: Write and manage product reviews

## 👨‍💼 Admin Features

- **Dashboard**: Sales overview and analytics
- **Product Management**: CRUD operations
- **Order Management**: View and update order status
- **User Management**: View customers and roles
- **Category Management**: Organize products

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

## 📱 Responsive Design

- Mobile-first approach
- Responsive navigation
- Touch-friendly interfaces
- Optimized for all screen sizes

## ⚡ Performance

- Next.js Image optimization
- Static and dynamic rendering
- React Query caching
- Code splitting
- Lazy loading

## 🔒 Security

- CSRF protection
- SQL injection prevention (Prisma)
- Password hashing (bcrypt)
- Secure authentication (NextAuth.js)
- Environment variable protection

## 🌐 SEO

- Metadata API for all pages
- Semantic HTML
- Structured data
- Sitemap generation
- Robot.txt configuration

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

- Railway
- Render
- DigitalOcean App Platform
- AWS/GCP/Azure

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Shadcn for the beautiful UI components
- Prisma for the excellent ORM
- Vercel for hosting and deployment

## 📞 Support

For support, email support@example.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Multiple payment providers (Stripe, PayPal)
- [ ] Advanced analytics dashboard
- [ ] Product recommendations
- [ ] Live chat support
- [ ] Multi-currency support
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)
- [ ] Social media integration
- [ ] Gift cards and coupons
- [ ] Subscription products

---

Built with ❤️ using Next.js and TypeScript
