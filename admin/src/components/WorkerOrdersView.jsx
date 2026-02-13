import React from 'react';

const WorkerOrdersView = ({ pickUpPoint }) => {
    return (
        <div className="worker-orders-container">
            <div className="alert alert-primary">
                <h5>Orders panel</h5>
                <p>Pickup Point: <strong>{pickUpPoint?.address || 'Not known'}</strong></p>
            </div>
            <div className="text-center p-5 border rounded bg-white">
                <p className="text-muted">Developing...</p>
            </div>
        </div>
    );
};

export default WorkerOrdersView;