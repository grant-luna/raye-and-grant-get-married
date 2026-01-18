"use client";

import Container from "react-bootstrap/Container";
import Image from "next/image";

// If your image is in /public, this path works:
import watercolorGarden from "../../public/watercolor-garden.png";

export default function SchedulePage() {
  const ink = "#544f44";

  return (
    <main
      style={{
        minHeight: "100svh",
        backgroundColor: "#fbfaf7",
        display: "flex",
        alignItems: "flex-start",
      }}
    >
      <Container
        style={{
          paddingTop: 110,
          paddingBottom: 90,
          textAlign: "center",
          maxWidth: 760,
        }}
      >
        {/* HERO */}
        <h1 className="font-header" style={{ marginBottom: 42, color: ink, fontSize: "clamp(86px, 9vw, 96px)", lineHeight: 1.02, }}>
          Schedule
        </h1>

        {/* SECTION 1 */}
        <section style={{ marginBottom: 76 }}>
          <h2
            className="font-header font-header--small"
            style={{
              margin: 0,
              color: ink,
              fontSize: "clamp(38px, 7vw, 54px)",
            }}
          >
            The Welcome - Aug 21st 2026
          </h2>

          <p
            className="font-subheader"
            style={{
              marginTop: 26,
              marginBottom: 18,
              opacity: 0.75,
              letterSpacing: "0.20em",
              lineHeight: 1.9,
              fontSize: 16,
            }}
          >
            Welcome to San Diego! Join us
            <br />
            for drinks and appetizers at
          </p>

          <div
            className="font-subheader"
            style={{
              fontSize: 28,
              letterSpacing: "0.06em",
              opacity: 0.92,
              marginBottom: 14,
              color: ink,
            }}
          >
            Carte Hotel
          </div>

          <div
            style={{
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              fontSize: 18,
              opacity: 0.7,
              lineHeight: 1.9,
            }}
          >
            2215 Pan American Road. E.
            <br />
            San Diego, CA 92101
          </div>
        </section>

        {/* SECTION 2 */}
        <section style={{ marginBottom: 40 }}>
          <h2
            className="font-header font-header--small"
            style={{
              margin: 0,
              color: ink,
              fontSize: "clamp(38px, 7vw, 54px)",
            }}
          >
            The Day of - Aug 22nd 2026
          </h2>

          <p
            className="font-subheader"
            style={{
              marginTop: 26,
              marginBottom: 18,
              opacity: 0.75,
              letterSpacing: "0.20em",
              lineHeight: 1.9,
              fontSize: 16,
            }}
          >
            The Ceremony, Cocktail Hour, and
            <br />
            Reception will be held at
          </p>

          <div
            className="font-subheader"
            style={{
              fontSize: 28,
              letterSpacing: "0.06em",
              opacity: 0.92,
              marginBottom: 14,
              color: ink,
            }}
          >
            The Japanese Friendship Gardens
          </div>

          <div
            style={{
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              fontSize: 18,
              opacity: 0.7,
              lineHeight: 1.9,
            }}
          >
            2215 Pan American Road. E.
            <br />
            San Diego, CA 92101
          </div>
        </section>

        {/* WATERCOLOR IMAGE */}
        <div
          style={{
            width: "min(560px, 92vw)",
            margin: "10px auto 72px",
            opacity: 0.95,
          }}
        >
          <Image
            src={watercolorGarden}
            alt="Watercolor garden"
            priority
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>

        {/* SECTION 3 (BOTTOM) */}
        <section>
          <h2
            className="font-header font-header--small"
            style={{
              margin: 0,
              color: ink,
              fontSize: "clamp(38px, 7vw, 54px)",
            }}
          >
            The Goodbye - Aug 23rd 2026
          </h2>

          <div
            className="font-subheader"
            style={{
              marginTop: 10,
              letterSpacing: "0.22em",
              opacity: 0.7,
              fontSize: 16,
            }}
          >
            Thanks
          </div>
        </section>
      </Container>
    </main>
  );
}
