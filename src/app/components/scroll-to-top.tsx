"use client";

export function ScrollToTop() {
  function handleClick() {
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      onClick={handleClick}
      className="fixed top-8 left-8 z-20 text-xl text-[#1A1A1A] cursor-pointer bg-transparent border-none p-0"
      aria-label="Back to top"
    >
      ☽
    </button>
  );
}
