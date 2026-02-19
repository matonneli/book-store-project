import React, { useEffect } from 'react';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { fmtZl, KpiCard, SectionTitle, ChartCard, ChartTooltip } from './AnalyticsShared';

const legendFormatter = (v) => <span style={{ fontSize: 11 }}>{v}</span>;

// Map status enum → display name + color
const STATUS_META = {
    CREATED:                    { label: 'Created',              color: '#6c757d' },
    PAID:                       { label: 'Paid',                 color: '#0d6efd' },
    READY_FOR_PICKUP:           { label: 'Ready for Pickup',     color: '#0dcaf0' },
    READY_FOR_PICKUP_UNPAID:    { label: 'Ready (Unpaid)',       color: '#6610f2' },
    DELIVERED_AND_PAID:         { label: 'Delivered & Paid',     color: '#20c997' },
    DELIVERED:                  { label: 'Delivered',            color: '#198754' },
    RETURNED:                   { label: 'Returned',             color: '#adb5bd' },
    CANCELLED:                  { label: 'Cancelled',            color: '#dc3545' },
    CANCELLED_PAID:             { label: 'Cancelled (Paid)',     color: '#fd7e14' },
    CANCELLED_BY_USER_PAID:     { label: 'Cancelled by User',   color: '#e83e8c' },
    CANCELLED_BY_USER_UNPAID:   { label: 'Cancelled by User',   color: '#e83e8c' },
    CANCELLED_BY_DEADLINE_PAID: { label: 'Cancelled (Deadline)',color: '#ffc107' },
    CANCELLED_BY_DEADLINE_UNPAID:{ label: 'Cancelled (Deadline)',color: '#ffc107' },
};

