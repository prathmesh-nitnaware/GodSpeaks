import React from 'react';
import Sidebar from '../Admin/Sidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="d-flex bg-light min-vh-100">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
        <div className="container-fluid">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;