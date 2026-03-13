"use client";

import Container from "react-bootstrap/Container";
import Image from "next/image";
import watercolorGarden from "../../public/watercolor-garden.png";

export default function SchedulePage() {
  const ink = "#544f44";
  const thinRule = "rgba(84, 79, 68, 0.28)";

  const sectionTitleStyle = {
    margin: 0,
    marginBottom: 18, // increased space below title
    color: ink,
    fontSize: "clamp(44px, 6.5vw, 54px)",
    lineHeight: 1.05,
  };

  const venueNameStyle = {
    fontSize: "clamp(16px, 4.2vw, 20px)",
    letterSpacing: "0.06em",
    opacity: 0.92,
    marginBottom: 10,
    color: ink,
  };

  const subCopyStyle = {
    marginTop: 18,
    marginBottom: 2,
    opacity: 0.75,
    letterSpacing: "0.20em",
    lineHeight: 1.9,
    fontSize: "clamp(14px, 2.6vw, 16px)",
  };

  const addressStyle = {
    fontFamily: "var(--font-body)",
    fontStyle: "italic",
    fontSize: "clamp(15px, 3vw, 18px)",
    opacity: 0.7,
    lineHeight: 1.1,
  };

  const Divider = () => (
    <div
      aria-hidden
      style={{
        width: "min(200px, 30vw)",
        height: 0.75,
        background: thinRule,
        margin: "clamp(34px, 6vw, 54px) auto",
      }}
    />
  );

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
          paddingTop: "clamp(25px, 10vw, 60px)",
          paddingBottom: "clamp(60px, 10vw, 90px)",
          textAlign: "center",
          maxWidth: 760,
        }}
      >
        {/* HERO */}
        <h1
          className="font-header"
          style={{
            marginBottom: "clamp(26px, 4vw, 42px)",
            color: ink,
            fontSize: "clamp(62px, 10vw, 96px)",
            lineHeight: 1.02,
          }}
        >
          Schedule
        </h1>

        {/* SECTION 1 */}
        <section>
          <div className="font-subheader" style={venueNameStyle}>
            Aug 21st, 2026
          </div>

          <h2 className="font-header font-header--small" style={sectionTitleStyle}>
            The Welcome
          </h2>

          <div style={addressStyle}>
            Please check back in closer to the wedding weekend
            <br />
            for details about our welcome celebration!
          </div>

          {/*
            ORIGINAL WELCOME DETAILS — SAVED FOR LATER

            <div style={addressStyle}>
              Welcome to San Diego! Join us
              <br />
              for drinks and appetizers at
            </div>

            <p className="font-subheader" style={{ ...subCopyStyle, marginTop: ".3rem" }}>
              Carte Hotel
            </p>

            <div style={addressStyle}>
              2215 Pan American Road. E.
              <br />
              San Diego, CA 92101
            </div>
          */}
        </section>

        <Divider />

        {/* SECTION 2 */}
        <section>
          <div className="font-subheader" style={venueNameStyle}>
            Aug 22nd, 2026
          </div>

          <h2 className="font-header font-header--small" style={sectionTitleStyle}>
            The Day Of
          </h2>

          <div style={addressStyle}>
            The Ceremony, Cocktail Hour, and
            <br />
            Reception will be held at
          </div>

          <p className="font-subheader" style={{ ...subCopyStyle, marginTop: ".3rem" }}>
            The Japanese Friendship Gardens
          </p>

          <div style={addressStyle}>
            2215 Pan American Road. E.
            <br />
            San Diego, CA 92101
          </div>
        </section>

        {/* WATERCOLOR IMAGE */}
        <div
          style={{
            width: "min(560px, 92vw)",
            margin: "clamp(26px, 5vw, 32px) auto clamp(26px, 5vw, 34px)",
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

        <Divider />

        {/* SECTION 3 */}
        <section>
          <div className="font-subheader" style={venueNameStyle}>
            Aug 23rd, 2026
          </div>

          <h2 className="font-header font-header--small" style={sectionTitleStyle}>
            The Goodbye
          </h2>

          <div style={addressStyle}>
            Please check back in closer to the wedding weekend
            <br />
            for details about our farewell celebration!
          </div>
        </section>
      </Container>
    </main>
  );
}