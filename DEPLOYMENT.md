# Deployment Guide - Biblio (Library Management System)

## Quick Start - Deploy to Render

### Prerequisites
- GitHub account with repository pushed (✅ Already done)
- Render.com account (free)
- MySQL database (or PostgreSQL for Render free tier)

### Step 1: Push Latest Changes to GitHub

```bash
git add .
git commit -m "Deployment: Add render.yaml and environment configuration"
git push
```

### Step 2: Connect to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click **New +** → **Web Service**
3. Select **Connect a repository**
4. Authorize GitHub and select `dbms_mini_project` repository
5. Fill in the configuration:
   - **Name**: `biblio-library`
   - **Environment**: `Node`
   - **Region**: `Oregon` (or closest to your location)
   - **Branch**: `main`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: `Free`

### Step 3: Set Environment Variables

In Render dashboard for your service, go to **Environment**:

```
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_PORT=3306
NODE_ENV=production
```

**For MySQL:**
- Use [FreeMySQLHosting.com](https://www.freemysqlhosting.com/) or similar service
- Or upgrade to paid Render database tier

**Note**: Render free tier doesn't include MySQL. You have two options:
1. **Use External MySQL**: Host your MySQL database separately
2. **Migrate to PostgreSQL**: Switch to PostgreSQL for Render's free tier

### Step 4: Database Setup

#### Option A: External MySQL (Recommended for this project)

1. Create free MySQL hosting at:
   - [FreeMySQLHosting.com](https://www.freemysqlhosting.com/)
   - [db4free.net](https://www.db4free.net/)
   - AWS RDS Free Tier

2. Get your database credentials
3. Set environment variables in Render
4. Run database setup:
   ```bash
   # Once deployed, you can run a setup script
   # Or manually create tables using your MySQL client
   ```

#### Option B: PostgreSQL (For Render Native Support)

1. One-click add PostgreSQL in Render dashboard
2. Update connection string in environment variables
3. Modify `backend/config/db.js` to use PostgreSQL (optional for now)

### Step 5: Create Database and Populate Data

After deployment, you need to populate the database. Two approaches:

**Approach 1: Manual Setup (Easier)**
- Create tables using MySQL client:
  ```sql
  -- books table
  CREATE TABLE books (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    isbn VARCHAR(20) UNIQUE,
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1
  );

  -- members table
  CREATE TABLE members (
    member_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- transactions table
  CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    member_id VARCHAR(20) NOT NULL,
    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    return_date TIMESTAMP,
    fine_amount DECIMAL(10, 2) DEFAULT 0,
    fine_paid BOOLEAN DEFAULT FALSE,
    receipt_id VARCHAR(20),
    status ENUM('Active', 'Returned', 'Overdue') DEFAULT 'Active',
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    FOREIGN KEY (member_id) REFERENCES members(member_id)
  );
  ```
- Insert sample data (see below)

**Approach 2: API Endpoint (Requires Backend Modification)**
- Create `/api/setup/seed` endpoint to populate data
- Call it once after deployment

### Sample Data to Insert

```sql
-- Insert sample books
INSERT INTO books (title, author, genre, isbn, total_copies, available_copies) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', '978-0743273565', 3, 3),
('To Kill a Mockingbird', 'Harper Lee', 'Fiction', '978-0061120084', 2, 2),
('1984', 'George Orwell', 'Dystopian', '978-0451524935', 2, 2),
('Pride and Prejudice', 'Jane Austen', 'Romance', '978-0141439518', 1, 1),
('The Catcher in the Rye', 'J.D. Salinger', 'Fiction', '978-0316769174', 1, 1);

-- Insert sample members
INSERT INTO members (member_id, name, email, phone) VALUES
('M123456789', 'John Doe', 'john@example.com', '555-0101'),
('M987654321', 'Jane Smith', 'jane@example.com', '555-0102'),
('M456789012', 'Bob Wilson', 'bob@example.com', '555-0103'),
('M789012345', 'Alice Brown', 'alice@example.com', '555-0104');
```

### Step 6: Verify Deployment

1. Render provides a URL: `https://biblio-library.onrender.com`
2. Test endpoints:
   ```
   GET https://biblio-library.onrender.com/health
   GET https://biblio-library.onrender.com/
   GET https://biblio-library.onrender.com/api/books
   ```
3. Open main URL in browser to access the library system

### Step 7: Monitor Your Deployment

In Render dashboard:
- **Logs**: View real-time application logs
- **Metrics**: Monitor CPU and memory usage
- **Events**: Track deployment history
- **Alerts**: Set up notifications (upgraded plans)

---

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution**: 
- Verify database credentials in Render environment variables
- Check database server is running and accessible
- Ensure firewall/IP whitelist allows Render's servers

### Issue: "Port is already in use"
**Solution**: 
- Render automatically assigns a port via `process.env.PORT`
- Our code already handles this: `const PORT = process.env.PORT || 5000`
- No action needed

### Issue: "Frontend can't connect to API"
**Solution**: 
- Your frontend is served from the same server
- API calls go to `/api/...` paths (relative URLs)
- Check browser console for errors
- Verify `frontend/js/api.js` is using correct base URL

### Issue: "Build fails with npm error"
**Solution**: 
- Check Render logs for exact error
- Verify `backend/package.json` has all required dependencies
- Try: `npm install` locally to reproduce

### Issue: "Free tier service spinning down"
**Solution**: 
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Consider upgrade if deploying for production use

---

## Environment Variables Reference

### Database Configuration
```
DB_HOST=your-mysql-host.com
DB_USER=db_user
DB_PASSWORD=your_password
DB_NAME=library_db
DB_PORT=3306
```

### Application
```
NODE_ENV=production
PORT=your_render_assigned_port (auto-set by Render)
```

### Optional
```
DEBUG=false
LOG_LEVEL=info
```

---

## Architecture After Deployment

```
┌─────────────────────────────────────────┐
│        Browser (User)                   │
│    https://biblio-library.onrender.com  │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴─────────┐
        │                  │
   ┌────▼─────┐      ┌────▼──────┐
   │ Frontend  │      │  Backend   │
   │ (HTML,JS) │◄────►│ (Node.js)  │
   └──────────┘      └────┬──────┘
                          │
                    ┌─────▼──────┐
                    │  MySQL DB  │
                    │(External or│
                    │PostgreSQL) │
                    └────────────┘
```

---

## Post-Deployment Tasks

- [ ] Test all CRUD operations (Books, Members, Transactions)
- [ ] Verify fine calculation (borrowing, return, fine payment)
- [ ] Test receipt generation and printing
- [ ] Check member registration
- [ ] Verify dashboard statistics
- [ ] Monitor logs for errors
- [ ] Set up uptime monitoring (Uptime Robot, etc.)
- [ ] Document live URL for team/users
- [ ] Set up automated backups for database

---

## Scaling Beyond Free Tier

When ready to upgrade:
1. **Database**: Render PostgreSQL or external managed MySQL
2. **Web Service**: Upgrade from free to Starter plan ($7/month)
3. **CDN**: Add Cloudflare for static asset caching
4. **Monitoring**: Implement error tracking (Sentry, LogRocket)
5. **Security**: Add authentication, input validation, rate limiting

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Node.js Best Practices**: https://nodejs.org/en/docs/guides/nodejs-application-deployment/
- **Database Hosting**: 
  - MySQL: db4free.net, FreeMySQLHosting.com
  - PostgreSQL: Built into Render
- **Project Repository**: Check your GitHub for latest code

---

**Last Updated**: January 2026  
**Project**: Biblio - Library Management System  
**Status**: Production Ready
