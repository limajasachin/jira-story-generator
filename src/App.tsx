import { Outlet, Route, Routes, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Landing from "./pages/Landing";
import BoardPage from "./pages/BoardPage";
import NotFound from "./pages/NotFound";

function Header() {
  const { pathname } = useLocation();

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundImage: "var(--brand-gradient)" }}
          />
          Storyboard
        </Link>
        <Button asChild variant="ghost" size="sm">
          <Link to={pathname === "/" ? "/board" : "/"}>
            {pathname === "/" ? "Open board" : "New idea"}
          </Link>
        </Button>
      </div>
    </header>
  );
}

function BoardLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<BoardLayout />}>
        <Route path="/board" element={<BoardPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
