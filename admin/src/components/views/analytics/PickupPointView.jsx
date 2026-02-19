import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { useReferences } from '../../../contexts/AdminReferenceContext';
import { useAuth } from '../../../contexts/AuthContext';
import { fmtZl, KpiCard, SectionTitle, ChartCard, ChartTooltip } from './AnalyticsShared';

const legendFormatter = (v) => <span style={{ fontSize: 11 }}>{v}</span>;

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

const PickupPointView = () => {
    const { userInfo } = useAuth();
    const { pickUpPoints } = useReferences();
    const { pickupPointData: d, loadingPickupPoint, error, fetchPickupPoint } = useAnalytics();

    const isWorker = userInfo?.role === 'WORKER';

    // For worker — always their own point. For admin — selector.
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        if (isWorker && userInfo?.pickUpPoint?.pickupPointId) {
            // Worker: auto-load their own point
            const id = userInfo.pickUpPoint.pickupPointId;
            setSelectedId(id);
            fetchPickupPoint(id);
        } else if (!isWorker && pickUpPoints.length > 0 && !selectedId) {
            // Admin: default to first pickup point
            const id = pickUpPoints[0].pickupPointId;
            setSelectedId(id);
            fetchPickupPoint(id);
        }
    }, [isWorker, userInfo, pickUpPoints]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSelectPoint = (id) => {
        setSelectedId(id);
        fetchPickupPoint(id);
    };

    const statusChartData = d
        ? Object.entries(d.ordersByStatus).map(([status, value]) => ({
            name: STATUS_META[status]?.label || status,
            value,
            color: STATUS_META[status]?.color || '#adb5bd',
        }))
        : [];

    return (
        <>
            {/* ── Point selector (admin only) ── */}
            {!isWorker && (
                <div className="d-flex align-items-center gap-3 mb-4">
                    <span className="text-muted small fw-semibold">Pickup Point:</span>
                    <div className="btn-group flex-wrap" role="group">
                        {pickUpPoints.map(p => (
                            <button
                                key={p.pickupPointId}
                                className={`btn btn-sm ${selectedId === p.pickupPointId ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handleSelectPoint(p.pickupPointId)}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                    {loadingPickupPoint && (
                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                    )}
                </div>
            )}

            {/* Worker sees their point name as title */}
            {isWorker && d && (
                <div className="d-flex align-items-center gap-2 mb-4">
                    <span className="badge bg-primary fs-6">{d.pickupPointName}</span>
                    {loadingPickupPoint && (
                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                    )}
                </div>
            )}

            {error && (
                <div className="alert alert-danger mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {loadingPickupPoint && !d && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="mt-2 text-muted">Loading pickup point analytics...</p>
                </div>
            )}

            {d && (
                <>
                    {/* ── KPI row ── */}
                    <SectionTitle>Key Metrics — {d.pickupPointName}</SectionTitle>
                    <div className="row mb-4">
                        <KpiCard label="Total Orders"    value={d.totalOrders}             icon="📦" variant="primary" />
                        <KpiCard label="Total Revenue"   value={fmtZl(d.totalRevenue)}     icon="💰" variant="success" />
                        <KpiCard label="Total Refunds"   value={fmtZl(d.totalRefunds)}     icon="↩️" variant="danger" />
                        <KpiCard label="Avg Order Value" value={fmtZl(d.avgOrderValue)}    icon="🧾" variant="info" />
                    </div>
                    <div className="row mb-4">
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card border-start border-warning border-4 h-100">
                                <div className="card-body py-3">
                                    <div className="text-muted small text-uppercase fw-semibold mb-1"
                                         style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                                        Net Revenue
                                    </div>
                                    <div className="fw-bold" style={{ fontSize: '1.4rem' }}>
                                        {fmtZl(d.totalRevenue - d.totalRefunds)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card border-start border-info border-4 h-100">
                                <div className="card-body py-3">
                                    <div className="text-muted small text-uppercase fw-semibold mb-1"
                                         style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                                        Avg Delivery Time
                                    </div>
                                    <div className="fw-bold" style={{ fontSize: '1.4rem' }}>
                                        {d.avgDeliveryHours != null
                                            ? `${d.avgDeliveryHours.toFixed(1)}h`
                                            : '—'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="my-3" />

                    {/* ── Charts ── */}
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
                            <ChartCard title="Top 5 Books at this Point">
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

export default PickupPointView;