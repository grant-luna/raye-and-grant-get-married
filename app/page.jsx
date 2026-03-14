"use client";

import Image from "next/image";
import Container from "react-bootstrap/Container";
import Link from "next/link";

export default function Page() {
  return (
    <main className="home-page">
      <Container fluid className="p-0">
        <section className="home-hero">
          <div className="home-hero__inner">
            <p className="font-subheader home-hero__kicker">
              Welcome to our Wedding Website!
            </p>

            <h1 className="font-header home-hero__title">Raye &amp; Grant</h1>

            <div className="font-subheader home-hero__date">
              August 22nd, 2026
            </div>

            <div className="home-hero__visual">
              <div className="home-hero__image-frame">
                <Image
                  src="/expanded venue 2.png"
                  alt="Wedding venue illustration"
                  fill
                  priority
                  className="home-hero__image"
                />
              </div>

              <div className="home-hero__button-row">
                <Link href="/rsvp" className="home-hero__button">
                  Submit your RSVP
                </Link>
              </div>
            </div>

            <div className="home-hero__copy">
              <p className="home-hero__text">
                This site has everything you’ll need for the weekend,
                including event details, travel information, and RSVPs.
                Please check back in as we get closer to the date for more
                information about the weekend.
              </p>

              <p className="home-hero__text home-hero__text--last">
                We can’t wait to see you!
              </p>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
