"use client";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Link from "next/link";

export default function SiteNavbar() {
  return (
    <Navbar
      expand="md"
      style={{
        background: "transparent",
        border: "none",
        paddingTop: 18,
        paddingBottom: 18,
      }}
    >
      <Container>
        {/* Mobile hamburger */}
        <Navbar.Toggle
          aria-controls="wedding-navbar"
          style={{
            border: "none",
            boxShadow: "none",
            padding: 6,
          }}
        />

        <Navbar.Collapse id="wedding-navbar">
          <Nav
            className="mx-auto"   // ✅ CENTERED
            style={{
              columnGap: 150,   // ✅ horizontal spacing only
              rowGap: 0,       // ✅ no vertical spacing
              alignItems: "center",
            }}
          >
            <Nav.Link as={Link} href="/rsvp" style={linkStyle}>
              RSVP
            </Nav.Link>
            <Nav.Link as={Link} href="/travel" style={linkStyle}>
              Traveling
            </Nav.Link>
            <Nav.Link as={Link} href="/schedule" style={linkStyle}>
              Schedule
            </Nav.Link>
            <Nav.Link as={Link} href="/faqs" style={linkStyle}>
              FAQs
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

const linkStyle = {
  fontFamily: "var(--font-subheader)",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontSize: 13,
  color: "#544f44",
  textDecoration: "none",
};
