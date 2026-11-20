// Each page eases in (instead of snapping) when you move between pages.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="haad-page">{children}</div>;
}
