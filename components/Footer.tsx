import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Shop By Category */}
          <div className="space-y-4">
            <h3 className="font-semibold">Shop By Category</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>
                <Link href="/category/new-arrivals">New Arrivals</Link>
              </li>
              <li>
                <Link href="/category/workwear">Workwear</Link>
              </li>
              <li>
                <Link href="/category/dresses">Dresses</Link>
              </li>
              <li>
                <Link href="/category/evening-wear">Evening Wear</Link>
              </li>
              <li>
                <Link href="/category/accessories">Accessories</Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Information</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/feedback">Submit Feedback</Link>
              </li>
              <li>
                <Link href="/club">Indra Club</Link>
              </li>
              <li>
                <Link href="/events">Events</Link>
              </li>
              <li>
                <Link href="/size-guide">Size Guide</Link>
              </li>
              <li>
                <Link href="/blogs">Blogs</Link>
              </li>
            </ul>
          </div>

          {/* Terms */}
          <div className="space-y-4">
            <h3 className="font-semibold">Term of Use</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>
                <Link href="/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/returns">Shipping & Returns</Link>
              </li>
              <li>
                <Link href="/account/track">Track Orders</Link>
              </li>
            </ul>
          </div>

          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-semibold">Shop By Brand</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>
                <Link href="/category/new-arrivals">Indra Dress Point</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Join our Newsletter</h3>
            <p className="text-sm text-gray-700">
              Be the First to Discover New Collections & Exclusive Offers
            </p>

            <div className="w-full max-w-md">
              <NewsletterForm />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50"
              >
                <Facebook className="w-5 h-5" />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <div className="text-sm text-gray-700 text-center md:text-left">
            © {new Date().getFullYear()} Indra Dress Point
          </div>

          <div className="flex justify-center">
            <a
              href="https://www.payhere.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <img
                src="https://www.payhere.lk/downloads/images/payhere_long_banner_dark.png"
                alt="PayHere"
                width={500}
                className="max-w-full h-auto"
              />
            </a>
          </div>

          <div className="flex justify-center md:justify-end gap-3">
            <button className="border rounded-lg px-4 py-2 text-sm">
              EN ▾
            </button>
            <button className="border rounded-lg px-4 py-2 text-sm">
              LKR ▾
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}