"use client";

import Container from "react-bootstrap/Container";

export default function FAQsPage() {
  const ink = "#544f44";

  const sectionSpacing = {
    marginBottom: 64,
  };

  const questionStyle = {
    fontSize: 16,
    letterSpacing: "0.18em",
    marginBottom: 18,
    textTransform: "uppercase",
  };

  const bodyStyle = {
    fontFamily: "var(--font-body)",
    fontSize: 18,
    fontStyle: "italic",
    lineHeight: 1.9,
    opacity: 0.75,
    maxWidth: 640,
    margin: "0 auto",
  };

  const labelStyle = {
    marginTop: 32,
    fontSize: 15,
    letterSpacing: "0.16em",
    opacity: 0.7,
  };

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
        <h1
          className="font-header"
          style={{
            marginBottom: 72,
            color: ink,
            fontSize: "clamp(72px, 10vw, 120px)",
            lineHeight: 1.02,
          }}
        >
          Frequently Asked
          <br />
          Questions
        </h1>

        {/* QUESTION 1 */}
        <section style={sectionSpacing}>
          <div className="font-subheader" style={questionStyle}>
            What should I wear?
          </div>

          <p style={bodyStyle}>
            We ask that you wear Garden Cocktail Attire—elevated but
            comfortable and well-suited for an outdoor celebration.  Expect warm weather and a garden setting, so lighter colors and
            breathable materials will feel right at home.
          </p>

          <div className="font-subheader" style={labelStyle}>
            Menswear:
          </div>
          <p style={bodyStyle}>
            Lightweight suits in linen, cotton, or tropical wool. Don’t shy
            away from colors, patterns, or textured fabrics—ties are optional.
          </p>

          <div className="font-subheader" style={labelStyle}>
            Womenswear:
          </div>
          <p style={bodyStyle}>
            Knee-length to long dresses or elevated jumpsuits. Florals, prints,
            soft textures, and colorful styles are encouraged, along with
            dressy sandals, heels, or elevated flats.
          </p>
        </section>

        {/* QUESTION 2 */}
        <section style={sectionSpacing}>
          <div className="font-subheader" style={questionStyle}>
            What time should I arrive for the ceremony?
          </div>

          <p style={bodyStyle}>
            The gardens will be open to guests starting at 5:00pm, and the
            ceremony will begin promptly at 5:30.
            <br />
            <br />
            Shuttles will be available from the parking lot to the garden
            entrance.
            <br />
            <br />
            If parking in Balboa Park, we recommend arriving 15 minutes early
            to ensure you’ll have time to park and get to the venue.
          </p>
        </section>

        {/* QUESTION 3 */}
        <section>
          <div className="font-subheader" style={questionStyle}>
            Can I bring someone who isn’t on my invitation?
          </div>

          <p style={bodyStyle}>
            Please reach out to us to see if we’ll have room to accommodate an
            extra person.
          </p>
        </section>
      </Container>
    </main>
  );
}
