import React from 'react';

// ─── FORMATTERS ────────────────────────────────────────────────────────────

export const fmtZl = (n) =>
    n >= 1000 ? `${(n / 1000).toFixed(2)}k zł` : `${n.toFixed(2)} zł`;

// ─── CHANGE BADGE ──────────────────────────────────────────────────────────

export const ChangeBadge = ({ val }) => {
    if (val === undefined || val === null) return null;
    const positive = val >= 0;
    return (
        <span
            className={`badge ${positive ? 'bg-success' : 'bg-danger'} ms-2`}
            style={{ fontSize: '0.7rem' }}
        >
            {positive ? '▲' : '▼'} {Math.abs(val)}%
        </span>
    );
};

// ─── CUSTOM CHART TOOLTIP ──────────────────────────────────────────────────

export const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="card shadow-sm" style={{ fontSize: 12, padding: '6px 12px', minWidth: 120 }}>
            <div className="text-muted mb-1" style={{ fontSize: 11 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, fontWeight: 600 }}>
                    {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
                </div>
            ))}
        </div>
    );
};

// ─── KPI CARD ──────────────────────────────────────────────────────────────

export const KpiCard = ({ label, value, change, icon, variant = 'primary' }) => (
    <div className="col-md-3 col-sm-6 mb-3">
        <div className={`card border-start border-${variant} border-4 h-100`}>
            <div className="card-body py-3">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <div
                            className="text-muted small text-uppercase fw-semibold mb-1"
                            style={{ letterSpacing: '0.05em', fontSize: '0.7rem' }}
                        >
                            {label}
                        </div>
                        <div className="fw-bold" style={{ fontSize: '1.4rem' }}>
                            {value}
                            <ChangeBadge val={change} />
                        </div>
                    </div>
                    {icon && (
                        <span className={`text-${variant} opacity-25`} style={{ fontSize: '2rem' }}>
                            {icon}
                        </span>
                    )}
                </div>
            </div>
        </div>
    </div>
);

// ─── SECTION TITLE ─────────────────────────────────────────────────────────

export const SectionTitle = ({ children }) => (
    <h6
        className="text-uppercase text-muted fw-semibold mb-3 mt-1"
        style={{ letterSpacing: '0.08em', fontSize: '0.72rem' }}
    >
        {children}
    </h6>
);

// ─── CHART CARD ────────────────────────────────────────────────────────────

export const ChartCard = ({ title, children }) => (
    <div className="card h-100">
        <div className="card-header bg-white py-2">
            <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>{title}</span>
        </div>
        <div className="card-body pt-2 pb-3">
            {children}
        </div>
    </div>
);