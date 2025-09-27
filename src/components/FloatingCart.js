import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import { FiShoppingCart } from 'react-icons/fi';
import './FloatingCart.css';

const FloatingCart = ({ cartItems = [], onClick, total = 0 }) => {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="floating-cart">
      <Button
        variant="primary"
        className="cart-button"
        onClick={onClick}
        size="lg"
      >
        <div className="cart-content">
          <div className="cart-icon-wrapper">
            <FiShoppingCart size={24} />
            <Badge 
              bg="danger" 
              className="cart-badge"
              pill
            >
              {totalItems}
            </Badge>
          </div>
          <div className="cart-info d-none d-md-block">
            <div className="cart-items-count">
              {totalItems} article{totalItems > 1 ? 's' : ''}
            </div>
            <div className="cart-total">
              {total.toLocaleString('fr-FR')} FCFA
            </div>
          </div>
        </div>
      </Button>
    </div>
  );
};

export default FloatingCart;
