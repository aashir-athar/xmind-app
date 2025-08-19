# 🧠 xMind - Social Media Platform

A full-stack social media application built with React Native, Express.js, and MongoDB. xMind allows users to share thoughts, connect with others, and build meaningful communities through a modern, intuitive interface.

## 🎨 Design Philosophy

### Core Principles
xMind is built on the foundation of **"Mindful Connection"** - the belief that technology should enhance human relationships rather than replace them. Our design philosophy centers around creating meaningful interactions that respect users' time, attention, and mental well-being.

### Design Pillars

#### 1. **Intentional Simplicity**
- **Minimalist Interface**: Clean, uncluttered design that reduces cognitive load
- **Purposeful Features**: Every element serves a specific user need
- **Progressive Disclosure**: Information revealed when contextually relevant
- **Visual Hierarchy**: Clear information architecture that guides user attention

#### 2. **Human-Centered Experience**
- **Emotional Design**: Interfaces that respond to user emotions and states
- **Accessibility First**: Inclusive design for users of all abilities
- **Cultural Sensitivity**: Respect for diverse backgrounds and perspectives
- **Privacy by Design**: User control over personal information and interactions

#### 3. **Quality Over Quantity**
- **Meaningful Content**: Algorithms that prioritize substance over sensationalism
- **Authentic Connections**: Features that encourage genuine relationships
- **Mindful Engagement**: Tools that promote healthy social media habits
- **Community Building**: Systems that foster supportive, inclusive communities

#### 4. **Seamless Integration**
- **Cross-Platform Consistency**: Unified experience across all devices
- **Intuitive Navigation**: Natural interaction patterns that feel familiar
- **Performance Optimization**: Smooth, responsive interactions at all times
- **Offline Capability**: Core functionality available without constant connectivity

### Visual Language
Our design system emphasizes:
- **Organic Shapes**: Rounded corners and natural curves that feel approachable
- **Thoughtful Spacing**: Generous whitespace that creates breathing room
- **Subtle Animations**: Purposeful motion that guides without distracting
- **Color Psychology**: Strategic use of color to evoke specific emotions and states

## 🌟 Features

### 🔐 Authentication & User Management
- **Clerk Authentication**: 
  - Secure OAuth integration with Google, Apple, and email options
  - Multi-factor authentication support
  - Session management with automatic token refresh
  - Secure password policies and account recovery
- **User Profiles**: 
  - Customizable profile pictures with aspect ratio maintenance
  - Banner images with 16:9 ratio optimization
  - Rich bio sections with character limits and formatting
  - Location sharing with privacy controls
  - Customizable display names and usernames
- **Username Management**: 
  - Real-time availability checking against database
  - Comprehensive validation (4-15 characters, alphanumeric + underscores)
  - Reserved word filtering and profanity detection
  - Impersonation prevention and brand protection
  - Case-insensitive uniqueness enforcement
- **Profile Editing**: 
  - In-app modal-based editing with real-time validation
  - Image upload with camera and gallery integration
  - Form validation with immediate feedback
  - Auto-save functionality and change tracking

### 📱 Social Features
- **Post Creation**: 
  - Rich text editor with character limits
  - Image upload with compression and optimization
  - Hashtag auto-suggestion and trending topics
  - Draft saving and post scheduling
  - Privacy controls (public, followers-only, private)
- **Feed System**: 
  - Intelligent ranking algorithm based on user behavior
  - Content relevance scoring and personalization
  - Engagement metrics and interaction patterns
  - Filtering options (latest, trending, following)
  - Infinite scroll with pull-to-refresh
- **Like System**: 
  - Heart-based interaction with animation feedback
  - Like count display and user list visibility
  - Unlike functionality with confirmation
  - Like history and activity tracking
- **Comments**: 
  - Threaded conversation system
  - Nested replies and comment threading
  - Real-time comment updates
  - Comment moderation and reporting
  - Character limits and formatting options
- **Follow System**: 
  - One-click follow/unfollow functionality
  - Follower and following counts
  - Mutual follow detection
  - Follow suggestions based on interests
  - Follow request system for private accounts
- **Notifications**: 
  - Real-time push notifications
  - In-app notification center
  - Customizable notification preferences
  - Notification grouping and management
  - Read/unread status tracking

### 🎨 Modern UI/UX
- **Responsive Design**: 
  - Adaptive layouts for all screen sizes
  - Orientation-aware interface adjustments
  - Safe area handling for notches and home indicators
  - Cross-platform consistency (iOS/Android)
- **Smooth Animations**: 
  - React Native Reanimated 3 for 60fps animations
  - Gesture-based interactions and haptic feedback
  - Staggered entrance animations for content
  - Micro-interactions and state transitions
- **Design System**: 
  - Consistent component library with reusable elements
  - Typography scale and spacing system
  - Color palette with semantic meaning
  - Icon system and visual language
