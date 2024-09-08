document.addEventListener('DOMContentLoaded', () => {
    const taxForm = document.getElementById('tax-form');
    const dashboardContainer = document.createElement('div');
    document.querySelector('.container').appendChild(dashboardContainer);

    taxForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const income = document.getElementById('income').value;
        const municipality = document.getElementById('municipality').value;

        if (!income || !municipality) {
            showError('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ income, municipality }),
            });

            if (!response.ok) {
                throw new Error('Invalid input or server error');
            }

            const data = await response.json();
            displayDashboard(data, income);
        } catch (error) {
            showError(error.message);
        }
    });

    function showError(message) {
        const errorElement = document.createElement('p');
        errorElement.classList.add('error');
        errorElement.textContent = message;
        taxForm.appendChild(errorElement);
        setTimeout(() => errorElement.remove(), 3000);
    }

    function displayDashboard(data, monthlyIncome) {
        dashboardContainer.innerHTML = '';
        fetch('/templates/dashboard.html')
            .then(response => response.text())
            .then(html => {
                dashboardContainer.innerHTML = html;
                updateDashboardData(data, monthlyIncome);
                createChart(data);
            });
    }

    function updateDashboardData(data, monthlyIncome) {
        const annualIncome = monthlyIncome * 12;
        document.getElementById('annual-income').textContent = formatCurrency(annualIncome);
        document.getElementById('total-tax').textContent = formatCurrency(data.total_tax);
        document.getElementById('net-income').textContent = formatCurrency(data.net_income);
        document.getElementById('effective-tax-rate').textContent = ((data.total_tax / annualIncome) * 100).toFixed(2) + '%';
    }

    function createChart(data) {
        const ctx = document.getElementById('tax-distribution-chart').getContext('2d');
        const chartData = {
            labels: Object.keys(data).filter(key => key !== 'total_tax' && key !== 'net_income'),
            datasets: [{
                data: Object.values(data).filter((_, index) => index < Object.keys(data).length - 2),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                ],
            }],
        };

        new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Tax Distribution',
                    },
                },
            },
        });
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
});
