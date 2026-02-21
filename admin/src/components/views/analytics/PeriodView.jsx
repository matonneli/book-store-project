import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { fmtZl, KpiCard, SectionTitle, ChartCard, ChartTooltip, ChangeBadge } from './AnalyticsShared';

const legendFormatter = (v) => <span style={{ fontSize: 11 }}>{v}</span>;

const PERIOD_LABELS = {
    7:  { label: 'Last 7 Days' },
    30: { label: 'Last 30 Days' },
};

const STATUS_META = {
    CREATED:                     { label: 'Created',              color: '#6c757d' },
    PAID:                        { label: 'Paid',                 color: '#0d6efd' },
    READY_FOR_PICKUP:            { label: 'Ready for Pickup',     color: '#0dcaf0' },
    READY_FOR_PICKUP_UNPAID:     { label: 'Ready (Unpaid)',       color: '#6610f2' },
    DELIVERED_AND_PAID:          { label: 'Delivered & Paid',     color: '#20c997' },
    DELIVERED:                   { label: 'Delivered',            color: '#198754' },
    RETURNED:                    { label: 'Returned',             color: '#adb5bd' },
    CANCELLED:                   { label: 'Cancelled',            color: '#dc3545' },
    CANCELLED_PAID:              { label: 'Cancelled (Paid)',     color: '#fd7e14' },
    CANCELLED_BY_USER_PAID:      { label: 'Cancelled by User',   color: '#e83e8c' },
    CANCELLED_BY_USER_UNPAID:    { label: 'Cancelled by User',   color: '#e83e8c' },
    CANCELLED_BY_DEADLINE_PAID:  { label: 'Cancelled (Deadline)',color: '#ffc107' },
    CANCELLED_BY_DEADLINE_UNPAID:{ label: 'Cancelled (Deadline)',color: '#ffc107' },
};

const PeriodView = () => {
    const [days, setDays] = useState(30);
    const { periodData: d, loadingPeriod, error, fetchPeriod } = useAnalytics();

    useEffect(() => {
        fetchPeriod(days);
    }, [days]);

    const statusChartData = d
        ? Object.entries(d.ordersByStatus).map(([status, value]) => ({
            name: STATUS_META[status]?.label || status,
            value,
            color: STATUS_META[status]?.color || '#adb5bd',
        }))
        : [];

    const revenueChartData = d?.revenueOverTime?.map(p => ({
        ...p,
        date: new Date(p.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    })) ?? [];

    return (
        <>
            <div className="d-flex align-items-center gap-3 mb-4">
                <span className="text-muted small fw-semibold">Period:</span>
                <div className="btn-group" role="group">
                    {Object.entries(PERIOD_LABELS).map(([key, { label }]) => (
                        <button
                            key={key}
                            className={`btn btn-sm ${days === Number(key) ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setDays(Number(key))}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {loadingPeriod && (
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                )}
            </div>

            {error && (
                <div className="alert alert-danger mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {!d && !loadingPeriod && !error && (
                <div className="text-center py-5 text-muted">No data available.</div>
            )}

            {d && (
                <>
                    <SectionTitle>Key Metrics — {PERIOD_LABELS[days].label}</SectionTitle>
                    <div className="row mb-4">
                        <KpiCard label="Revenue"       value={fmtZl(d.revenue)}      icon="" variant="success" />
                        <KpiCard label="Orders"        value={d.totalOrders}          icon="" variant="primary" />
                        <KpiCard label="Avg Check"     value={fmtZl(d.avgOrderValue)} icon="" variant="info" />
                        <KpiCard label="Refunds"       value={fmtZl(d.refunds)}       icon="" variant="danger" />
                    </div>
                    <div className="row mb-4">
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card border-start border-warning border-4 h-100">
                                <div className="card-body py-3">
                                    <div className="text-muted small text-uppercase fw-semibold mb-1"
                                         style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                                        New Clients
                                    </div>
                                    <div className="fw-bold" style={{ fontSize: '1.4rem' }}>
                                        {d.newClients}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card border-start border-success border-4 h-100">
                                <div className="card-body py-3">
                                    <div className="text-muted small text-uppercase fw-semibold mb-1"
                                         style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                                        Net Revenue
                                    </div>
                                    <div className="fw-bold" style={{ fontSize: '1.4rem' }}>
                                        {fmtZl(d.netRevenue)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card border-start border-primary border-4 h-100">
                                <div className="card-body py-3">
                                    <div className="text-muted small text-uppercase fw-semibold mb-1"
                                         style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                                        Purchases
                                    </div>
                                    <div className="fw-bold" style={{ fontSize: '1.4rem' }}>
                                        {d.buyItems}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card border-start border-danger border-4 h-100">
                                <div className="card-body py-3">
                                    <div className="text-muted small text-uppercase fw-semibold mb-1"
                                         style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                                        Rentals
                                    </div>
                                    <div className="fw-bold" style={{ fontSize: '1.4rem' }}>
                                        {d.rentItems}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="my-3" />

                    <SectionTitle>Revenue & Refunds Over Time</SectionTitle>
                    <div className="row mb-4">
                        <div className="col-12 mb-3">
                            <ChartCard title={`Daily Revenue vs Refunds (${PERIOD_LABELS[days].label})`}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={revenueChartData} margin={{ left: 0, right: 16 }}>
                                        <defs>
                                            <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#0d6efd" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradRef" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#dc3545" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#dc3545" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={ChartTooltip} />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        <Area type="monotone" dataKey="revenue" stroke="#0d6efd" strokeWidth={2}
                                              fill="url(#gradRev)" name="Revenue (zł)" />
                                        <Area type="monotone" dataKey="refunds" stroke="#dc3545" strokeWidth={2}
                                              fill="url(#gradRef)" name="Refunds (zł)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    </div>

                    <hr className="my-3" />

                    <SectionTitle>Orders & Books</SectionTitle>
                    <div className="row mb-4">
                        <div className="col-md-5 mb-3">
                            <ChartCard title="Orders by Status">
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={statusChartData}
                                            cx="40%" cy="50%"
                                            innerRadius={50} outerRadius={80}
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

                        <div className="col-md-7 mb-3">
                            <ChartCard title="Top 5 Books (Sales + Rentals combined)">
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={d.topBooks} layout="vertical" margin={{ left: 10, right: 16 }}>
                                        <CartesianGrid stroke="#f0f0f0" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis type="category" dataKey="title" width={140}
                                               tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={ChartTooltip} />
                                        <Bar dataKey="count" fill="#0d6efd" radius={[0, 4, 4, 0]} name="Orders" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default PeriodView;