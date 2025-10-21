import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeaturedProducts } from "@/components/products/featured-products";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ShoppingBag, TruckIcon, ShieldCheck, Headphones } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Welcome to Online Shop
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90">
                Discover amazing products at unbeatable prices. Shop the latest
                trends and enjoy fast, reliable delivery.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/products">Shop Now</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/categories">Browse Categories</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center">
                <ShoppingBag className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Wide Selection</h3>
                <p className="text-muted-foreground">
                  Thousands of products across multiple categories
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <TruckIcon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
                <p className="text-muted-foreground">
                  Quick and reliable shipping to your doorstep
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <ShieldCheck className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
                <p className="text-muted-foreground">
                  Safe and secure checkout with multiple payment options
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Headphones className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Our team is here to help you anytime
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
            <FeaturedProducts />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Shopping?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of satisfied customers today
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/register">Create an Account</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
