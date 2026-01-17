import Image from "next/image";
import Container from "react-bootstrap/Container";

export default function Page() {
  return (
    <main style={{ minHeight: "100svh", display: "flex" }}>
      <Container fluid style={{ padding: 0 }}>
        <div
          style={{
            width: "100%",
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top watercolor image */}
          <div
            className="mx-auto w-100 w-md-75 w-lg-50"
            style={{
              position: "relative",
              height: "26svh",     // ⬅️ smaller than 32svh
              minHeight: 170,      // ⬅️ smaller
              maxHeight: 280,      // ⬅️ smaller
              overflow: "hidden",
              background: "#fbfaf7",
            }}
          >
            <Image
              src="/koi-bright.png"
              alt="koi fish"
              fill
              priority
              style={{
                objectFit: "contain",
                objectPosition: "center",
                opacity: "70%",
              }}
            />
          </div>

          {/* Content panel */}
          <div
            style={{
              flex: 1,
              background: "#fbfaf7",
              textAlign: "center",
              padding: "28px 18px 28px", // ⬅️ was 48px 22px 54px
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start", // ⬅️ pulls text up
              color: "#544f44",
            }}
          >
            <h1
              className="font-header font-header--hero"
              style={{                
                lineHeight: 1.05,
                marginBottom: 12, // ⬅️ tighter
              }}
            >
              Welcome to our Wedding Website!
            </h1>

            <p className="font-subheader" style={{ fontSize: 16, marginBottom: 14 }}>
              We&apos;re so glad you&apos;re here!
            </p>

            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <p style={{ fontSize: 16, marginBottom: 10 }}>
                This site has everything you’ll need for the weekend, including event details,
                travel information, and RSVP.
              </p>
              <p style={{ fontSize: 16, marginBottom: 12 }}>
                Please check back as we get closer to the date.
              </p>
            </div>

            <p style={{ marginTop: 10, marginBottom: 6, fontSize: 16 }}>
              We can’t wait to see you!
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: 10,
                marginTop: 6,
              }}
            >
              <span style={{ fontSize: 18, opacity: 0.7 }}>—</span>
              <span
                className="font-header"
                style={{
                  fontSize: "clamp(40px, 5vw, 58px)",
                  lineHeight: 1,
                }}
              >
                Grant &amp; Raye
              </span>
            </div>

            <div style={{ marginTop: 14 }}>
              <a
                href="/rsvp"
                className="btn btn-primary"
                style={{
                  borderRadius: 999,
                  padding: "10px 26px",
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