- **Accessibility**: 
  - Screen reader support and VoiceOver compatibility
  - High contrast mode and font scaling
  - Touch target sizing and gesture alternatives
  - Color blindness considerations

### 🔍 Advanced Features
- **Search Functionality**: 
  - Global search across users, posts, and hashtags
  - Search suggestions and recent searches
  - Advanced filters and search operators
  - Search result ranking and relevance
- **Hashtag System**: 
  - Trending hashtag discovery
  - Hashtag following and notifications
  - Hashtag analytics and engagement metrics
  - Content categorization and discovery
- **Image Handling**: 
  - Cloudinary integration for cloud storage
  - Automatic image compression and optimization
  - Multiple image format support
  - Image editing tools and filters
- **Verification System**: 
  - Automatic verification based on engagement metrics
  - Profile completion requirements
  - Post and follower thresholds
  - Verification badge display and status
- **Real-time Updates**: 
  - WebSocket integration for live data
  - Offline-first architecture with sync
  - Background refresh and push notifications
  - Data consistency and conflict resolution

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **React Native 0.72+**: 
  - Cross-platform mobile development framework
  - Native performance with JavaScript development
  - Hot reloading and fast refresh capabilities
  - Platform-specific optimizations for iOS and Android
- **TypeScript 5.0+**: 
  - Static type checking and IntelliSense
  - Interface definitions for all data structures
  - Generic types for reusable components
  - Strict mode for better code quality
- **React Native Reanimated 3**: 
  - 60fps animations with native driver
  - Shared values and animated styles
  - Gesture handling and interactive animations
  - Worklet-based performance optimization
- **Expo SDK 49+**: 
  - Development tools and build services
  - Over-the-air updates and push notifications
  - Camera, image picker, and device APIs
  - EAS Build for production builds
- **React Query (TanStack Query)**: 
  - Server state management and caching
  - Background refetching and synchronization
  - Optimistic updates and error handling
  - Infinite queries and pagination support
- **Custom Hooks Architecture**: 
  - Reusable business logic encapsulation
  - State management and side effects
  - API integration and data fetching
  - Form handling and validation

### Backend Architecture
- **Node.js 18+**: 
  - JavaScript runtime with V8 engine
  - Event-driven, non-blocking I/O
  - Built-in modules and package ecosystem
  - Performance optimization and clustering
- **Express.js 4.18+**: 
  - Minimal and flexible web framework
  - Middleware architecture for extensibility
  - Route handling and parameter parsing
  - Error handling and debugging tools
- **MongoDB 6.0+**: 
  - Document-based NoSQL database
  - Horizontal scaling and sharding
  - Aggregation pipeline for complex queries
  - Change streams for real-time updates
- **Mongoose 7.0+**: 
  - MongoDB object modeling and validation
  - Schema definition with middleware support
  - Query building and population
  - TypeScript integration and type safety
- **File Handling**: 
  - Multer for multipart form data
  - Sharp for image processing and optimization
  - File validation and security checks
  - Temporary file management

### Cloud Services & Infrastructure
- **Cloudinary**: 
  - Cloud-based image and video management
  - Automatic format conversion and optimization
  - CDN delivery and responsive images
  - AI-powered image analysis and tagging
- **MongoDB Atlas**: 
  - Managed MongoDB cloud service
  - Automated backups and point-in-time recovery
  - Global cluster distribution
  - Performance monitoring and optimization

### Authentication & Security
- **Clerk**: 
  - Complete authentication solution
  - OAuth providers (Google, Apple, GitHub)
  - Multi-factor authentication
  - User management and session handling
- **JWT Tokens**: 
  - Stateless authentication tokens
  - Refresh token rotation
  - Token expiration and validation
  - Secure storage and transmission
- **Security Measures**: 
  - Input validation and sanitization
  - SQL injection prevention
  - XSS protection and content security
  - Rate limiting and DDoS protection
- **Data Protection**: 
  - Environment variable encryption
  - API key rotation and management
  - Audit logging and monitoring
  - GDPR compliance and data privacy

### Development Tools & Quality
- **Code Quality**: 
  - ESLint with custom rules and configurations
  - Prettier for consistent code formatting
  - Husky for pre-commit hooks
  - Commitlint for conventional commits
- **Testing Framework**: 
  - Jest for unit and integration testing
  - React Native Testing Library
  - Supertest for API endpoint testing
  - Coverage reporting and thresholds
- **Version Control**: 
  - Git with feature branch workflow
  - Conventional commit messages
  - Automated changelog generation
  - Release management and tagging
- **Performance Monitoring**: 
  - React Native Performance Monitor
  - Bundle analyzer and size optimization
  - Memory leak detection
  - Crash reporting and analytics

## 🚀 Getting Started

