import Image from "next/image";
import Container from "react-bootstrap/Container";

export default function Page() {
  return (
    <main style={{ minHeight: "100svh", display: "flex" }}>
      <Container fluid style={{ padding: 0 }}>
        <div style={{ width: "100%", minHeight: "100svh", display: "flex", flexDirection: "column" }}>
          
          {/* Top watercolor image (responsive + same paper background) */}
          <div
            className="mx-auto w-100 w-sm-100 w-md-75 w-lg-50"
            style={{
              position: "relative",
              height: "32svh",     // smaller than 40svh
              minHeight: 200,
              maxHeight: 340,
              overflow: "hidden",
              background: "#fbfaf7",  // ✅ removes “white background” look
            }}
          >
            <Image
              src="/watercolor-garden.png"
              alt="Watercolor garden header"
              fill
              priority
              style={{
                objectFit: "contain",     // ✅ no weird crop; keeps full art
                objectPosition: "center", // ✅ centered
              }}
            />
          </div>

          {/* Content panel */}
          <div
            style={{
              flex: 1,
              background: "#fbfaf7",
              textAlign: "center",
              padding: "48px 22px 54px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              color: "#544f44",
            }}
          >
            <h1
              className="font-header"
              style={{
                fontSize: "clamp(42px, 5vw, 64px)",
                lineHeight: 1.05,
                marginBottom: 18,
              }}
            >
              Welcome to our Wedding Website!
            </h1>

            <p className="font-subheader" style={{ fontSize: 18, marginBottom: 22 }}>
              We&apos;re so glad you&apos;re here!
            </p>

            <div style={{ maxWidth: 760, margin: "0 auto" }}>
              <p style={{ fontSize: 18, marginBottom: 14 }}>
                This site has everything you’ll need for the weekend, including event details,
                travel information, and RSVP.
              </p>
              <p style={{ fontSize: 18 }}>Please check back as we get closer to the date.</p>
            </div>

            <p style={{ marginTop: 26, fontSize: 18 }}>We can’t wait to see you!</p>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 14, marginTop: 10 }}>
              <span style={{ fontSize: 22, opacity: 0.7 }}>—</span>
              <span className="font-header" style={{ fontSize: "clamp(44px, 5vw, 64px)", lineHeight: 1 }}>
                Grant &amp; Raye
              </span>
            </div>

            <div style={{ marginTop: 26 }}>
              <a
                href="/rsvp"
                className="btn btn-primary"
                style={{
                  borderRadius: 999,
                  padding: "10px 28px",
                  backgroundColor: "#544f44",
                  borderColor: "#544f44",
                }}
              >
                RSVP
              </a>
            </div>
          </div>

        </div>
      </Container>
    </main>
  );
}