const OverallView = () => {
    const { overallData: d, loadingOverall, error, fetchOverall } = useAnalytics();

    useEffect(() => {
        fetchOverall();
    }, [fetchOverall]);

    if (loadingOverall) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2 text-muted">Loading analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                <strong>Error:</strong> {error}
            </div>
        );
    }

    if (!d) return null;

    const netRevenue = d.netRevenue;
    const totalOrders = Object.values(d.ordersByStatus).reduce((a, b) => a + b, 0);
    const completedOrders = (d.ordersByStatus['DELIVERED'] || 0) + (d.ordersByStatus['DELIVERED_AND_PAID'] || 0);
    const cancelledOrders = Object.entries(d.ordersByStatus)
        .filter(([k]) => k.startsWith('CANCELLED'))
        .reduce((a, [, v]) => a + v, 0);
    const successRate = totalOrders ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0;
    const cancellationRate = totalOrders ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0;

    // Convert ordersByStatus map → array for PieChart
    const statusChartData = Object.entries(d.ordersByStatus).map(([status, value]) => ({
        name: STATUS_META[status]?.label || status,
        value,
        color: STATUS_META[status]?.color || '#adb5bd',
    }));

    // Buy vs Rent pie data
    const buyVsRent = [
        { name: 'Purchase', value: d.totalBuyItems,  color: '#0d6efd' },
        { name: 'Rental',   value: d.totalRentItems, color: '#d63384' },
    ];

    return (
        <>
            {/* ── KPI row ── */}
            <SectionTitle>Key Metrics — All Time</SectionTitle>
            <div className="row mb-4">
                <KpiCard label="Total Revenue"   value={fmtZl(d.totalRevenue)} icon="" variant="success" />
                <KpiCard label="Net Revenue"     value={fmtZl(netRevenue)}      icon="" variant="primary" />
                <KpiCard label="Total Orders"    value={totalOrders}             icon="" variant="info" />
                <KpiCard label="Total Clients"   value={d.totalClients}          icon="" variant="warning" />
            </div>
            <div className="row mb-4">
                <KpiCard label="Total Refunds"   value={fmtZl(d.totalRefunds)}  icon="" variant="danger" />
                <KpiCard label="Avg Order Value" value={fmtZl(d.avgOrderValue)} icon="" variant="info" />
                <KpiCard label="Completion Rate" value={`${successRate}%`}       icon="" variant="success" />
                <KpiCard label="Cancellation"    value={`${cancellationRate}%`}  icon="" variant="danger" />
            </div>

            <hr className="my-3" />

            {/* ── Orders ── */}
            <SectionTitle>Orders</SectionTitle>
            <div className="row mb-4">
                <div className="col-md-5 mb-3">
                    <ChartCard title="Orders by Status">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={statusChartData}
                                    cx="40%" cy="50%"
                                    innerRadius={55} outerRadius={85}
                                    paddingAngle={3} dataKey="value"
                                >
                                    {statusChartData.map((e, i) => (
                                        <Cell key={i} fill={e.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={ChartTooltip} />
                                <Legend
                                    layout="vertical" align="right" verticalAlign="middle"
                                    formatter={legendFormatter}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="col-md-4 mb-3">
                    <ChartCard title="Purchase vs Rental">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={buyVsRent}
                                    cx="50%" cy="50%"
                                    innerRadius={55} outerRadius={85}
                                    paddingAngle={4} dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {buyVsRent.map((e, i) => (
                                        <Cell key={i} fill={e.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={ChartTooltip} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card h-100">
                        <div className="card-header bg-white py-2">
                            <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>Orders by Pickup Point</span>
                        </div>
                        <div className="card-body p-0">
                            <ul className="list-group list-group-flush">
                                {d.ordersByPickupPoint.map((p, i) => (
                                    <li key={i} className="list-group-item py-2 px-3 d-flex justify-content-between align-items-center">
                                        <small className="text-truncate me-2" style={{ maxWidth: 140 }} title={p.name}>
                                            {p.name}
                                        </small>
                                        <span className="badge bg-primary rounded-pill">{p.orders}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="my-3" />

            {/* ── Books ── */}
            <SectionTitle>Books</SectionTitle>
            <div className="row mb-4">
                <div className="col-md-4 mb-3">
                    <ChartCard title="Top Books by Sales">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={d.topBooksBySales} layout="vertical" margin={{ left: 10, right: 16 }}>
                                <CartesianGrid stroke="#f0f0f0" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="title" width={120} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip content={ChartTooltip} />
                                <Bar dataKey="count" fill="#0d6efd" radius={[0, 4, 4, 0]} name="Units sold" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="col-md-4 mb-3">
                    <ChartCard title="Top Books by Rentals">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={d.topBooksByRentals} layout="vertical" margin={{ left: 10, right: 16 }}>
                                <CartesianGrid stroke="#f0f0f0" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="title" width={120} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip content={ChartTooltip} />
                                <Bar dataKey="count" fill="#d63384" radius={[0, 4, 4, 0]} name="Rentals" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="col-md-4 mb-3">
                    <div className="card h-100">
                        <div className="card-header bg-white py-2">
                            <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>Top Rated Books</span>
                        </div>
                        <div className="card-body">
                            {d.topRatedBooks.map((b, i) => (
                                <div key={i} className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <small className="fw-semibold text-truncate me-2" style={{ maxWidth: 160 }}>
                                            <span className="text-muted me-1">#{i + 1}</span>{b.title}
                                        </small>
                                        <div className="d-flex align-items-center gap-1">
                                            <span className="text-warning fw-bold" style={{ fontSize: '0.85rem' }}>
                                                {b.avgRating.toFixed(1)} ★
                                            </span>
                                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                ({b.reviewCount})
                                            </span>
                                        </div>
                                    </div>
                                    <div className="progress" style={{ height: 5 }}>
                                        <div
                                            className="progress-bar bg-warning"
                                            style={{ width: `${(b.avgRating / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <hr className="my-3" />

            {/* ── Clients ── */}
            <SectionTitle>Clients</SectionTitle>
            <div className="row mb-2">
                <div className="col-md-12 mb-3">
                    <ChartCard title="Total Client Growth (monthly)">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={d.clientGrowthMonthly} margin={{ left: 0, right: 16 }}>
                                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={ChartTooltip} />
                                <Line
                                    type="monotone" dataKey="total"
                                    stroke="#0d6efd" strokeWidth={2}
                                    dot={{ fill: '#0d6efd', r: 4 }}
                                    name="Total clients"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </>
    );
};

export default OverallView;