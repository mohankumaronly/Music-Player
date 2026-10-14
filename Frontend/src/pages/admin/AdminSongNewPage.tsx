import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function AdminSongNewPage() {
  const navigate = useNavigate();
  useEffect(() => {
    // The upload flow lives in a modal on the songs page.
    // Redirect there — the page can open the modal via query param later.
    navigate("/admin/songs", { replace: true });
  }, [navigate]);
  return null;
}