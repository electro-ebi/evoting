# 🗳️ Secure E-Voting System

A blockchain-powered electronic voting system with advanced security features including cryptographic key-based authentication, face verification, and real-time blockchain recording.

## 🚀 Features

### Core Voting System
- **Multi-layer Cryptographic Security** - SHA-512 hashing, key-based authentication
- **Blockchain Integration** - Immutable vote recording on Ethereum blockchain
- **Real-time Results** - Live vote counting with blockchain verification
- **Admin Dashboard** - Election management, candidate management, user tracking
- **Mobile Responsive** - Works seamlessly on desktop and mobile devices

### Advanced Security
- **🔐 Secure Voting Keys** - Cryptographic key generation with expiry timers
- **👤 Face Verification** - AI-powered facial recognition using face-api.js
- **📧 Email OTP** - Two-factor authentication via email
- **🔒 JWT Authentication** - Secure session management
- **⏰ Time-based Voting** - Automatic election scheduling with validity checks

### User Experience
- **One-click Key Copy** - Dedicated key display page with clipboard integration
- **Auto-fill Forms** - Seamless navigation between pages with state management
- **Progress Tracking** - Visual step indicators for voting process
- **Countdown Timers** - Real-time expiry warnings for voting keys
- **User Management** - Admin panel showing voting status for all users

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MySQL** database
- **MetaMask** (for blockchain interactions)
- **Gmail account** (for email services)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd evoting-web
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd evoting-backend
npm install
```

### 4. Configure Environment Variables

Create `.env` file in `evoting-backend/`:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=evoting_db

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Blockchain (optional)
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_PORT=8545
```

### 5. Setup Database
```bash
# The app will auto-create tables on first run
# Or manually create the database:
mysql -u root -p
CREATE DATABASE evoting_db;
```

### 6. Deploy Smart Contracts (Optional)
```bash
cd evoting-backend
npx hardhat node  # In one terminal
npx hardhat run scripts/deploy.js --network localhost  # In another terminal
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd evoting-backend
npm start
```
Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
npm start
```
Frontend runs on: `http://localhost:3000`

### Production Build
```bash
npm run build
# Serve the build folder with your preferred server
```

## 📱 Using Cloudflare Tunnels (Public Access)

For remote access without port forwarding:

**Terminal 1 - Backend Tunnel:**
```bash
cloudflared tunnel --url http://localhost:5000
# Note the URL: https://xxx-xxx-xxx.trycloudflare.com
```

**Terminal 2 - Frontend Tunnel:**
```bash
cloudflared tunnel --url http://localhost:3000
# Note the URL: https://yyy-yyy-yyy.trycloudflare.com
```

**Terminal 3 - Update Backend CORS:**
```bash
# Add the frontend tunnel URL to evoting-backend/server.js CORS origins
# Restart backend after updating
```

Access your app via the frontend tunnel URL!

## 👤 Creating Admin Account

```bash
cd evoting-backend
node create-admin.js
```

Follow prompts to create an admin user.

## 📚 Project Structure

```
evoting-web/
├── src/                          # Frontend React app
│   ├── components/               # Reusable components
│   ├── pages/                    # Page components
│   │   ├── admin/                # Admin pages
│   │   ├── Dashboard.js          # User dashboard
│   │   ├── SecureVoting.jsx      # Secure voting flow
│   │   ├── VotingKeyDisplay.jsx  # Key display with copy button
│   │   └── ...
│   └── utils/                    # Utility functions
│       └── apiConfig.js          # Dynamic API configuration
│
├── evoting-backend/              # Backend Node.js server
│   ├── controllers/              # API controllers
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── services/                 # Business logic
│   ├── middleware/               # Auth middleware
│   ├── contracts/                # Solidity smart contracts
│   ├── utils/                    # Crypto utilities
│   └── server.js                 # Express server
│
└── documentation/                # Project documentation
```

## 🔐 Security Features

### Cryptographic Voting Keys
1. User requests voting key
2. System generates 64-character SHA-512 key
3. Key sent via email with 5-minute expiry
4. User copies key from dedicated display page
5. Key verified before allowing vote

### Face Verification (Optional)
- Registration: Capture and store facial descriptors
- Verification: Real-time face matching during voting
- Multiple metrics: Euclidean distance, cosine similarity
- Quality checks: Lighting, angle, descriptor strength

### Blockchain Recording
- All votes recorded on Ethereum blockchain
- Immutable audit trail
- Smart contract-based vote tallying
- Cryptographic proof of vote

## 🎯 User Workflow

### For Voters
1. **Register** - Create account with email verification
2. **Login** - Authenticate with email/password
3. **Face Registration** (optional) - Register facial biometrics
4. **Request Voting Key** - For active election
5. **Copy Key** - From dedicated display page
6. **Verify Key** - Paste key to proceed
7. **Cast Vote** - Select candidate
8. **Confirmation** - Receive confirmation via email

### For Admins
1. **Create Election** - Set title, dates, description
2. **Add Candidates** - Add candidates for election
3. **Monitor Voting** - View live vote counts
4. **User Management** - Track who has voted
5. **View Results** - See final results after election ends

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification

### Elections
- `GET /api/elections` - Get all elections
- `POST /api/elections` - Create election (admin)
- `GET /api/elections/:id` - Get election details

### Secure Voting
- `POST /api/secure-voting/request-key` - Request voting key
- `GET /api/secure-voting/get-key/:email/:electionId` - Get voting key
- `POST /api/secure-voting/verify-key` - Verify voting key
- `POST /api/secure-voting/submit-vote` - Submit vote

### Admin
- `GET /api/users/admin/election/:id/users-status` - Get voting status
- `GET /api/blockchain/stats` - Get blockchain statistics

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd evoting-backend
npm test
```

## 🐛 Troubleshooting

### Database Connection Issues
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists

### Email Not Sending
- Use Gmail App Password (not regular password)
- Enable "Less secure app access" or use OAuth2
- Check `.env` EMAIL_USER and EMAIL_PASS

### Blockchain Issues
- Ensure Hardhat node is running
- Check MetaMask is connected
- Verify contract deployment

### Face Verification Not Working
- Allow camera permissions in browser
- Use HTTPS (required for camera access)
- Ensure good lighting for face detection

## 📖 Documentation

- [BLOCKCHAIN_INTEGRATION.md](BLOCKCHAIN_INTEGRATION.md) - Blockchain setup guide
- [ENHANCED_SECURITY_SYSTEM.md](ENHANCED_SECURITY_SYSTEM.md) - Security features
- [VOTING_KEY_COPY_FEATURE.md](VOTING_KEY_COPY_FEATURE.md) - Key copy feature
- [QUICK_START.md](QUICK_START.md) - Quick setup guide

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React.js for the frontend framework
- Express.js for the backend API
- Hardhat for blockchain development
- face-api.js for facial recognition
- TailwindCSS for styling
- Sequelize for database ORM

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Made with ❤️ for secure and transparent elections**
