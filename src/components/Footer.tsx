export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200 px-4 py-10 bg-white">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm text-gray-500">
          © {new Date().getFullYear()} Task Tracker. All rights reserved.
        </p>
        <p className="m-0 text-sm text-gray-400">
          Syncing with Job_Hunt_Tracker.xlsx
        </p>
      </div>
    </footer>
  )
}
