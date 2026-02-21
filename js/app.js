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

    // Investment Elements
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
        const startAmount = Number.parseFloat(hysaInputs.start.value) || 0;
        let annualContrib = Number.parseFloat(hysaInputs.contrib.value) || 0;
        const step = (Number.parseFloat(hysaInputs.step.value) || 0) / 100;
        const rateAPR = (Number.parseFloat(hysaInputs.rate.value) || 0) / 100;
        const bankRateAPR = (Number.parseFloat(hysaInputs.bankRate.value) || 0) / 100;
        const showMonthly = hysaInputs.monthlyView.checked;

        const labels = [];
        const hysaData = [];
        const bankData = [];
        const contribData = [];

        hysaTableBody.innerHTML = '';

        let currentHysa = startAmount;
        let currentBank = startAmount;
        let totalContributed = startAmount;

        labels.push(showMonthly ? 'Y0 M0' : 'Year 0');
        hysaData.push(currentHysa.toFixed(2));
        bankData.push(currentBank.toFixed(2));
        contribData.push(totalContributed.toFixed(2));

        const initialRow = `
            <tr class="bg-slate-50 font-semibold">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-500">0</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">${formatCurrency(totalContributed)}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-indigo-600">${formatCurrency(currentHysa)}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-rose-600">${formatCurrency(currentBank)}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-indigo-500">${formatCurrency(0)}</td>
            </tr>
        `;
        hysaTableBody.insertAdjacentHTML('beforeend', initialRow);

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
                            <td class="px-4 py-2 whitespace-nowrap text-sm font-semibold text-indigo-500">${formatCurrency(currentHysa - totalContributed)}</td>
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
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-indigo-500">${formatCurrency(currentHysa - totalContributed)}</td>
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


    const runInvestment = () => {
        const startAmount = Number.parseFloat(roboInputs.start.value) || 0;
        let annualContrib = Number.parseFloat(roboInputs.contrib.value) || 0;
        const step = (Number.parseFloat(roboInputs.step.value) || 0) / 100;
        const rateAPR = (Number.parseFloat(roboInputs.rate.value) || 0) / 100;
        const inflationRate = (Number.parseFloat(roboInputs.inflation.value) || 0) / 100;

        const labels = [];
        const investedData = [];
        const realInvestedData = [];
        const realContribData = [];
        const contribData = [];

        roboTableBody.innerHTML = '';

        let currentInvested = startAmount;
        let totalContributed = startAmount;
        let inflationFactor = 1;

        labels.push('Year 0');
        investedData.push(currentInvested.toFixed(2));
        realInvestedData.push(currentInvested.toFixed(2));
        realContribData.push(totalContributed.toFixed(2));
        contribData.push(totalContributed.toFixed(2));

        const initialRow = `
            <tr class="bg-slate-50 font-semibold">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-500">0</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">${formatCurrency(totalContributed)}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-emerald-600">${formatCurrency(currentInvested)}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-emerald-500">${formatCurrency(0)}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-rose-600">${formatCurrency(totalContributed)}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-indigo-600">${formatCurrency(currentInvested)}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-indigo-500">${formatCurrency(0)}</td>
            </tr>
        `;
        roboTableBody.insertAdjacentHTML('beforeend', initialRow);

        currentInvested *= (1 + rateAPR);
        let realInvested = currentInvested;
        let realContrib = totalContributed;

        for (let year = 1; year <= 20; year++) {
            currentInvested = (currentInvested + annualContrib)
            totalContributed += annualContrib;
            inflationFactor *= (1 + inflationRate);

            realInvested = currentInvested / inflationFactor;
            realContrib = totalContributed / inflationFactor;

            labels.push(`Year ${year}`);
            investedData.push(currentInvested.toFixed(2));
            realInvestedData.push(realInvested.toFixed(2));
            realContribData.push(realContrib.toFixed(2));
            contribData.push(totalContributed.toFixed(2));

            const row = `
                <tr>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-500">${year}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">${formatCurrency(totalContributed)}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-emerald-600">${formatCurrency(currentInvested)}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-emerald-500">${formatCurrency(currentInvested - totalContributed)}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-rose-600">${formatCurrency(realContrib)}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-indigo-600">${formatCurrency(realInvested)}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-indigo-500">${formatCurrency(realInvested - realContrib)}</td>
                </tr>
            `;
            roboTableBody.insertAdjacentHTML('beforeend', row);

            currentInvested *= (1 + rateAPR);
            annualContrib *= (1 + step);
        }

        roboStats.totalContributed.textContent = formatCurrency(totalContributed);
        roboStats.gain.textContent = formatCurrency(realInvested - realContrib);
        roboStats.inflationTotal.textContent = formatCurrency(realContrib);

        updateInvestmentChart(labels, investedData, realInvestedData, realContribData, contribData);
    };

    const updateInvestmentChart = (labels, roboData, realPortfolioData, realContribData, contribData) => {
        const ctx = document.getElementById('roboChart').getContext('2d');
        if (roboChart) roboChart.destroy();

        roboChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Investment (Value)',
                        data: roboData,
                        borderColor: '#10b981',
                        backgroundColor: '#10b9811A',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Investment (After Inflation)',
                        data: realPortfolioData,
                        borderColor: '#4f46e5',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: 'Contributed (After Inflation)',
                        data: realContribData,
                        borderColor: '#f43f5e',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0
                    },
                    {
                        label: 'Contributed',
                        data: contribData,
                        borderColor: '#94a3b8',
                        borderWidth: 2,
                        fill: false,
                        tension: 0
                    }
                ]
            },
            options: commonOptions
        });
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
    Object.values(roboInputs).forEach(input => input.addEventListener('input', runInvestment));

    // Initial run
    runHysa();
    runInvestment();

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

    // Tooltip Mobile Support
    document.querySelectorAll('.tooltip-container').forEach(container => {
        container.addEventListener('click', (e) => {
            // Toggle active class for mobile/touch
            const wasActive = container.classList.contains('active');

            // Close all others
            document.querySelectorAll('.tooltip-container').forEach(c => c.classList.remove('active'));

            if (!wasActive) {
                container.classList.add('active');
            }

            // Prevent event bubbling if it's a click that should only trigger the tooltip
            if (window.innerWidth < 768) {
                e.stopPropagation();
            }
        });
    });

    // Close tooltips when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.tooltip-container').forEach(c => c.classList.remove('active'));
    });
});
