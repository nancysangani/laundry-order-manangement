# 🧼 Quick Dry Cleaning - Order Management System

A full-stack web application for managing laundry orders with staff authentication and MongoDB data persistence.

## Features

### Authentication & Security
- ✅ Staff-only login and registration system
- ✅ JWT token-based authentication (24-hour expiry)
- ✅ Secure password hashing with bcryptjs
- ✅ Protected API endpoints with middleware

### Order Management
- ✅ Create orders with customer details and garment selection
- ✅ Track order status: RECEIVED → PROCESSING → READY → DELIVERED
- ✅ View all orders with filtering by status, customer name, or phone number
- ✅ Update order status in real-time
- ✅ Delete orders with confirmation
- ✅ Automatic delivery date estimation (3 days from creation)

### Dashboard & Analytics
- ✅ Real-time statistics: Total orders, total revenue, average order value
- ✅ Order breakdown by status
- ✅ Recent orders display
- ✅ User-specific data isolation (each staff member sees only their orders)

### Database
- ✅ MongoDB Atlas integration for persistent storage
- ✅ Mongoose schema validation
- ✅ Order-to-staff linkage for accountability

## Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT authentication
- bcryptjs for password hashing

**Frontend:**
- Vanilla JavaScript
- HTML5 + CSS3
- Fetch API for REST calls

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm
- MongoDB Atlas account (free tier available)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quick-dry-cleaning
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure MongoDB**
   - Create a MongoDB Atlas cluster (https://www.mongodb.com/cloud/atlas)
   - Create a database user with read/write permissions
   - Get your connection string

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quick-dry-cleaning
   JWT_SECRET=your_secret_key_here
   ```

5. **Start the server**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:3000`

## Usage

### First Time Login
1. Click "Register here" to create a staff account
2. Enter username, email (optional), and password
3. Login with your credentials

### Creating an Order
1. Click "Create Order" tab
2. Enter customer details (name & phone)
3. Add garments with quantities
4. Submit to create order

### Managing Orders
- **View Orders**: See all orders with filter options
- **Update Status**: Change order status (RECEIVED → PROCESSING → READY → DELIVERED)
- **Delete Order**: Delete order with confirmation
- **Dashboard**: View statistics and recent orders

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new staff account
- `POST /api/auth/login` - Login and receive JWT token

### Orders (Protected - require JWT token)
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all user's orders (with filtering)
- `GET /api/orders/:orderId` - Get single order details
- `PATCH /api/orders/:orderId/status` - Update order status
- `POST /api/delete/:orderId` - Delete order

### Public Endpoints
- `GET /api/garments` - Get list of garments and pricing
- `GET /api/health` - Health check

## Security Features

- **Password Security**: Passwords hashed with bcrypt (10 rounds)
- **Authentication**: JWT tokens expire after 24 hours
- **Authorization**: Users can only access their own orders
- **Input Validation**: Server-side validation on all endpoints
- **CORS**: Configured for development

## Project Structure

```
quick-dry-cleaning/
├── server.js              # Main Express server
├── models/
│   ├── User.js           # User schema with password hashing
│   └── Order.js          # Order schema
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── public/
│   └── index.html        # Frontend UI
└── package.json          # Dependencies
```

## Development Notes

Full-stack application demonstrating:
- Database persistence (MongoDB)
- User authentication and authorization
- RESTful API design
- Responsive frontend UI
- Production-ready code structure

Perfect for small to medium laundry shop operations.

---

## AI Usage Report

### Tools & Approach
- **Claude (Anthropic)** - Primary AI tool for architecture, code generation, debugging, and problem-solving
- **Strategy:** Use AI to accelerate scaffolding and architectural decisions, validate all implementations independently

---

### Complete AI Journey (Beginning to End)

#### Phase 1: Project Initialization & Architecture
**Initial Prompt:**
```
"I need to build a laundry order management system. The assignment asks for:
- Create orders (customer details, garments, pricing)
- Track order status
- View orders with filtering
- Basic dashboard
Should I use SQL or MongoDB? Which is better for rapid development?"
```

**AI Response:**
- Recommended MongoDB + Mongoose for flexibility and faster development
- Suggested JWT authentication for stateless auth
- Provided basic schema structure for User and Order models

**Implementation Decision:** ✅ Accepted recommendation
- MongoDB was ideal for flexible schema iteration
- MongoDB Atlas free tier eliminated database setup complexity
- JWT stateless auth perfect for REST API

**What AI Got Right:** Architecture recommendation was sound and production-ready

---

#### Phase 2: Backend Scaffolding
**Prompt:**
```
"Show me a basic Express.js server structure that connects to MongoDB 
and includes error handling for connection failures"
```

**AI Provided:**
- Express server setup with middleware configuration
- MongoDB connection with error handling
- Basic server startup code

**What I Improved:**
- Enhanced error messages for better debugging
- Added environment variable validation
- Improved connection retry logic

**Result:** ✅ Used AI output as starting point, verified and enhanced before implementation

---

#### Phase 3: User Authentication Implementation
**Prompt:**
```
"Create a User schema for authentication with Mongoose. 
Include password hashing with bcrypt."
```

**AI Initial Code:**
```javascript
userSchema.pre("save", async function(next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

**What AI Got Wrong:**
- Hashes password on EVERY save, even if password wasn't modified
- No error handling in the pre-save hook
- Inefficient for performance

**How I Fixed It:**
```javascript
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();  // ← Added check
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);  // ← Added error handling
  }
});
```

**Why This Matters:** Security and performance - prevents unnecessary hashing operations

---

#### Phase 4: Frontend Login Flow
**Prompt:**
```
"How should I store JWT tokens in frontend JavaScript? 
What's the best way to include them in API requests?"
```

**AI Response:**
- Store JWT in localStorage
- Add to Authorization header as "Bearer {token}"
- Clear on logout

**Implementation:** ✅ Used as-is
```javascript
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}
```

**Result:** This approach worked perfectly. Standard practice for SPAs.

---

#### Phase 5: Order Management API Endpoints
**Prompt:**
```
"Create POST endpoint for creating orders. Include:
- Customer details validation
- Garment selection with quantities
- Automatic total bill calculation
- Order ID generation"
```

**AI Provided:**
- Basic endpoint structure
- Validation logic
- Database save operation

**What I Enhanced:**
- Added user isolation (createdBy field ensures data security)
- Implemented proper error responses
- Added estimated delivery date calculation
- Validated garment prices against master list

**Result:** ✅ AI gave solid foundation, I added business logic and security

---

#### Phase 6: Dashboard Statistics
**Prompt:**
```
"Create an endpoint that returns dashboard stats:
- Total orders count
- Total revenue
- Orders by status
- Average order value"
```

**AI Response:**
- Basic data aggregation using MongoDB queries
- Simple calculation logic

**My Implementation:**
- Used reduce() for efficient calculation
- Filtered by user ID for data isolation
- Handled edge cases (no orders = 0 values)
- Formatted currency output

**Result:** ✅ AI structure was good, I optimized and added formatting

---

#### Phase 7: Frontend UI & Display Toggle (Major Debugging)
**Prompt:**
```
"Create a login form and registration form on the same page. 
Switch between them when users click links."
```

**AI Initial Suggestion:**
```css
.hidden { display: none !important; }
.tab-content { display: none; }
.tab-content.active { display: block; }
```

```javascript
function switchToRegister() {
  document.getElementById('login').classList.remove('active');
  document.getElementById('register').classList.add('active');
}
```

**What AI Got Wrong:**
- CSS `!important` creates specificity conflicts
- Class-based toggling conflicts with !important rules
- Form remained invisible when CSS !important overrides were present

**Root Cause:**
```
Element classes: .tab-content .hidden .active
CSS rules:
.hidden { display: none !important; }     ← Wins
.tab-content.active { display: block; }   ← Loses (no !important)
```

**How I Fixed It:**
Changed to direct inline style manipulation:
```javascript
function switchToRegister() {
  document.getElementById('login').style.display = 'none';
  document.getElementById('register').style.display = 'block';
}
```

**Why This Works:**
- Inline styles avoid CSS specificity wars
- Clear, explicit intent
- No CSS conflicts

**Learning:** When CSS and JavaScript fight over visibility, use direct style manipulation

---

#### Phase 8: Form Data Management
**Prompt:**
```
"How do I clear form fields after user submits an order?"
```

**AI Suggestion:**
```javascript
document.querySelector('form').reset();
```

**What Went Wrong:**
- Multiple forms on page (login, register, create order)
- querySelector('form') selects FIRST form (login form)
- reset() ran on wrong form
- User data didn't actually clear

**How I Improved It:**
```javascript
document.getElementById('customerName').value = '';
document.getElementById('phoneNumber').value = '';
document.getElementById('notes').value = '';
document.getElementById('garmentsList').innerHTML = '';
```

**Why Explicit is Better:**
- No ambiguity about which form
- Unambiguous intent
- Easier to debug
- Maintainable

---

#### Phase 9: Order Filtering & Search
**Prompt:**
```
"Create filtering for orders by status, customer name, and phone number"
```

**AI Provided:**
```javascript
const query = {};
if (status) query.status = status;
if (customerName) query.customerName = customerName;
if (phoneNumber) query.phoneNumber = phoneNumber;
```

**What I Added:**
```javascript
if (customerName) {
  query.customerName = { $regex: customerName, $options: "i" };  // Case-insensitive
}
if (phoneNumber) {
  query.phoneNumber = { $regex: phoneNumber };  // Partial match
}
```

**Why:** Better user experience - partial matches, case-insensitive search

---

### Summary: AI Usage Pattern

| Phase | AI Role | Implementation |
|-------|---------|-----------------|
| Architecture | Suggest best tech | Validated, used recommendation |
| Scaffolding | Provide boilerplate | Used as-is, enhanced error handling |
| Core Logic | Generate structure | Improved security & performance |
| API Design | Outline endpoints | Added business logic & validation |
| Frontend | Suggest approaches | Fixed bugs, optimized implementations |

**Key Takeaway:** AI provided 70% of the solution. The remaining 30% required validation, debugging, security hardening, and optimization.

---

### What AI Could Not Do

- ❌ Understand business requirements (I had to interpret "staff-only auth means user isolation")
- ❌ Debug CSS specificity conflicts (required understanding CSS cascading rules)
- ❌ Optimize form field management (required understanding DOM behavior with multiple forms)
- ❌ Implement complete error handling (required thinking through edge cases)
- ❌ Make architectural tradeoffs (required judgment about scope and priorities)

### What AI Excelled At

- ✅ Providing boilerplate scaffolding
- ✅ Suggesting industry-standard patterns
- ✅ Generating basic CRUD operations
- ✅ Validating technical approaches
- ✅ Providing code examples to learn from

---

## Tradeoffs & Future Improvements

### Features Intentionally Not Included

#### 1. Customer-Facing Portal
**Decision:** Staff-only system per requirements
- **Rationale:** Internship specification is staff management, not customer-facing
- **Alternative:** Could build customer pickup tracking separately

#### 2. Email Notifications
**Decision:** Deferred (out of scope)
- **Rationale:** Requires external service (SendGrid/Gmail), adds infrastructure complexity
- **Alternative:** Could implement with webhook service later

#### 3. Admin Dashboard
**Decision:** Staff isolation sufficient for MVP
- **Rationale:** Scope beyond core requirements, staff members have full access to their data
- **Alternative:** Easy to add role-based access later if needed

#### 4. Advanced Search Features
**Decision:** Basic filtering is sufficient
- **Implemented:** Search by status, customer name, phone number
- **Not Implemented:** Date range search, garment-type filtering (not required for MVP)

#### 5. Payment Integration
**Decision:** Not applicable for laundry pre-payment model
- **Rationale:** Laundry shops collect payment on delivery, not during order
- **Future:** Can add if business model changes

---

### Planned Improvements (If Development Continues)

**High Priority:**
- Role-based access control (admin vs. staff vs. supervisor)
- Email notifications for order status changes
- Order notes and staff comments
- Activity logging (who made which changes)

**Medium Priority:**
- Automated testing (unit, integration, E2E)
- Database performance optimization (indexing)
- Mobile UI responsive design
- Advanced analytics and reporting

**Lower Priority:**
- Multi-location support
- Inventory tracking integration
- Customer self-service portal
- API rate limiting
- Deployment automation

---

### Architecture Decisions Made

| Aspect | Choice | Why |
|--------|--------|-----|
| Database | MongoDB | Flexible schema, cloud-hosted, free tier |
| Authentication | JWT + bcrypt | Stateless, secure, REST-compliant |
| Frontend | Vanilla JavaScript | Fast to build, no build step, suitable for scope |
| Styling | CSS + inline styles | Complete control, no CSS framework overhead |
| Deployment | Local (not deployed) | Focus on features, could deploy to Heroku/AWS |

---

### Code Quality Decisions

**Prioritized:**
- Security (password hashing, JWT tokens, authorization checks)
- Functionality (all features work end-to-end)
- Clarity (readable code, logical structure)

**Deprioritized:**
- TypeScript (added complexity without benefit for this scope)
- Comprehensive JSDoc comments (code is self-explanatory)
- Perfect error handling for impossible scenarios (YAGNI principle)
- Performance optimization beyond MVP needs
