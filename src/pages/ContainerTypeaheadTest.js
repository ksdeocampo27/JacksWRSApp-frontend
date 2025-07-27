import React, { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

const ContainerTypeaheadTest = () => {
  // Simulated fetched containers from database
  const [containers, setContainers] = useState([
    { _id: '1', id: 'S001', name: 'Slim 001' },
    { _id: '2', id: 'S002', name: 'Slim 002' },
    { _id: '3', id: 'R001', name: 'Round 001' },
  ]);

  // Simulated currentSale (editing existing sale)
  const [currentSale, setCurrentSale] = useState({
    containerIds: ['1', '3'], // saved container _ids from sale record
  });

  useEffect(() => {
    console.log('Current containerIds:', currentSale.containerIds);
  }, [currentSale]);

  return (
    <div style={{ padding: '20px' }}>
      <h3>Container Typeahead Edit Modal Test</h3>

      <Typeahead
        id="container-typeahead"
        labelKey={(option) => `${option.id} - ${option.name}`}
        options={containers}
        placeholder="Select containers..."
        multiple
        selected={containers.filter(c =>
          currentSale.containerIds.includes(c._id)
        )}
        onChange={(selected) => {
          console.log('Selected:', selected);
          setCurrentSale({
            ...currentSale,
            containerIds: selected.map(s => s._id)
          });
        }}
      />

      <p>
        <strong>Selected containerIds:</strong> {currentSale.containerIds.join(', ')}
      </p>
    </div>
  );
};

export default ContainerTypeaheadTest;
