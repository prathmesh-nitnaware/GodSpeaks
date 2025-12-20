import React from 'react';
import { FaBoxOpen, FaPrint, FaTruck, FaCheckCircle } from 'react-icons/fa';
import './OrderStatusStepper.css'; // We will create this next

const OrderStatusStepper = ({ currentStatus }) => {
  const statuses = [
    { label: 'Pending', icon: <FaBoxOpen />, key: 'Pending' },
    { label: 'Processing', icon: <FaPrint />, key: 'Processing' },
    { label: 'Shipped', icon: <FaTruck />, key: 'Shipped' },
    { label: 'Delivered', icon: <FaCheckCircle />, key: 'Delivered' },
  ];

  // Logic to determine which index the current status falls into
  const currentIndex = statuses.findIndex(s => s.key === currentStatus);

  return (
    <div className="stepper-wrapper my-5">
      {statuses.map((step, index) => {
        let stepClass = "stepper-item";
        if (index < currentIndex) stepClass += " completed";
        if (index === currentIndex) stepClass += " active";

        return (
          <div key={step.key} className={stepClass}>
            <div className="step-counter">{step.icon}</div>
            <div className="step-name">{step.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatusStepper;