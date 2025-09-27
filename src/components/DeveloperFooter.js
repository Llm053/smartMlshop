import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FiCode, FiMail, FiPhone, FiGlobe, FiHeart } from 'react-icons/fi';
import './DeveloperFooter.css';

const DeveloperFooter = () => {
  return (
    <footer className="developer-footer">
      <Container>
        <Row className="align-items-center">
          <Col md={6}>
            <div className="developer-info">
              <div className="developer-logo">
                <img 
                  src="/assets/smart-ml-logo.png" 
                  alt="Smart ML" 
                  className="logo-icon"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'inline';
                  }}
                />
                <FiCode className="logo-icon" style={{display: 'none'}} />
                <span className="logo-text">SMART ML</span>
              </div>
              <p className="developer-description">
                Solutions technologiques innovantes pour le Mali
              </p>
            </div>
          </Col>
          <Col md={6}>
            <div className="developer-contact">
              <div className="contact-item">
                <FiMail className="contact-icon" />
                <span>contact@smartml.dev</span>
              </div>
              <div className="contact-item">
                <FiPhone className="contact-icon" />
                <span>+223 XX XX XX XX</span>
              </div>
              <div className="contact-item">
                <FiGlobe className="contact-icon" />
                <span>www.smartml.dev</span>
              </div>
            </div>
          </Col>
        </Row>
        <hr className="footer-divider" />
        <Row>
          <Col className="text-center">
            <p className="copyright">
              © {new Date().getFullYear()} Développé avec <FiHeart className="heart-icon" /> par{' '}
              <strong>Smart ML</strong> - Tous droits réservés
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default DeveloperFooter;
