"use client";

import { useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Link from "next/link";

export default function SiteNavbar() {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => setExpanded((prev) => !prev);

  const handleNavClick = () => {
    // Collapse after click (especially for mobile)
    setExpanded(false);
  };

  return (
    <Navbar
      expand="md"
      expanded={expanded}
      onToggle={handleToggle}
      style={{
        background: "transparent",
        border: "none",
        paddingTop: 18,
        paddingBottom: 18,
      }}
    >
      <Container>
        <Navbar.Toggle
          aria-controls="wedding-navbar"
          style={{
            border: "none",
            boxShadow: "none",
            padding: 6,
          }}
        />

        <Navbar.Collapse
          id="wedding-navbar"
          style={{
            // ✅ Divider line only when open (mobile)
            borderBottom: expanded ? ".75px solid rgba(84, 79, 68, 0.28)" : "none",
            paddingBottom: expanded ? 18 : 0,            
          }}
        >
          <Nav className="mx-auto wedding-nav">
            <Nav.Link as={Link} href="/" className="wedding-link" onClick={handleNavClick}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} href="/rsvp" className="wedding-link" onClick={handleNavClick}>
              RSVP
            </Nav.Link>
            <Nav.Link as={Link} href="/travel" className="wedding-link" onClick={handleNavClick}>
              Travel
            </Nav.Link>
            <Nav.Link as={Link} href="/schedule" className="wedding-link" onClick={handleNavClick}>
              Schedule
            </Nav.Link>
            <Nav.Link as={Link} href="/faqs" className="wedding-link" onClick={handleNavClick}>
              FAQs
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}