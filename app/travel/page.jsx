"use client";

import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Link from "next/link";
import Image from "next/image";

export default function TravelPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const ink = "#6a6258";
  const softInk = "rgba(106, 98, 88, 0.78)";
  const headingInk = "#5e564d";
  const accent = "#8f0f4f";

  const mainStyle = {
    minHeight: "100svh",
    position: "relative",
    overflow: "hidden",
  };

  const heroTitleStyle = {
    margin: 0,
    color: headingInk,
    fontSize: isMobile ? "56px" : "76px",
    lineHeight: isMobile ? 1.02 : 1,
    fontWeight: 400,
    textAlign: "center",
  };

  const sectionScriptTitle = {
    margin: 0,
    color: headingInk,
    textAlign: "center",
    fontSize: isMobile ? "38px" : "48px",
    lineHeight: 1.08,
    fontWeight: 400,
  };

  const scriptSubTitle = {
    margin: 0,
    color: headingInk,
    textAlign: "center",
    fontSize: isMobile ? "31px" : "38px",
    lineHeight: 1.1,
    fontWeight: 400,
  };

  const serifLabel = {
    margin: 0,
    fontSize: isMobile ? "17px" : "17px",
    lineHeight: isMobile ? 1.65 : 1.75,
    color: softInk,
    fontFamily: "var(--font-body)",
    fontStyle: "italic",
    textAlign: "center",
    letterSpacing: isMobile ? "0.01em" : "0.02em",
  };

  const smallCaps = {
    margin: 0,
    marginTop: "0.3rem",
    color: headingInk,
    fontSize: isMobile ? "18px" : "28px",
    letterSpacing: isMobile ? "0.03em" : "0.08em",
    lineHeight: isMobile ? 1.3 : 1.2,
    textTransform: "uppercase",
    textAlign: "center",
    wordBreak: "break-word",
  };

  const bodyCopy = {
    margin: 0,
    fontSize: isMobile ? "18px" : "17px",
    lineHeight: isMobile ? 1.75 : 1.9,
    color: softInk,
    fontFamily: "var(--font-body)",
    fontStyle: "italic",
    letterSpacing: isMobile ? "0.01em" : "0.02em",
  };

  const addressStyle = {
    ...bodyCopy,
    fontStyle: "normal",
    textTransform: "uppercase",
    letterSpacing: isMobile ? "0.02em" : "0.04em",
    fontSize: isMobile ? "12px" : "14px",
    lineHeight: 1.65,
  };

  const buttonStyle = {
    display: "inline-block",
    marginTop: isMobile ? 20 : 22,
    padding: isMobile ? "12px 18px" : "12px 22px",
    borderRadius: 999,
    textDecoration: "none",
    background: accent,
    color: "#fff8fb",
    textTransform: "uppercase",
    letterSpacing: isMobile ? "0.03em" : "0.05em",
    fontSize: isMobile ? "11px" : "13px",
    fontWeight: 600,
    boxShadow: "0 8px 24px rgba(143, 15, 79, 0.18)",
    lineHeight: 1.3,
    textAlign: "center",
  };

  const venueInfoTitle = {
    ...smallCaps,
    fontSize: isMobile ? "15px" : "21px",
    marginTop: isMobile ? "1.2rem" : "1.4rem",
    marginBottom: "0.55rem",
  };

  return (
    <main style={mainStyle}>
      <Container
        style={{
          maxWidth: isMobile ? 540 : 1020,
          paddingTop: isMobile ? "28px" : "56px",
          paddingBottom: isMobile ? "56px" : "84px",
          paddingLeft: isMobile ? "22px" : undefined,
          paddingRight: isMobile ? "22px" : undefined,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: isMobile ? "100px" : "142px",
            right: isMobile ? "8px" : "32px",
            width: isMobile ? "132px" : "250px",
            opacity: 0.82,
            pointerEvents: "none",
          }}
        >
          <Image
            src="/airplane.png"
            alt="Watercolor airplane"
            width={420}
            height={220}
            style={{ width: "100%", height: "auto" }}
            priority
          />
        </div>

        <section
          style={{
            textAlign: "center",
            marginBottom: isMobile ? "42px" : "64px",
          }}
        >
          <h1 className="font-header" style={heroTitleStyle}>
            Travel
          </h1>
        </section>

        <section
          style={{
            textAlign: "center",
            maxWidth: isMobile ? 360 : 760,
            margin: "0 auto",
            marginBottom: isMobile ? "54px" : "88px",
          }}
        >
          <h2 className="font-header font-header--small" style={scriptSubTitle}>
            Flying in
          </h2>

          <p style={{ ...serifLabel, marginTop: "0.9rem" }}>
            The best airport to fly into is
          </p>

          <p
            className="font-subheader"
            style={{
              ...smallCaps,
              marginTop: "0.35rem",
              fontSize: isMobile ? "17px" : "34px",
            }}
          >
            San Diego International Airport (SAN)
          </p>

          <p
            style={{
              ...serifLabel,
              maxWidth: isMobile ? 330 : 680,
              margin: "0.45rem auto 0",
            }}
          >
            conveniently located just a short drive from downtown and our wedding venue.
          </p>
        </section>

        <section
          style={{
            marginBottom: isMobile ? "58px" : "100px",
          }}
        >
          <h2
            className="font-header font-header--small"
            style={{ ...sectionScriptTitle, marginBottom: "0.8rem" }}
          >
            Hotels
          </h2>

          <p
            style={{
              ...serifLabel,
              maxWidth: isMobile ? 350 : 760,
              margin: "0 auto 2rem",
            }}
          >
            We have reserved room blocks at the <strong>Marriott Marquis San Diego Marina</strong>,
            located approximately 10–15 minutes from our venue.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "minmax(220px, 0.95fr) minmax(260px, 1fr)",
              gap: isMobile ? "18px" : "42px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                order: isMobile ? 1 : 0,
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: isMobile ? 340 : 470,
                  opacity: 0.88,
                }}
              >
                <Image
                  src="/hotel.png"
                  alt="Marriott Marquis San Diego Marina illustration"
                  width={900}
                  height={600}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                textAlign: isMobile ? "center" : "left",
                maxWidth: isMobile ? 340 : 470,
                margin: "0 auto",
                order: isMobile ? 2 : 0,
              }}
            >
              <h3
                className="font-subheader"
                style={{
                  margin: 0,
                  color: headingInk,
                  fontSize: isMobile ? "24px" : "34px",
                  lineHeight: 1.18,
                  letterSpacing: isMobile ? "0.02em" : "0.04em",
                  textTransform: "uppercase",
                  wordBreak: "break-word",
                }}
              >
                Marriott Marquis
                <br />
                San Diego Marina
              </h3>

              <p style={{ ...addressStyle, marginTop: "0.8rem" }}>
                333 West Harbor Drive, San Diego, CA 92101
              </p>

              <p
                style={{
                  ...bodyCopy,
                  marginTop: "0.95rem",
                  maxWidth: isMobile ? 320 : 430,
                  marginLeft: isMobile ? "auto" : 0,
                  marginRight: isMobile ? "auto" : 0,
                  textAlign: isMobile ? "center" : "left",
                }}
              >
                A beautiful waterfront hotel in downtown San Diego with marina views and
                great on-site amenities. We’ll also be hosting our Welcome Party here,
                making it a fun and convenient home base for the weekend.
              </p>

              <Link
                href="https://book.passkey.com/go/rayandgrantwedding"
                target="_blank"
                rel="noopener noreferrer"
                style={buttonStyle}
              >
                Click Here to Reserve a Room in Our Block
              </Link>
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: isMobile ? 360 : 780,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2 className="font-header font-header--small" style={sectionScriptTitle}>
            To The Venue
          </h2>

          <p
            style={{
              ...serifLabel,
              maxWidth: isMobile ? 335 : 700,
              margin: "0.95rem auto 0",
            }}
          >
            Our ceremony will begin at 5:30 PM. We kindly ask guests to arrive between
            5:00–5:15 PM to allow time to walk to the venue and enjoy the gardens before
            the ceremony.
          </p>

          <div style={{ marginTop: isMobile ? "1.5rem" : "1.8rem" }}>
            <h3 className="font-subheader" style={venueInfoTitle}>
              Parking
            </h3>
            <p
              style={{
                ...bodyCopy,
                textAlign: "center",
                maxWidth: isMobile ? 320 : 620,
                margin: "0 auto",
              }}
            >
              There will be parking available at the Organ Pavilion Parking Lot,
              approximately a 5–10 minute walk from the venue entrance.
            </p>

            <h3 className="font-subheader" style={venueInfoTitle}>
              Rideshare
            </h3>
            <p
              style={{
                ...bodyCopy,
                textAlign: "center",
                maxWidth: isMobile ? 320 : 620,
                margin: "0 auto",
              }}
            >
              Rideshares like Uber or Lyft can drop guests off directly at the venue entrance.
              <br />
              2220 Paseo De Oro, San Diego, CA 92101
            </p>

            <h3 className="font-subheader" style={venueInfoTitle}>
              Shuttle
            </h3>
            <p
              style={{
                ...bodyCopy,
                textAlign: "center",
                maxWidth: isMobile ? 330 : 660,
                margin: "0 auto",
              }}
            >
              We will be providing shuttle service from the Marriott Marquis San Diego Marina
              to the venue, along with return shuttles back to the hotel at the end of the evening.
            </p>
          </div>
        </section>
      </Container>
    </main>
  );
}
