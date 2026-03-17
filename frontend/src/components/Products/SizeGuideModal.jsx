import React, { useState } from 'react';
import { Modal, Nav, Tab, Table, Form, Button, Alert } from 'react-bootstrap';

const SizeGuideModal = ({ show, onHide }) => {
  const [activeTab, setActiveTab] = useState('chart');

  // --- FIT FINDER STATE ---
  const [height, setHeight] = useState(''); // in cm
  const [weight, setWeight] = useState(''); // in kg
  const [recommendedSize, setRecommendedSize] = useState(null);

  // Simple Logic for T-Shirt Sizing (can be adjusted)
  const calculateSize = () => {
    const h = parseInt(height);
    const w = parseInt(weight);

    if (!h || !w) return;

    let size = '';
    // This is a basic estimation logic
    if (w < 55) size = 'S';
    else if (w < 70) size = 'M';
    else if (w < 85) size = 'L';
    else if (w < 100) size = 'XL';
    else if (w < 115) size = 'XXL';
    else size = '3XL';

    // Adjust for height outliers
    if (h > 185 && (size === 'S' || size === 'M')) size = 'L';
    if (h > 195 && (size === 'L')) size = 'XL';

    setRecommendedSize(size);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Size Guide & Fit Finder</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="chart" className="text-dark fw-semibold">Size Chart</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="finder" className="text-dark fw-semibold">Find My Size</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* --- TAB 1: STATIC CHART --- */}
            <Tab.Pane eventKey="chart">
              <p className="text-muted small">Measurements are in inches. Product may vary by +/- 0.5 inches.</p>
              <Table striped bordered hover responsive className="text-center align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Size</th>
                    <th>Chest (in)</th>
                    <th>Length (in)</th>
                    <th>Shoulder (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong>S</strong></td><td>38</td><td>27</td><td>17</td></tr>
                  <tr><td><strong>M</strong></td><td>40</td><td>28</td><td>18</td></tr>
                  <tr><td><strong>L</strong></td><td>42</td><td>29</td><td>19</td></tr>
                  <tr><td><strong>XL</strong></td><td>44</td><td>30</td><td>20</td></tr>
                  <tr><td><strong>XXL</strong></td><td>46</td><td>31</td><td>21</td></tr>
                  <tr><td><strong>3XL</strong></td><td>48</td><td>32</td><td>22</td></tr>
                </tbody>
              </Table>
              <div className="text-center mt-3">
                <img 
                  src="https://via.placeholder.com/400x200?text=T-Shirt+Measurement+Guide" 
                  alt="How to measure" 
                  className="img-fluid rounded border" 
                />
              </div>
            </Tab.Pane>

            {/* --- TAB 2: FIT FINDER --- */}
            <Tab.Pane eventKey="finder">
              <div className="p-3">
                <h5 className="mb-3">Don't know your size? Let us help!</h5>
                <Form>
                  <div className="d-flex gap-3">
                    <Form.Group className="flex-grow-1">
                      <Form.Label>Height (cm)</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="e.g., 175" 
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="flex-grow-1">
                      <Form.Label>Weight (kg)</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="e.g., 70" 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </Form.Group>
                  </div>

                  <Button variant="dark" className="w-100 mt-4" onClick={calculateSize}>
                    Calculate Best Fit
                  </Button>
                </Form>

                {recommendedSize && (
                  <Alert variant="success" className="mt-4 text-center">
                    <h6 className="mb-1">We recommend:</h6>
                    <span className="display-4 fw-bold">{recommendedSize}</span>
                    <p className="mb-0 small mt-2">Based on a regular fit preference.</p>
                  </Alert>
                )}
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
    </Modal>
  );
};

export default SizeGuideModal;