from decimal import Decimal, getcontext
from typing import Dict

# Set precision for Decimal calculations
getcontext().prec = 10  # You can adjust this precision as needed

def calculate_tax_distribution(
        income: float, tax_rates: Dict[str, float]) -> Dict[str, Decimal]:
    """
    Calculate the distribution of taxes based on monthly income and tax rates.

    Args:
    income (float): The monthly income.
    tax_rates (Dict[str, float]): A dictionary where keys are tax categories and values are tax rates in percentages.

    Returns:
    Dict[str, Decimal]: A dictionary containing the tax distribution, total tax, and net income.

    Raises:
    ValueError: If income is negative or if any tax rate is not between 0 and 100.
    """
    if income < 0:
        raise ValueError("Income cannot be negative.")

    # Convert income to Decimal
    monthly_income = Decimal(str(income))
    annual_income = monthly_income * Decimal('12')

    # Convert tax rates to Decimal
    tax_rates_decimal = {
        category: Decimal(str(rate))
        for category, rate in tax_rates.items()
    }

    # Calculate total tax
    total_tax_rate = sum(tax_rates_decimal.values())
    if not 0 <= total_tax_rate <= Decimal('100'):
        raise ValueError("Total tax rates must sum to between 0 and 100%.")

    total_tax = (total_tax_rate / Decimal('100')) * annual_income

    # Calculate tax distribution
    tax_distribution = {
        category: (rate / Decimal('100')) * annual_income
        for category, rate in tax_rates_decimal.items()
    }

    # Add total values
    tax_distribution["total_tax"] = total_tax
    tax_distribution["net_income"] = annual_income - total_tax

    return tax_distribution
