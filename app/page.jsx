"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Container from "react-bootstrap/Container";
import Link from "next/link";

export default function Page() {
  const [phase, setPhase] = useState("video"); 
  // "video" | "image"
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = async () => {
      try {
        await v.play();
      } catch {
        // If autoplay is blocked, skip straight to the image
        setPhase("image");
      }
    };

    tryPlay();
  }, []);

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
          {/* Top hero: smooth crossfade from video to image */}
          <div
            className="mx-auto w-100 w-md-75 w-lg-50"
            style={{
              position: "relative",
              height: "26svh",
              minHeight: 170,
              maxHeight: 280,
              overflow: "hidden",
              background: "#fbfaf7",
            }}
          >
            {/* Image (fades in) */}
            <Image
              src="/koi-bright.png"
              alt="Raye and Grant Get Married"
              fill
              priority
              style={{
                objectFit: "contain",
                objectPosition: "center",
                opacity: phase === "image" ? 0.7 : 0,
                transition: "opacity 700ms cubic-bezier(.22,.61,.36,1)",
              }}
            />
          
            {/* Video (fades out) */}
            {phase === "video" && (
              <video
                ref={videoRef}
                src="/koi-video.mp4"
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={() => setPhase("image")}
                onError={() => setPhase("image")}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center",
                  opacity: phase === "video" ? 0.7 : 0,
                  transition: "opacity 700ms cubic-bezier(.22,.61,.36,1)",
                }}
              />
            )}
          </div>

          {/* Content panel */}
          <div
            style={{
              flex: 1,
              background: "#fbfaf7",
              textAlign: "center",
              padding: "28px 18px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              color: "#544f44",
            }}
          >
            <h1
              className="font-header font-header--hero"
              style={{
                lineHeight: 1.05,
                marginBottom: 35,
              }}
            >
              Welcome to our Wedding Website!
            </h1>

            <p className="font-subheader" style={{ fontSize: 16, marginBottom: 14 }}>
              We&apos;re so glad you&apos;re here!
            </p>

            <Link href="/rsvp" className="rsvp-button">
              Submit Your RSVP
            </Link>

            <div style={{ maxWidth: 700, margin: "0 auto", marginTop: 14 }}>
              <p style={{ fontSize: 16, marginBottom: 10 }}>
                This site has everything you’ll need for the weekend, including event details,
                travel information, and RSVP&apos;s.
              </p>
              <p style={{ fontSize: 16, marginBottom: 12 }}>
                Please check back in as we get closer to the date for more information about the weekend.
              </p>
            </div>

            <p style={{ marginTop: 10, marginBottom: 25, fontSize: 16 }}>
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
                Raye &amp; Grant
              </span>
            </div>
          </div>
        </div>
      </Container>

      {/* Button hover/tap: enlarge (no black hover) */}
      <style jsx global>{`
        .rsvp-button {
          display: inline-block;
          text-decoration: none;
          transform: translateZ(0);
          transition: transform 180ms ease;
        }
        .rsvp-button:hover {
          transform: scale(1.06);
        }
        .rsvp-button:active {
          transform: scale(1.08);
        }
      `}</style>
    </main>
  );
}