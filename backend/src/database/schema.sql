-- Austin Move Finder Database Schema

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Quotes table  
CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    move_type TEXT NOT NULL CHECK (move_type IN ('local', 'long-distance', 'commercial', 'storage')),
    move_date DATE NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT,
    estimated_size TEXT NOT NULL CHECK (estimated_size IN ('studio', '1br', '2br', '3br', '4br+', 'commercial')),
    special_items TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'booked', 'completed', 'cancelled')),
    estimated_cost DECIMAL(10,2),
    final_cost DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Detected items table
CREATE TABLE IF NOT EXISTS detected_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL,
    item_label TEXT NOT NULL,
    confidence_score REAL NOT NULL,
    quantity INTEGER DEFAULT 1,
    estimated_cost DECIMAL(8,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

-- Media files table
CREATE TABLE IF NOT EXISTS media_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

-- Quote history for tracking changes
CREATE TABLE IF NOT EXISTS quote_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

-- Austin neighborhood data
CREATE TABLE IF NOT EXISTS neighborhoods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    zone TEXT NOT NULL, -- 'central', 'north', 'south', 'east', 'west'
    avg_rent INTEGER,
    walk_score INTEGER,
    difficulty_multiplier DECIMAL(3,2) DEFAULT 1.0, -- For pricing adjustments
    special_requirements TEXT, -- parking, stairs, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pricing rules for dynamic cost calculation
CREATE TABLE IF NOT EXISTS pricing_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_name TEXT NOT NULL UNIQUE,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('item', 'distance', 'seasonal', 'location')),
    condition_json TEXT NOT NULL, -- JSON conditions
    multiplier DECIMAL(3,2) NOT NULL,
    fixed_cost DECIMAL(8,2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_move_date ON quotes(move_date);
CREATE INDEX IF NOT EXISTS idx_detected_items_quote_id ON detected_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_media_files_quote_id ON media_files(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_history_quote_id ON quote_history(quote_id);