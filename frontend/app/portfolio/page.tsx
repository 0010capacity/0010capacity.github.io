import Link from "next/link";

export default function Portfolio() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-4xl font-bold">My Portfolio</h1>
        <p className="text-lg text-center">
          Here are some of my projects and works.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for portfolio items */}
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold">Project 1</h2>
            <p>Description of project 1.</p>
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold">Project 2</h2>
            <p>Description of project 2.</p>
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold">Project 3</h2>
            <p>Description of project 3.</p>
          </div>
        </div>
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
