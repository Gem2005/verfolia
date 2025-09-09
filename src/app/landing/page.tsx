"use client";

import { useSession, signIn, signOut } from "next-auth/react";
export const dynamic = "force-dynamic";

const LandingPage = () => {
  const sessionResult: any = useSession && typeof useSession === 'function' ? useSession() : undefined;
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const isAuthenticated = status === "authenticated" && !!session;

  return (
    <div>
      <style>{`
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #0f0f0f;
      color: #fff;
      text-align: center;
    }

    .hero {
      padding: 100px 20px;
    }

    h1 {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 20px;
    }

    p {
      font-size: 1.2rem;
      max-width: 600px;
      margin: 0 auto 30px;
    }

    .btn {
      display: inline-block;
      padding: 12px 24px;
      margin: 10px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 12px;
      cursor: pointer;
      transition: 0.3s;
    }

    .btn-dark {
      background: #111;
      color: #fff;
      border: 1px solid #333;
    }

    .btn-dark:hover {
      background: #222;
    }

    .btn-blue {
      background: linear-gradient(135deg, #4facfe, #00f2fe);
      color: #fff;
      border: none;
      text-decoration: none;
      display: inline-block;
    }

    .btn-blue:hover {
      opacity: 0.9;
    }

    #upload-section { display: none; }
    #upload-section.show { display: block; }
      `}</style>
      <div className="hero">
        <h1>
          Build smarter.
          <br />
          Apply faster.
          <br />
          Track everything.
        </h1>
        <p>
          Verfolia is on a mission to bring transparency to your career. Build your profile, share your link, 
          and track who’s engaging with your story.
        </p>

        {!isAuthenticated ? (
          <button className="btn btn-dark" onClick={() => signIn("google")}>Sign in with Google</button>
        ) : (
          <button className="btn btn-dark" onClick={() => signOut()}>Sign out</button>
        )}

        <div id="upload-section" className={isAuthenticated ? "show" : ""}>
          <button className="btn btn-dark" onClick={() => (window.location.href = "/create-resume")}>🚀 Get Started Free</button>
          <a href="/upload-resume" className="btn btn-blue">📄 Upload PDF</a>
          <input type="file" id="pdf-upload" accept="application/pdf" hidden />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;


