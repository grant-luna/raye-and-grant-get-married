import Image from "next/image";
import Container from "react-bootstrap/Container";

export default function Page() {
  return (
    <main className="home-page">
      <Container className="home-shell">
        {/* Top watercolor image */}
        <div className="home-art">
          <Image
            src="/images/home-hero.jpg"
            alt="Watercolor garden header"
            fill
            priority
            className="home-art-img"
          />
        </div>

        {/* Paper content */}
        <div className="home-card">
          <h1 className="font-header home-title">Welcome to our Wedding Website!</h1>

          <p className="font-subheader home-subtitle">
            We're so glad you're here!
          </p>

          <div className="home-body">
            <p>
              This site has everything you’ll need for the weekend, including event details,
              travel information, and RSVP.
            </p>
            <p>Please check back as we get closer to the date.</p>
          </div>

          <p className="home-closing">We can’t wait to see you!</p>

          <div className="home-signature">
            <span className="home-dash">—</span>
            <span className="font-header home-names">Grant &amp; Raye</span>
          </div>

          {/* Optional: a Bootstrap button that matches your palette */}
          <div className="home-cta">
            <a className="btn btn-primary" href="/rsvp">
              RSVP
            </a>
          </div>
        </div>
      </Container>
    </main>
  );
}
