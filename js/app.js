document.addEventListener('DOMContentLoaded', () => {
    // HYSA Elements
    const hysaInputs = {
        start: document.getElementById('hysaStartAmount'),
        contrib: document.getElementById('hysaAnnualContrib'),
        step: document.getElementById('hysaStepIncrease'),
        rate: document.getElementById('hysaRate'),
        bankRate: document.getElementById('hysaBankRate'),
        monthlyView: document.getElementById('hysaMonthlyView')
    };
    const hysaStats = {
        totalContributed: document.getElementById('hysaStatTotalContributed'),
        gain: document.getElementById('hysaStatGain'),
        bankTotal: document.getElementById('hysaStatBankTotal')
    };
    const hysaTableBody = document.getElementById('hysaTableBody');
    let hysaChart;

    // Robo Elements
    const roboInputs = {
        start: document.getElementById('roboStartAmount'),
        contrib: document.getElementById('roboAnnualContrib'),
        step: document.getElementById('roboStepIncrease'),
        rate: document.getElementById('roboRate'),
        inflation: document.getElementById('roboInflationRate')
    };
    const roboStats = {
        totalContributed: document.getElementById('roboStatTotalContributed'),
        gain: document.getElementById('roboStatGain'),
        inflationTotal: document.getElementById('roboStatInflationTotal')
    };
    const roboTableBody = document.getElementById('roboTableBody');
    let roboChart;

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
                }
            }
        },
        scales: {
            y: { ticks: { callback: (val) => formatCurrency(val) } }
        }
    };

    const runHysa = () => {
        const startAmount = parseFloat(hysaInputs.start.value) || 0;
        let annualContrib = parseFloat(hysaInputs.contrib.value) || 0;
        const step = (parseFloat(hysaInputs.step.value) || 0) / 100;
        const rateAPR = (parseFloat(hysaInputs.rate.value) || 0) / 100;
        const bankRateAPR = (parseFloat(hysaInputs.bankRate.value) || 0) / 100;
        const showMonthly = hysaInputs.monthlyView.checked;

        const labels = [];
        const hysaData = [];
        const bankData = [];
        const contribData = [];

        hysaTableBody.innerHTML = '';

        let currentHysa = startAmount;
        let currentBank = startAmount;
        let totalContributed = startAmount;

        const monthlyRate = rateAPR / 12;
        const monthlyBankRate = bankRateAPR / 12;

        for (let year = 1; year <= 20; year++) {
            const monthlyContrib = annualContrib / 12;

            for (let month = 1; month <= 12; month++) {
                currentHysa = (currentHysa + monthlyContrib) * (1 + monthlyRate);
                currentBank = (currentBank + monthlyContrib) * (1 + monthlyBankRate);
                totalContributed += monthlyContrib;

                if (showMonthly) {
                    const label = `Y${year} M${month}`;
                    labels.push(label);
                    hysaData.push(currentHysa.toFixed(2));
                    bankData.push(currentBank.toFixed(2));
                    contribData.push(totalContributed.toFixed(2));

                    const row = `
                        <tr title="Year ${year}, Month ${month}">
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-slate-500">${year} (${month})</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-slate-600">${formatCurrency(totalContributed)}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm font-bold text-indigo-600">${formatCurrency(currentHysa)}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-rose-600">${formatCurrency(currentBank)}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm font-semibold text-emerald-500">${formatCurrency(currentHysa - totalContributed)}</td>
                        </tr>
                    `;
                    hysaTableBody.insertAdjacentHTML('beforeend', row);
                }
            }

            if (!showMonthly) {
                labels.push(`Year ${year}`);
                hysaData.push(currentHysa.toFixed(2));
                bankData.push(currentBank.toFixed(2));
                contribData.push(totalContributed.toFixed(2));

                const row = `
                    <tr>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-500">${year}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">${formatCurrency(totalContributed)}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-indigo-600">${formatCurrency(currentHysa)}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-rose-600">${formatCurrency(currentBank)}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-emerald-500">${formatCurrency(currentHysa - totalContributed)}</td>
                    </tr>
                `;
                hysaTableBody.insertAdjacentHTML('beforeend', row);
            }

            annualContrib *= (1 + step);
        }

        hysaStats.totalContributed.textContent = formatCurrency(totalContributed);
        hysaStats.gain.textContent = formatCurrency(currentHysa - totalContributed);
        hysaStats.bankTotal.textContent = formatCurrency(currentBank);

        updateChart('hysaChart', labels, hysaData, contribData, bankData, 'HYSA (Preferred)', 'Total Contributed', 'Normal Bank', '#4f46e5', '#94a3b8', '#f43f5e', 'hysa');
    };

    const runRobo = () => {
        const startAmount = parseFloat(roboInputs.start.value) || 0;
        let annualContrib = parseFloat(roboInputs.contrib.value) || 0;
        const step = (parseFloat(roboInputs.step.value) || 0) / 100;
        const rateAPY = (parseFloat(roboInputs.rate.value) || 0) / 100;
        const inflationRate = (parseFloat(roboInputs.inflation.value) || 0) / 100;

        const labels = [];
        const roboData = [];
        const inflationData = [];
        const contribData = [];

        roboTableBody.innerHTML = '';

        let currentRobo = startAmount;
        let currentInflationValue = startAmount;
        let totalContributed = startAmount;

        for (let year = 1; year <= 20; year++) {
            currentRobo = (currentRobo + annualContrib) * (1 + rateAPY);
            currentInflationValue = (currentInflationValue + annualContrib) * (1 - inflationRate);
            totalContributed += annualContrib;

            labels.push(`Year ${year}`);
            roboData.push(currentRobo.toFixed(2));
            inflationData.push(currentInflationValue.toFixed(2));
            contribData.push(totalContributed.toFixed(2));

            const row = `
                <tr>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-500">${year}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">${formatCurrency(totalContributed)}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-emerald-600">${formatCurrency(currentRobo)}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-rose-600">${formatCurrency(currentInflationValue)}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-emerald-500">${formatCurrency(currentRobo - totalContributed)}</td>
                </tr>
            `;
            roboTableBody.insertAdjacentHTML('beforeend', row);

            annualContrib *= (1 + step);
        }

        roboStats.totalContributed.textContent = formatCurrency(totalContributed);
        roboStats.gain.textContent = formatCurrency(currentRobo - totalContributed);
        roboStats.inflationTotal.textContent = formatCurrency(currentInflationValue);

        updateChart('roboChart', labels, roboData, contribData, inflationData, 'Investment (Preferred)', 'Total Contributed', 'Real Value (Inflation)', '#10b981', '#94a3b8', '#f43f5e', 'robo');
    };

    const updateChart = (chartId, labels, pref, contrib, other, prefLabel, contribLabel, otherLabel, prefColor, contribColor, otherColor, type) => {
        const ctx = document.getElementById(chartId).getContext('2d');

        let chartInstance = type === 'hysa' ? hysaChart : roboChart;
        if (chartInstance) chartInstance.destroy();

        const newChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: prefLabel,
                        data: pref,
                        borderColor: prefColor,
                        backgroundColor: prefColor + '1A', // 10% opacity
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: contribLabel,
                        data: contrib,
                        borderColor: contribColor,
                        borderWidth: 2,
                        fill: false,
                        tension: 0
                    },
                    {
                        label: otherLabel,
                        data: other,
                        borderColor: otherColor,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0
                    }
                ]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    decimation: { enabled: true, algorithm: 'min-max' }
                }
            }
        });

        if (type === 'hysa') hysaChart = newChart;
        else roboChart = newChart;
    };

    // Event listeners for automatic updates
    Object.values(hysaInputs).forEach(input => {
        input.addEventListener(input.type === 'checkbox' ? 'change' : 'input', runHysa);
    });
    Object.values(roboInputs).forEach(input => input.addEventListener('input', runRobo));

    // Initial run
    runHysa();
    runRobo();

    // Image Zoom Logic
    const introImageContainer = document.getElementById('intro-image-container');
    if (introImageContainer) {
        introImageContainer.addEventListener('click', (e) => {
            introImageContainer.classList.toggle('zoomed');

            // Prevent scrolling when zoomed
            if (introImageContainer.classList.contains('zoomed')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close when clicking escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && introImageContainer.classList.contains('zoomed')) {
                introImageContainer.classList.remove('zoomed');
                document.body.style.overflow = '';
            }
        });
    }
});
