import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="text-lg">
          This privacy policy explains how we collect, use, and protect your personal information when you use our apps.
        </p>
        <h2 className="text-2xl font-semibold">Information We Collect</h2>
        <p>
          We may collect information such as your name, email address, and usage data to provide our services.
        </p>
        <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
        <p>
          Your information is used to improve our services, communicate with you, and comply with legal obligations.
        </p>
        <h2 className="text-2xl font-semibold">Contact Us</h2>
        <p>
          If you have any questions about this privacy policy, please contact us at [your email].
        </p>
        <Link
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          href="/"
        >
          Back to Home
        </Link>
      </main>
    </div>
  );
}
