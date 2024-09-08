from flask import Flask, render_template, request, jsonify
from tax_calculator import calculate_tax_distribution
from database import get_municipalities, get_tax_rates

app = Flask(__name__)

@app.route("/")
def index():
    municipalities = get_municipalities()
    return render_template("index.html", municipalities=municipalities)

@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.json
    income = float(data["income"])
    municipality = data["municipality"]
    
    tax_rates = get_tax_rates(municipality)
    if not tax_rates:
        return jsonify({"error": "Invalid municipality"}), 400
    
    tax_distribution = calculate_tax_distribution(income, tax_rates)
    return jsonify(tax_distribution)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
