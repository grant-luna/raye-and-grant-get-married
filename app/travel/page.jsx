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
    transform: "translateX(4px)", // ✅ optical centering for script font
  };

  const sectionTitleStyle = {
    margin: 0,
    color: ink,
    fontSize: "clamp(44px, 6.5vw, 54px)",
    lineHeight: 1.05,
    textAlign: "center",
    width: "100%",
    transform: "translateX(4px)", // ✅ optical centering for script font
  };

  // Matches your “venue” look (Cormorant SC via font-subheader)
  const venueNameStyle = {
    fontSize: "clamp(16px, 4.2vw, 20px)",
    letterSpacing: "0.06em",
    opacity: 0.92,
    marginBottom: 0.5,
    color: ink,
    textTransform: "uppercase",
  };

  const bodyStyle = {
    fontFamily: "var(--font-body)",
    fontSize: "clamp(16px, 3.4vw, 18px)",
    fontStyle: "italic",
    lineHeight: 1.5,
    opacity: 0.75,
    maxWidth: 640,
    margin: "0 auto",
    textAlign: "center",
  };

  const subCopyStyle = {
    marginTop: 16,
    marginBottom: 0,
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

  const miniLabelStyle = {
    marginTop: 0,
    marginBottom: 10,
    fontSize: "clamp(14px, 3vw, 16px)",
    letterSpacing: "0.20em",
    opacity: 0.8,
    textTransform: "uppercase",
    textAlign: "center",
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

  const HotelBlock = ({ name, addressLine1, addressLine2, description }) => (
    <div style={{ marginTop: 22 }}>
      <div className="font-subheader" style={venueNameStyle}>
        {name}
      </div>

      <div style={{ ...addressStyle, marginTop: 6 }}>
        {addressLine1}
        <br />
        {addressLine2}
      </div>

      <p style={{ ...bodyStyle, marginTop: 14 }}>{description}</p>
    </div>
  );

  const VenueDetail = ({ label, text }) => (
    <div style={{ marginTop: 26 }}>
      <div className="font-subheader" style={miniLabelStyle}>
        {label}
      </div>
      <p style={bodyStyle}>{text}</p>
    </div>
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
        {/* HERO */}
        <h1 className="font-header" style={heroStyle}>
          Travel
        </h1>

        {/* FLYING-IN */}
        <section>
          <h2 className="font-header font-header--small" style={sectionTitleStyle}>
            Flying-in
          </h2>

          <p className="font-subheader" style={subCopyStyle}>
            The closest airport is
          </p>

          <div
            className="font-subheader"
            style={{
              ...venueNameStyle,
              fontSize: "clamp(16px, 4.6vw, 22px)",
              marginTop: 14,
              marginBottom: 10,
            }}
          >
            San Diego International Airport (SAN)
          </div>

          <p style={bodyStyle}>
            Conveniently located just a short drive from downtown and our wedding venue.
          </p>
        </section>

        <Divider />

        {/* HOTELS */}
        <section>
          <h2 className="font-header font-header--small" style={sectionTitleStyle}>
            Hotels
          </h2>

          <p className="font-subheader" style={subCopyStyle}>
            We have reserved room blocks at the following hotels, both
            <br />
            located approximately 10–15 minutes from our venue
          </p>

          <HotelBlock
            name="Marriott Marquis San Diego Marina"
            addressLine1="333 West Harbor Drive"
            addressLine2="San Diego, CA 92101"
            description="A beautiful waterfront hotel in downtown San Diego with marina views and great on-site amenities. We’ll also be hosting our Welcome Party here, making it a fun and convenient home base for the weekend!"
          />

          <HotelBlock
            name="Embassy Suites San Diego Bay Downtown"
            addressLine1="601 Pacific Hwy"
            addressLine2="San Diego, CA 92101"
            description="A centrally located waterfront hotel offering spacious accommodations and beautiful views of the bay. With comfortable rooms and easy access to downtown San Diego, it’s a relaxed and convenient option for the wedding weekend."
          />
        </section>

        <Divider />

        {/* TO THE VENUE */}
        <section>
          <h2 className="font-header font-header--small" style={sectionTitleStyle}>
            To The Venue
          </h2>

          <div
            className="font-subheader"
            style={{
              marginTop: 16,
              letterSpacing: "0.20em",
              opacity: 0.75,
              textTransform: "uppercase",
              lineHeight: 1.9,
              textAlign: "center",
              fontSize: "clamp(14px, 2.6vw, 16px)",
              maxWidth: 680,
              marginInline: "auto",
            }}
          >
            Our ceremony will begin at 5:30
            <br />
            We kindly ask guests to arrive between 5:00–5:15 PM to allow time for walking
            from parking and getting seated.
          </div>

          <VenueDetail
            label="Parking:"
            text="There will be parking available near the venue. Please note that it is approximately a 5–10 minute walk from the parking area to the venue entrance."
          />

          <VenueDetail
            label="Rideshare:"
            text="If you prefer to rideshare (Uber/Lyft), you may be dropped off directly at the venue entrance for added convenience."
          />

          <VenueDetail
            label="Shuttle:"
            text="We will be providing shuttle service from both hotels to the venue, as well as return shuttles back to the hotels at the end of the evening. Shuttle departure times will be shared closer to the wedding date."
          />          
        </section>
      </Container>
    </main>
  );
}