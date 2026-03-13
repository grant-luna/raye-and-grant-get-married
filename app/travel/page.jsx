"use client";

import Container from "react-bootstrap/Container";

export default function TravelPage() {
  const ink = "#544f44";
  const thinRule = "rgba(84, 79, 68, 0.28)";

  const heroStyle = {
    marginBottom: "clamp(26px, 4vw, 42px)",
    color: ink,
    fontSize: "clamp(62px, 10vw, 96px)",
    lineHeight: 1.02,
    textAlign: "center",
    width: "100%",
    transform: "translateX(4px)",
  };

  const sectionTitleStyle = {
    margin: 0,
    marginBottom: 18,
    color: ink,
    fontSize: "clamp(44px, 6.5vw, 54px)",
    lineHeight: 1.05,
    textAlign: "center",
    width: "100%",
    transform: "translateX(4px)",
  };

  const venueNameStyle = {
    fontSize: "clamp(16px, 4.2vw, 20px)",
    letterSpacing: "0.06em",
    opacity: 0.92,
    marginBottom: 0,
    color: ink,
    textTransform: "uppercase",
  };

  const subCopyStyle = {
    marginTop: 18,
    marginBottom: 2,
    opacity: 0.75,
    letterSpacing: "0.20em",
    lineHeight: 1.9,
    fontSize: "clamp(14px, 2.6vw, 16px)",
    textTransform: "uppercase",
    textAlign: "center",
  };

  const addressStyle = {
    fontFamily: "var(--font-body)",
    fontStyle: "italic",
    fontSize: "clamp(15px, 3vw, 18px)",
    opacity: 0.7,
    lineHeight: 1.3,
    textAlign: "center",
  };

  const bodyStyle = {
    fontFamily: "var(--font-body)",
    fontStyle: "italic",
    fontSize: "clamp(15px, 3vw, 18px)",
    opacity: 0.7,
    lineHeight: 1.3,
    textAlign: "center",
    maxWidth: 680,
    margin: "0 auto",
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
          maxWidth: 760,
          textAlign: "center",
        }}
      >
        <h1 className="font-header" style={heroStyle}>
          Travel
        </h1>

        {/* FLYING IN */}
        <section>
          <h2 className="font-header font-header--small" style={sectionTitleStyle}>
            Flying In
          </h2>

          <div style={addressStyle}>
            The closest airport is
          </div>

          <p
            className="font-subheader"
            style={{ ...subCopyStyle, marginTop: ".3rem" }}
          >
            San Diego International Airport (SAN)
          </p>

          <div style={addressStyle}>
            Conveniently located just a short drive from
            <br />
            downtown and our wedding venue
          </div>
        </section>

        <Divider />

        {/* HOTELS */}
        <section>
          <h2 className="font-header font-header--small" style={sectionTitleStyle}>
            Hotels
          </h2>

          <div style={addressStyle}>
            We have reserved room blocks at
          </div>

          <p
            className="font-subheader"
            style={{ ...subCopyStyle, marginTop: ".3rem" }}
          >
            Marriott Marquis San Diego Marina
          </p>

          <div style={addressStyle}>
            333 West Harbor Drive
            <br />
            San Diego, CA 92101
          </div>

          <div style={{ ...addressStyle, marginTop: 14 }}>
            Located approximately 10–15 minutes from our venue
          </div>
        </section>

        <Divider />

        {/* TO THE VENUE */}
        <section>
          <h2 className="font-header font-header--small" style={sectionTitleStyle}>
            To The Venue
          </h2>

          <div style={addressStyle}>
            Our ceremony will begin at 5:30 PM
            <br />
            We kindly ask guests to arrive between 5:00–5:15 PM
            <br />
            to allow time to walk to the venue and enjoy
            <br />
            the gardens before the ceremony
          </div>

          <p
            className="font-subheader"
            style={{ ...subCopyStyle, marginTop: "1.2rem" }}
          >
            Parking
          </p>

          <div style={bodyStyle}>
            There will be parking available at the Organ Pavilion Parking Lot,
            approximately a 5–10 minute walk from the venue entrance. There will
            be a small shuttle taking people from the lot to the venue entrance.
          </div>

          <p
            className="font-subheader"
            style={{ ...subCopyStyle, marginTop: "1.6rem" }}
          >
            Rideshare
          </p>

          <div style={bodyStyle}>
            Rideshares like Uber or Lyft can drop guests off directly at the
            venue entrance.
            <br />
            Please use the following address for rideshare drop-off:
            <br />
            2220 Paseo De Oro, San Diego, CA 92101
          </div>

          <p
            className="font-subheader"
            style={{ ...subCopyStyle, marginTop: "1.6rem" }}
          >
            Shuttle
          </p>

          <div style={bodyStyle}>
            We will be providing a shuttle service from the Marriott Marquis San
            Diego Marina to the venue, as well as return shuttles back to the
            hotel at the end of the evening. Shuttles will drop guests off near
            the venue entrance. Departure and pick-up times will be shared closer
            to the wedding date.
          </div>
        </section>
      </Container>
    </main>
  );
}