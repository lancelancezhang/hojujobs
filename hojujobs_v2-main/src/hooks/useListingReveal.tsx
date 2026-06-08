import { createContext, useContext, useState, type KeyboardEvent, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { trackContactRevealClick, type ListingType } from "@/lib/analytics";
import { getSiteOrigin } from "@/lib/siteUrl";
import { cn } from "@/lib/utils";

function listingRevealSessionKey(listingType: ListingType, listingId: string | number) {
  return `hoju_listing_revealed_${listingType}_${listingId}`;
}

type ListingRevealContextValue = {
  revealed: boolean;
  loading: boolean;
  handleReveal: () => void;
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  interactiveProps: {
    role?: "button";
    tabIndex?: number;
    onClick?: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
    "aria-label"?: string;
    className?: string;
  };
};

const ListingRevealContext = createContext<ListingRevealContextValue | null>(null);

export function ListingRevealProvider({
  listingType,
  listingId,
  children,
}: {
  listingType: ListingType;
  listingId: string | number;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionKey = listingRevealSessionKey(listingType, listingId);

  const [revealed, setRevealed] = useState(() => sessionStorage.getItem(sessionKey) === "1");

  const handleReveal = () => {
    if (revealed || loading) return;

    if (!user) {
      trackContactRevealClick({
        logged_in: false,
        listing_type: listingType,
        listing_id: listingId,
        user_id: null,
      });
      const returnPath = location.pathname + location.search;
      const authPath = `/auth?next=${encodeURIComponent(returnPath)}`;
      if (window.location.origin === getSiteOrigin()) {
        navigate(authPath);
      } else {
        window.location.href = `${getSiteOrigin()}${authPath}`;
      }
      return;
    }

    trackContactRevealClick({
      logged_in: true,
      listing_type: listingType,
      listing_id: listingId,
      user_id: user.id,
      revealed: true,
    });
    sessionStorage.setItem(sessionKey, "1");
    setRevealed(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (revealed) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleReveal();
    }
  };

  const interactiveProps: ListingRevealContextValue["interactiveProps"] = revealed
    ? { onKeyDown: handleKeyDown }
    : {
        role: "button",
        tabIndex: 0,
        onClick: handleReveal,
        onKeyDown: handleKeyDown,
        "aria-label": "연락처 확인하기",
        className: cn(
          "cursor-pointer",
          "transition-all duration-300 ease-out",
          "hover:border-primary/50 hover:shadow-md hover:bg-muted/20",
          "active:scale-[0.995]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        ),
      };

  return (
    <ListingRevealContext.Provider
      value={{ revealed, loading, handleReveal, handleKeyDown, interactiveProps }}
    >
      {children}
    </ListingRevealContext.Provider>
  );
}

export function useListingReveal() {
  const context = useContext(ListingRevealContext);
  if (!context) {
    throw new Error("useListingReveal must be used within ListingRevealProvider");
  }
  return context;
}

export function splitDescriptionPreview(description: string, ratio = 0.2) {
  if (!description) return { preview: "", remainder: "" };

  const previewLength = Math.max(1, Math.ceil(description.length * ratio));
  return {
    preview: description.slice(0, previewLength),
    remainder: description.slice(previewLength),
  };
}
