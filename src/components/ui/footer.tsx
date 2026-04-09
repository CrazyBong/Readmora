/* eslint-disable @next/next/no-img-element */
'use client';

import Button from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import {
  TwitterLogo,
  GithubLogo,
  InstagramLogo,
  LinkedinLogo,
  FacebookLogo,
} from '@phosphor-icons/react';

interface FooterProps {
  brandName: string;
  logoUrl?: string;
  socialLinks: Array<{
    icon: 'twitter' | 'github' | 'instagram' | 'linkedin' | 'facebook';
    href: string;
    label: string;
  }>;
  mainLinks: Array<{
    href: string;
    label: string;
  }>;
  legalLinks: Array<{
    href: string;
    label: string;
  }>;
  copyright: {
    text: string;
    license?: string;
  };
}

const IconMap = {
  twitter: <TwitterLogo className="h-5 w-5" />,
  github: <GithubLogo className="h-5 w-5" />,
  instagram: <InstagramLogo className="h-5 w-5" />,
  linkedin: <LinkedinLogo className="h-5 w-5" />,
  facebook: <FacebookLogo className="h-5 w-5" />,
};

export function Footer({
  brandName,
  logoUrl,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  return (
    <footer className="pb-6 pt-16 lg:pb-8 lg:pt-24">
      <div className="px-4 lg:px-8">
        <div className="md:flex md:items-start md:justify-between">
          <div className="flex items-center gap-x-2">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-32 md:h-48 w-auto object-contain" />
            ) : (
              <>
                <BookOpen className="h-8 w-8 text-[color:var(--color-primary)]" />
                <span className="font-bold text-xl">{brandName}</span>
              </>
            )}
          </div>
          <ul className="flex list-none mt-6 md:mt-0 space-x-3">
            {socialLinks.map((link, i) => (
              <li key={i}>
                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full" asChild>
                  <a
                    href={link.href}
                    target="_blank"
                    aria-label={link.label}
                    rel="noopener noreferrer"
                  >
                    {IconMap[link.icon]}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t mt-6 pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10">
          <nav className="lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end">
              {mainLinks.map((link, i) => (
                <li key={i} className="my-1 mx-2 shrink-0">
                  <a
                    href={link.href}
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="my-1 mx-3 shrink-0">
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 text-sm leading-6 text-muted-foreground lg:mt-0 lg:row-[1/3] lg:col-[1/4]">
            <div>
              © {new Date().getFullYear()} {brandName}
            </div>
            {copyright.license && <div>{copyright.license}</div>}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
