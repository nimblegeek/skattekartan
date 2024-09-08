import os
import psycopg2

def init_db():
    conn = psycopg2.connect(
        host=os.environ['PGHOST'],
        database=os.environ['PGDATABASE'],
        user=os.environ['PGUSER'],
        password=os.environ['PGPASSWORD'],
        port=os.environ['PGPORT']
    )
    cur = conn.cursor()

    # Create municipalities table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS municipalities (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL
        )
    ''')

    # Create tax_rates table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS tax_rates (
            id SERIAL PRIMARY KEY,
            municipality VARCHAR(100) REFERENCES municipalities(name),
            income_tax DECIMAL(5,2),
            property_tax DECIMAL(5,2),
            sales_tax DECIMAL(5,2),
            other_taxes DECIMAL(5,2),
            UNIQUE (municipality)
        )
    ''')

    # Insert some sample data
    cur.execute("INSERT INTO municipalities (name) VALUES ('New York'), ('Los Angeles'), ('Chicago') ON CONFLICT (name) DO NOTHING")
    cur.execute('''
        INSERT INTO tax_rates (municipality, income_tax, property_tax, sales_tax, other_taxes)
        VALUES 
            ('New York', 3.88, 0.9, 4.5, 1.2),
            ('Los Angeles', 3.5, 0.75, 5.0, 1.0),
            ('Chicago', 4.2, 0.85, 4.75, 1.1)
        ON CONFLICT (municipality) DO UPDATE SET
            income_tax = EXCLUDED.income_tax,
            property_tax = EXCLUDED.property_tax,
            sales_tax = EXCLUDED.sales_tax,
            other_taxes = EXCLUDED.other_taxes
    ''')

    conn.commit()
    cur.close()
    conn.close()

if __name__ == '__main__':
    init_db()
