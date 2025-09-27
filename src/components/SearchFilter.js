import React, { useState } from 'react';
import { Form, InputGroup, Button, Dropdown, Badge } from 'react-bootstrap';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import './SearchFilter.css';

const SearchFilter = ({ 
  onSearch, 
  onFilter, 
  placeholder = "Rechercher...", 
  filters = [],
  showFilters = true,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...activeFilters };
    if (value === '' || value === null) {
      delete newFilters[filterKey];
    } else {
      newFilters[filterKey] = value;
    }
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilter = (filterKey) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterKey];
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFilter({});
  };

  const getActiveFiltersCount = () => {
    return Object.keys(activeFilters).length;
  };

  return (
    <div className={`search-filter-container ${className}`}>
      <Form onSubmit={handleSearch} className="search-form">
        <InputGroup className="search-input-group">
          <InputGroup.Text className="search-icon">
            <FiSearch size={18} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Button 
            type="submit" 
            variant="primary" 
            className="search-btn"
          >
            Rechercher
          </Button>
        </InputGroup>
      </Form>

      {showFilters && filters.length > 0 && (
        <div className="filter-section">
          <Dropdown 
            show={showFilterDropdown} 
            onToggle={setShowFilterDropdown}
            className="filter-dropdown"
          >
            <Dropdown.Toggle 
              variant="outline-secondary" 
              className="filter-toggle"
            >
              <FiFilter size={16} className="me-2" />
              Filtres
              {getActiveFiltersCount() > 0 && (
                <Badge bg="primary" className="ms-2">
                  {getActiveFiltersCount()}
                </Badge>
              )}
              <FiChevronDown size={14} className="ms-2" />
            </Dropdown.Toggle>

            <Dropdown.Menu className="filter-menu">
              <div className="filter-header">
                <h6 className="filter-title">Filtres</h6>
                {getActiveFiltersCount() > 0 && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="clear-all-btn"
                  >
                    Tout effacer
                  </Button>
                )}
              </div>

              {filters.map((filter, index) => (
                <div key={index} className="filter-item">
                  <label className="filter-label">{filter.label}</label>
                  {filter.type === 'select' ? (
                    <Form.Select
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Tous</option>
                      {filter.options.map((option, optIndex) => (
                        <option key={optIndex} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  ) : filter.type === 'date' ? (
                    <Form.Control
                      type="date"
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="filter-date"
                    />
                  ) : filter.type === 'range' ? (
                    <div className="filter-range">
                      <Form.Control
                        type="number"
                        placeholder="Min"
                        value={activeFilters[`${filter.key}_min`] || ''}
                        onChange={(e) => handleFilterChange(`${filter.key}_min`, e.target.value)}
                        className="filter-range-input"
                      />
                      <span className="range-separator">-</span>
                      <Form.Control
                        type="number"
                        placeholder="Max"
                        value={activeFilters[`${filter.key}_max`] || ''}
                        onChange={(e) => handleFilterChange(`${filter.key}_max`, e.target.value)}
                        className="filter-range-input"
                      />
                    </div>
                  ) : (
                    <Form.Control
                      type="text"
                      placeholder={filter.placeholder || `Filtrer par ${filter.label}`}
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="filter-input"
                    />
                  )}
                </div>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {/* Affichage des filtres actifs */}
          {getActiveFiltersCount() > 0 && (
            <div className="active-filters">
              {Object.entries(activeFilters).map(([key, value]) => {
                const filter = filters.find(f => f.key === key || f.key === key.replace(/_min$|_max$/, ''));
                if (!filter) return null;
                
                return (
                  <Badge 
                    key={key} 
                    bg="secondary" 
                    className="active-filter-badge"
                  >
                    {filter.label}: {value}
                    <Button
                      variant="link"
                      size="sm"
                      className="filter-remove-btn"
                      onClick={() => clearFilter(key)}
                    >
                      <FiX size={12} />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