### Prerequisites

#### System Requirements
- **Operating System**: macOS 12+, Windows 10+, or Ubuntu 20.04+
- **Node.js**: Version 18.0.0 or higher (LTS recommended)
- **npm**: Version 8.0.0 or higher, or Yarn 1.22+
- **Git**: Version 2.30+ for version control
- **MongoDB**: Version 6.0+ (local installation or Atlas cloud)

#### Development Environment
- **Expo CLI**: Latest version for React Native development
- **React Native CLI**: For advanced native module integration
- **Android Studio**: For Android development and emulation
- **Xcode**: For iOS development (macOS only)
- **VS Code**: Recommended editor with React Native extensions

#### Mobile Development Setup
- **iOS Simulator**: Xcode with iOS Simulator (macOS only)
- **Android Emulator**: Android Studio with AVD Manager
- **Physical Device**: iOS device or Android device for testing
- **Expo Go App**: For quick testing and development

### Installation Guide

#### 1. **Repository Setup**
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/xmind-app.git
   
   # Navigate to project directory
   cd xmind-app
   
   # Verify the structure
   ls -la
   # Should show: Backend/, Mobile/, README.md
   ```

#### 2. **Backend Setup**
   ```bash
   # Navigate to backend directory
   cd Backend
   
   # Install dependencies
   npm install
   
   # Verify installation
   npm list --depth=0
   
   # Check Node.js version
   node --version
   # Should be 18.0.0 or higher
   ```

#### 3. **Mobile App Setup**
   ```bash
   # Navigate to mobile directory
   cd ../Mobile
   
   # Install dependencies
   npm install
   
   # Install Expo CLI globally (if not already installed)
   npm install -g @expo/cli
   
   # Verify Expo installation
   expo --version
   ```

#### 4. **Environment Configuration**

##### Backend Environment Variables
Create a `.env` file in the `Backend/` directory:
   ```bash
   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/xmind?retryWrites=true&w=majority
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Clerk Authentication
   CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
   CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
   
   # Server Configuration
   PORT=5001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   
   # Security
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   REFRESH_TOKEN_EXPIRES_IN=30d
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

##### Mobile App Environment Variables
Create a `.env` file in the `Mobile/` directory:
   ```bash
   # Clerk Authentication
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
   
   # API Configuration
   EXPO_PUBLIC_API_URL=http://localhost:5001/api
   EXPO_PUBLIC_WS_URL=ws://localhost:5001
   
   # App Configuration
   EXPO_PUBLIC_APP_NAME=xMind
   EXPO_PUBLIC_APP_VERSION=1.0.0
   EXPO_PUBLIC_BUILD_NUMBER=1
   
   # Feature Flags
   EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
   EXPO_PUBLIC_ENABLE_ANALYTICS=false
   EXPO_PUBLIC_ENABLE_CRASH_REPORTING=false
   ```

#### 5. **Database Setup**

##### MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster (free tier available)
3. Set up database user with read/write permissions
4. Configure network access (IP whitelist)
5. Get connection string and add to `.env`

##### Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Create database: `use xmind`
4. Set connection string: `mongodb://localhost:27017/xmind`

#### 6. **Cloudinary Setup**
1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get cloud name, API key, and secret
3. Configure upload presets and transformations
4. Add credentials to backend `.env`

