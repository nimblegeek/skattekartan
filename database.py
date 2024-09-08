import os
import psycopg2
from psycopg2 import sql

def get_db_connection():
    conn = psycopg2.connect(
        host=os.environ['PGHOST'],
        database=os.environ['PGDATABASE'],
        user=os.environ['PGUSER'],
        password=os.environ['PGPASSWORD'],
        port=os.environ['PGPORT']
    )
    return conn

def get_municipalities():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT name FROM municipalities ORDER BY name;")
    municipalities = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()
    return municipalities

def get_tax_rates(municipality):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        sql.SQL("SELECT income_tax, property_tax, sales_tax, other_taxes FROM tax_rates WHERE municipality = %s;"),
        (municipality,)
    )
    result = cur.fetchone()
    cur.close()
    conn.close()
    
    if result:
        return {
            "Income Tax": result[0],
            "Property Tax": result[1],
            "Sales Tax": result[2],
            "Other Taxes": result[3]
        }
    return None
