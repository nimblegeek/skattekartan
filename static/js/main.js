document.addEventListener('DOMContentLoaded', () => {
    const taxForm = document.getElementById('tax-form');
    const modal = document.getElementById('map-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModal = document.getElementById('close-modal');

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
            displayMap(data, income);
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

    function displayMap(data, monthlyIncome) {
        modalContent.innerHTML = '';
        const mapContent = createMapContent(data, monthlyIncome);
        modalContent.innerHTML = mapContent;
        modal.classList.remove('hidden');
        createChart(data);
    }

    function createMapContent(data, monthlyIncome) {
        const annualIncome = monthlyIncome * 12;
        return `
            <h2 class="text-2xl font-bold mb-4">Tax Distribution Map</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-100 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold mb-2">Annual Income</h3>
                    <p class="text-2xl font-bold">${formatCurrency(annualIncome)}</p>
                </div>
                <div class="bg-gray-100 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold mb-2">Total Tax</h3>
                    <p class="text-2xl font-bold">${formatCurrency(data.total_tax)}</p>
                </div>
                <div class="bg-gray-100 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold mb-2">Net Income</h3>
                    <p class="text-2xl font-bold">${formatCurrency(data.net_income)}</p>
                </div>
                <div class="bg-gray-100 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold mb-2">Effective Tax Rate</h3>
                    <p class="text-2xl font-bold">${((data.total_tax / annualIncome) * 100).toFixed(2)}%</p>
                </div>
            </div>
            <div class="mt-8">
                <canvas id="tax-distribution-chart"></canvas>
            </div>
        `;
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

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });
});