#### 7. **Clerk Setup**
1. Create account at [Clerk](https://clerk.com/)
2. Create new application
3. Configure OAuth providers (Google, Apple)
4. Get publishable and secret keys
5. Add keys to both `.env` files

#### 8. **Start Development Servers**

##### Backend Server
   ```bash
   # Navigate to backend
   cd Backend
   
   # Start development server
   npm run dev
   
   # Server should start on http://localhost:5001
   # Check console for successful connection messages
   ```

##### Mobile App
   ```bash
   # Navigate to mobile app
   cd ../Mobile
   
   # Start Expo development server
   npx expo start
   
   # Scan QR code with Expo Go app
   # Or press 'i' for iOS simulator, 'a' for Android
   ```

#### 9. **Verification Steps**
1. **Backend**: Visit `http://localhost:5001/api/health` (should return status)
2. **Database**: Check MongoDB connection in backend console
3. **Mobile**: App should load without errors
4. **Authentication**: Test login/signup flow
5. **API**: Verify API endpoints are accessible

### Troubleshooting

#### Common Issues
- **Port conflicts**: Change PORT in backend `.env`
- **MongoDB connection**: Verify connection string and network access
- **Expo issues**: Clear cache with `expo start -c`
- **Dependencies**: Delete `node_modules` and reinstall

#### Development Tips
- Use `npm run dev:watch` for backend auto-restart
- Enable React Native Debugger for better debugging
- Use Flipper for advanced debugging and performance monitoring
- Check Expo logs for detailed error information

## 📱 App Structure

### Mobile App (`Mobile/`)
```
Mobile/
├── app/                    # App navigation and screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── components/             # Reusable UI components
│   ├── PostCard.tsx       # Post display component
│   ├── EditProfileModal.tsx # Profile editing modal
│   ├── CustomAlert.tsx    # Custom alert system
│   └── ...
├── hooks/                  # Custom React hooks
│   ├── useProfile.ts      # Profile management
│   ├── usePosts.ts        # Posts data handling
│   ├── useCustomAlert.ts  # Alert system
│   └── ...
├── utils/                  # Utility functions
│   ├── api.ts             # API client configuration
│   ├── usernameValidation.ts # Username validation logic
│   ├── verification.ts    # User verification system
│   └── ...
└── constants/              # App constants and configuration
    ├── colors.ts          # Brand color system
    └── ...
```

### Backend (`Backend/`)
```
Backend/
├── src/
│   ├── controllers/        # Route controllers
│   │   ├── user.controller.js    # User operations
│   │   ├── post.controller.js    # Post operations
│   │   └── ...
│   ├── models/            # Database models
│   │   ├── user.model.js  # User schema
│   │   ├── post.model.js  # Post schema
│   │   └── ...
│   ├── routes/            # API routes
│   │   ├── user.route.js  # User endpoints
│   │   ├── post.route.js  # Post endpoints
│   │   └── ...
│   ├── middleware/        # Custom middleware
│   │   ├── auth.middleware.js # Authentication
│   │   └── ...
│   └── utils/             # Helper functions
└── package.json
```

## 🔧 Key Features Implementation

### Feed Ranking Algorithm
The app implements an intelligent feed ranking system that considers:
- User engagement patterns
- Post recency and quality
- User relationships and interactions
- Content relevance scoring

### Username Validation System
Comprehensive username validation including:
- Length requirements (4-15 characters)
- Character restrictions (letters, numbers, underscores only)
- Reserved word filtering
- Profanity detection
- Real-time availability checking
- Database uniqueness validation

### Custom Alert System
Replaces native alerts with:
- Consistent design language
- Multiple alert types (success, error, warning, info)
- Customizable buttons and actions
- Smooth animations and transitions

### Image Management
- Profile picture and banner image uploads
- Camera and gallery integration
- Cloudinary cloud storage
- Automatic image optimization
- Aspect ratio maintenance

### User Verification System
Automatic verification based on:
- Profile completion (picture, bio, location)
- Post count (minimum 10 posts)
- Follower count (minimum 10 followers)
- Account activity and engagement

## 🎨 Design System

### Color Palette
- **Primary**: #4527A0 (Deep Purple)
- **Secondary**: #1565C0 (Blue)
- **Success**: #43A047 (Green)
- **Warning**: #FFB300 (Amber)
- **Danger**: #E53935 (Red)
- **Background**: #FAFAFA (Light Gray)
- **Surface**: #FFFFFF (White)

### Typography
- **Primary Text**: #424242 (Dark Gray)
- **Secondary Text**: #757575 (Medium Gray)
- **Placeholder**: #B0BEC5 (Light Gray)

### Responsive Design
Custom responsive utilities for:
- Font sizes
- Spacing and margins
- Component dimensions
- Border radius
- Icon sizes

## 📊 API Endpoints

### User Management
- `POST /api/users/sync` - Sync user data with Clerk
- `GET /api/users/me` - Get current user
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/username` - Update username
- `GET /api/users/check-username/:username` - Check username availability
- `GET /api/users/profile/:username` - Get user profile
- `POST /api/users/follow/:targetUserId` - Follow/unfollow user
- `POST /api/users/verify/:targetUserId` - Toggle verification

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `POST /api/posts/:postId/like` - Like/unlike post
- `DELETE /api/posts/:postId` - Delete post

### Comments
- `POST /api/comments/post/:postId` - Create comment
- `DELETE /api/comments/:commentId` - Delete comment

### Media
- `POST /api/upload/image` - Upload image to Cloudinary

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive data sanitization
- **Rate Limiting**: API abuse prevention
- **CORS Protection**: Cross-origin request security
- **Environment Variables**: Secure configuration management

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas cluster
2. Configure Cloudinary account
3. Set up Clerk application
4. Deploy to Vercel, Heroku, or similar platform
5. Configure environment variables

### Mobile App Deployment
1. Build with Expo EAS Build
2. Submit to App Store and Google Play Store
3. Configure production API endpoints
4. Test thoroughly on real devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Clerk**: Authentication and user management
- **Expo**: Development tools and SDK
- **React Native**: Cross-platform mobile development
- **MongoDB**: Database solution
- **Cloudinary**: Image storage and optimization

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ by the xMind development team**

*Empowering minds to connect, share, and grow together.*
