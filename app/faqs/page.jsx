"use client";

import Container from "react-bootstrap/Container";

export default function FAQsPage() {
  const ink = "#544f44";

  const sectionSpacing = {
    marginBottom: 64,
  };

  const questionStyle = {
    fontSize: 20,
    letterSpacing: "0.18em",
    marginBottom: 6,
    textTransform: "uppercase",
  };

  const bodyStyle = {
    fontFamily: "var(--font-body)",
    fontSize: 18,
    fontStyle: "italic",
    lineHeight: 1.5,
    opacity: 0.75,
    maxWidth: 640,
    margin: "0 auto",
  };

  const labelStyle = {
    marginTop: 16,
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
          paddingTop: "clamp(25px, 10vw, 60px)",
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
            fontSize: "clamp(55px, 10vw, 80px)",
            lineHeight: 1.02,
          }}
        >
          Frequently Asked Questions
        </h1>

        {/* QUESTION 1 */}
        <section style={sectionSpacing}>
          <div className="font-subheader" style={questionStyle}>
            What should I wear?
          </div>

          <p style={bodyStyle}>
            We ask that you dress in Garden Cocktail Attire
            
            Dress comfortably for an outdoor celebration, and expect warm weather and a garden setting. Breathable fabrics, white or light colors, and prints are encouraged!
          </p>

          <div className="font-subheader" style={labelStyle}>
            Menswear:
          </div>
          <p style={bodyStyle}>
            Breathable, linen or cotton suits, dress shirts, or sport coats. Don’t shy away from colors, patterns, or textured fabrics! Ties optional.
          </p>

          <div className="font-subheader" style={labelStyle}>
            Womenswear:
          </div>
          <p style={bodyStyle}>
            Knee-length to long dresses, or elevated jumpsuits. 
            Florals, soft textures, and colorful styles are encouraged, along with dressy sandals, heels, or elevated flats.
          </p>
        </section>

        {/* QUESTION 2 */}
        <section style={sectionSpacing}>
          <div className="font-subheader" style={questionStyle}>
            What time should I arrive for the ceremony?
          </div>

          <p style={{ ...bodyStyle, marginBottom: 15 }}>
            The gardens will open to guests starting at 5:00pm, and the ceremony will begin promptly at 5:30pm.
          </p>

          <p style={bodyStyle}>                                                
            If parking in Balboa Park, we recommend arriving 15 minutes early
            to ensure you’ll have time get from the lot to the venue.
          </p>
        </section>

        {/* QUESTION 3 */}
        <section style={sectionSpacing}>
          <div className="font-subheader" style={questionStyle}>
            How should I get to the venue?
          </div>

          <p style={bodyStyle}>
            Parking will be available at the Organ Pavillion Parking lot for guests choosing to drive themselves. 
            A shuttle will be taking guests from the hotel to the venue, or a rideshare may drop guests off directly to the venue entrance. 
            Please refer to the Travel section of our website for more details on transportation.
          </p>
        </section>

        {/* QUESTION 4 */}
        <section style={sectionSpacing}>
          <div className="font-subheader" style={questionStyle}>
            Where should I stay?
          </div>

          <p style={bodyStyle}>
            We have reserved a hotel block for you at the Marriott Marquis San Diego Marina. Please refer to
            the Travel section of our website for more details on accommodations.
          </p>
        </section>

        {/* QUESTION 5 */}
        <section style={sectionSpacing}>
          <div className="font-subheader" style={questionStyle}>
            Can I bring someone who isn’t on my invitation?
          </div>

          <p style={bodyStyle}>
            Please reach out to us to see if we’ll have room to accommodate an
            extra guest.
          </p>
        </section>
      </Container>
    </main>
  );
}
