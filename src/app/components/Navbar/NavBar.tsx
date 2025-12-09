"use client";

import { useEffect, useState, useRef } from "react";
// Next.js
import Image from "next/image";
import Link from "next/link";
// Assets
import LogoImg from "@/app/assets/runclubs__logo.svg";
import { LucideMoveLeft } from "lucide-react";

interface NavBarProps {
  backTo: string;
  isBackToClubPage?: boolean;
}

function NavBar({ backTo, isBackToClubPage }: NavBarProps) {
  const [isScrolled, setScrolled] = useState(false);
  const lastScrollDownY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.pageYOffset;

      // Scrolling down - trigger immediately
      if (currentY > lastScrollDownY.current) {
        lastScrollDownY.current = currentY;
        if (currentY > 100) setScrolled(true);
      }
      // Scrolling up - trigger after 100px difference
      else if (currentY < lastScrollDownY.current) {
        if (lastScrollDownY.current - currentY > 100) {
          setScrolled(false);
          lastScrollDownY.current = currentY;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`siteNav fp container ${isScrolled ? "siteNav--scrolled" : ""}`}>
      <Link href={backTo} className="back-link" aria-label="Back to previous page">
        <div className="icon-carousel-anim left">
          <LucideMoveLeft width={24} height={24} strokeWidth={1.5} className="icon-main" />
          <LucideMoveLeft width={24} height={24} strokeWidth={1.5} className="icon-hovered" />
        </div>
        {isBackToClubPage ? "Back to club" : "All clubs"}
      </Link>
      <Link className="siteNav__logo" href={"/"}>
        <Image
          src={LogoImg}
          alt="Link to home page. Run clubs Estonia logo"
          width={64}
          height={64}
          className=""
          priority
        />
      </Link>
    </nav>
  );
}

export default NavBar;
