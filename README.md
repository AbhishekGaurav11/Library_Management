# 📚 Biblio - Library Management System

A modern, full-stack library management system built with Node.js, Express, and MySQL. Features book cataloging, member management, transaction tracking, late fine calculation, and receipt generation.

## 🎯 Features

- **📖 Book Management**: Add, update, delete books with genres and availability tracking
- **👥 Member Management**: Register and manage library members
- **📋 Transaction Tracking**: Borrow and return books with automatic date tracking
- **💰 Fine Management**: Automatic late fine calculation ($2/day) and payment tracking
- **🧾 Receipt Generation**: Print receipts for borrowed books and transactions
- **📊 Dashboard**: Real-time library statistics and analytics
- **🎨 Modern UI**: Dark-themed, responsive interface

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **No Frontend Framework**: Pure JavaScript for lightweight performance

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- Git

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/biblio.git
cd biblio
```

### 2. Setup Backend

```bash
cd backend
npm install
```

### 3. Configure Database

1. **Create MySQL Database:**
```sql
CREATE DATABASE biblio;
```

2. **Update Database Connection** in `backend/config/db.js`:
```javascript
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "your_password",  // Update this
  database: "biblio"
});
```

### 4. Create Database Tables

```bash
cd backend
node createTables.js
```

### 5. (Optional) Seed Sample Data

```bash
node seed.js
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
node server.js
```
The server will run on `http://localhost:5000`

### Start Frontend

```bash
cd frontend
python -m http.server 5500
```
Or if using Node.js:
```bash
npx http-server -p 5500
```

Open your browser and go to: `http://localhost:5500`

## 📁 Project Structure

```
biblio/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/           # Request handlers
│   │   ├── bookController.js
│   │   ├── memberController.js
│   │   └── transactionController.js
│   ├── models/                # Database queries
│   │   ├── bookModel.js
│   │   ├── memberModel.js
│   │   └── transactionModel.js
│   ├── routes/                # API endpoints
│   │   ├── bookRoutes.js
│   │   ├── memberRoutes.js
│   │   └── transactionRoutes.js
│   ├── app.js                 # Express app setup
│   ├── server.js              # Server entry point
│   ├── createTables.js        # Schema creation
│   ├── seed.js                # Sample data
│   └── package.json
│
├── frontend/
│   ├── index.html             # Main HTML
│   ├── js/
│   │   ├── api.js             # API client
│   │   ├── books.js           # Book management
│   │   ├── members.js         # Member management
│   │   └── transactions.js    # Transaction management
│
└── .gitignore
```

## 🔌 API Endpoints

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Add a new book
- `DELETE /api/books/:id` - Delete a book
- `PATCH /api/books/:id/copies` - Add copies

### Members
- `GET /api/members` - Get all members
- `POST /api/members` - Add a new member

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions/borrow` - Borrow a book
- `POST /api/transactions/return` - Return a book (auto-calculates fine)
- `POST /api/transactions/pay-fine` - Record fine payment

## 💰 Fine System

- **Late Fine Rate**: $2 per day overdue
- **Auto Calculation**: Fine is calculated automatically when a book is returned late
- **Payment Tracking**: Mark fines as paid in the Transactions tab
- **Fine Status**: 
  - ✅ No fine (returned on time)
  - 🔴 Pending (book overdue, not returned)
  - 💰 Unpaid (returned late, fine unpaid)
  - ✔️ Paid (fine paid - mark with "Pay Fine" button)

## 📊 Dashboard Stats

The dashboard displays:
- Total Books & Available Books
- Active Loans & Overdue Items
- Active Members & Total Fines
- Genre Categories & Total Transactions
- Books by Genre breakdown
- Recent Activity feed

## 🖨️ Receipt Features

Receipts include:
- Receipt ID & Date
- Book details (Title, Author)
- Member information
- Borrow/Due/Return dates
- Fine amount (if applicable)
- Fine payment status

## 📝 Database Schema

### Books Table
```sql
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(100),
  genre VARCHAR(50),
  year INT,
  copies INT,
  available INT
);
```

### Members Table
```sql
CREATE TABLE members (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  joined DATE,
  active BOOLEAN DEFAULT 1
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  member_id VARCHAR(10) NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  return_date DATE,
  returned BOOLEAN DEFAULT false,
  fine_amount DECIMAL(10,2) DEFAULT 0,
  fine_paid BOOLEAN DEFAULT false,
  receipt_id VARCHAR(20),
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Your Name - [GitHub Profile](https://github.com/yourusername)

## 📞 Support

For support, email support@biblio.com or open an issue on GitHub.

## 🎉 Acknowledgments

- Built for library management education
- Inspired by modern library systems
- Created with ❤️ for book lovers
